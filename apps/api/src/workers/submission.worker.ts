import { createPgPool } from "../infrastructure/database/postgres.provider";
import { createRedisClient } from "../infrastructure/cache/redis.provider";
import { PostgresSubmissionRepo } from "../infrastructure/database/postgres/postgres-submission.repo";
import { Submission } from "../core/Submission/entities/submission.entity";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

async function runRunnerForAllTests(subId: string, challengeId: string) {
    const submissionBase = path.resolve(__dirname, "../core/Submission", subId);
    // Optional: absolute path on the HOST where submissions folders live.
    // If provided, the worker will mount host paths (left side of -v) so the
    // Docker daemon can access the files. Example: /home/azkalagon/.../apps/api/data/submissions
    const hostSubmissionsDir = process.env.HOST_SUBMISSIONS_DIR || "";
    const hostSubmissionBase = hostSubmissionsDir
        ? path.join(hostSubmissionsDir, subId)
        : submissionBase;

    const challengeTests = path.resolve(
        __dirname,
        "../../apps/api/src/core/challenges",
        challengeId,
        "tests",
    );
    // Optional: host path for challenges tests (if different from container path)
    const hostChallengesDir = process.env.HOST_CHALLENGES_DIR || "";
    const hostChallengeTests = hostChallengesDir
        ? path.join(hostChallengesDir, challengeId, "tests")
        : challengeTests;

    // Read meta.json from the container-local submission path (this path is mounted
    // into the worker via docker-compose). If meta.json is missing, we cannot proceed.
    if (!fs.existsSync(submissionBase)) return null;
    const metaPath = path.join(submissionBase, "meta.json");
    if (!fs.existsSync(metaPath)) return null;
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const lang = meta.language;
    const codeRel = meta.codeFile; // like code/solution.py

    // determine image by language
    let image = "";
    if (lang === "python") image = "juez_runner_python:local";
    else if (lang === "node" || lang === "javascript")
        image = "juez_runner_node:local";
    else if (lang === "cpp" || lang === "c++") image = "juez_runner_cpp:local";
    else if (lang === "java") image = "juez_runner_java:local";
    else return { status: "error", message: `unsupported language ${lang}` };

    // build payload that runner expects:
    // - runner will look for code at /code/<codeFile> inside container,
    // - and tests at /tests/
    const payload = {
        source_file: "/code/" + path.basename(codeRel),
        time_limit_ms: meta.timeLimit || 1500,
        // runner will find all input*.in and output*.out in /tests/
    };

    // Decide mounts. When HOST_SUBMISSIONS_DIR is set we MUST mount the host submission
    // paths for both code and tests (left side of -v must be host paths). We will not
    // attempt to probe host paths with fs.existsSync because those host paths are not
    // generally visible from inside the container. We still read meta.json from the
    // container-local submissionBase above.
    const mounts: string[] = [];

    if (hostSubmissionsDir) {
        // Always mount host submission code and tests when HOST_SUBMISSIONS_DIR provided.
        const hostCode = path.join(hostSubmissionBase, "code");
        const hostTests = path.join(hostSubmissionBase, "tests");
        mounts.push("-v", `${hostCode}:/code:ro`);
        mounts.push("-v", `${hostTests}:/tests:ro`);
    } else {
        // Fallback: mount container-local code/tests (these are visible because ./apps/api/data is mounted)
        const mountCode = path.join(submissionBase, "code");
        mounts.push("-v", `${mountCode}:/code:ro`);
        if (fs.existsSync(path.join(submissionBase, "tests"))) {
            mounts.push(
                "-v",
                `${path.join(submissionBase, "tests")}:/tests:ro`,
            );
        } else if (fs.existsSync(challengeTests)) {
            mounts.push("-v", `${challengeTests}:/tests:ro`);
        }
    }

    // If a host-level challenges dir was explicitly provided and we did not already mount host tests,
    // add it as a best-effort fallback (only used when hostSubmissionsDir is not set).
    if (!hostSubmissionsDir && hostChallengesDir && hostChallengeTests) {
        mounts.push("-v", `${hostChallengeTests}:/tests:ro`);
    }

    const args = [
        "run",
        "--rm",
        "--network",
        "none",
        "--memory",
        "512m",
        "--cpus",
        "0.5",
        ...mounts,
        image,
    ];

    console.log("[worker] running docker", args.join(" "));
    const proc = spawnSync("docker", args, {
        input: JSON.stringify(payload),
        encoding: "utf8",
        maxBuffer: 50 * 1024 * 1024,
    });

    if (proc.error) {
        console.error("[worker] docker run error", proc.error);
        return { status: "error", message: String(proc.error) };
    }
    if (proc.status !== 0) {
        console.error("[worker] runner exit code", proc.status, proc.stderr);
        // try parse stdout anyway
        try {
            return JSON.parse(proc.stdout);
        } catch (e) {
            return { status: "error", stderr: proc.stderr || proc.stdout };
        }
    }
    try {
        return JSON.parse(proc.stdout);
    } catch (e) {
        return {
            status: "error",
            message: "invalid runner output",
            raw: proc.stdout,
        };
    }
}

async function main() {
    const pool = createPgPool();
    const redis = createRedisClient();
    const repo = new PostgresSubmissionRepo(pool);

    console.log("[worker] started. Waiting for jobs...");

    const shutdown = async () => {
        console.log("\n[worker] shutting down...");
        await redis.quit();
        await pool.end();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    while (true) {
        try {
            const res = await redis.brpop("queue:submissions", 0);
            if (!res) continue;
            const subId = res[1];
            console.log("[worker] picked job", subId);

            const current = await repo.findById(subId);
            if (!current) {
                console.warn("[worker] submission not found:", subId);
                continue;
            }

            current.start();
            await repo.save(current);

            // Real execution using runner images
            const runnerResult = await runRunnerForAllTests(
                subId,
                current.challengeId,
            );
            if (!runnerResult) {
                // fallback: mark as error
                current.fail();
                await repo.save(current);
                console.log("[worker] no runner result for", subId);
                continue;
            }

            // runnerResult expected format:
            // { status: 'PARTIAL'|'ACCEPTED'|'WRONG_ANSWER'|..., timeMsTotal: 123, cases: [{caseId, status, timeMs, stderr?}, ...] }
            if (runnerResult.status === "ACCEPTED") current.accept();
            else if (
                runnerResult.status === "PARTIAL" ||
                runnerResult.status === "WRONG_ANSWER"
            )
                current.reject();
            else if (runnerResult.status === "TIME_LIMIT_EXCEEDED")
                current.fail();
            else if (runnerResult.status === "ERROR") current.fail();
            else current.fail();

            await repo.save(current);

            // optional: persist detailed result in a results table or storage (not implemented here)
            console.log(
                "[worker] done",
                subId,
                "->",
                current.status,
                runnerResult,
            );
        } catch (err: any) {
            console.error("[worker] error loop:", err.message || err);
            await new Promise((r) => setTimeout(r, 500));
        }
    }
}

main().catch((err) => {
    console.error("[worker] fatal:", err);
    process.exit(1);
});
