import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import client from '../api/client';
import './ChallengeSolver.css';

const ChallengeSolver = () => {
    const { id } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState('// Write your code here');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const { data } = await client.get(`/challenges/${id}`);
                setChallenge(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id]);

    const handleSubmit = async () => {
        try {
            setOutput('Submitting...');
            const { data } = await client.post('/submissions', {
                challengeId: id,
                code,
                language,
            });
            setOutput(`Submission ID: ${data.id}\nStatus: ${data.status}\n(Check console/network for polling implementation)`);
        } catch (err) {
            setOutput('Error submitting code');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!challenge) return <div>Challenge not found</div>;

    return (
        <div className="solver-container">
            <div className="problem-description">
                <h2>{challenge.title}</h2>
                <p>{challenge.description}</p>
            </div>
            <div className="editor-container">
                <div className="editor-header">
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                    <button onClick={handleSubmit} className="btn-primary">Submit</button>
                </div>
                <Editor
                    height="80vh"
                    theme="vs-dark"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value)}
                />
                <div className="output-panel">
                    <h3>Output</h3>
                    <pre>{output}</pre>
                </div>
            </div>
        </div>
    );
};

export default ChallengeSolver;
