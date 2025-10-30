FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y g++ python3 coreutils && apt-get clean
WORKDIR /runner
COPY runner.sh /runner/
RUN chmod +x /runner/runner.sh
ENTRYPOINT ["/runner/runner.sh"]
