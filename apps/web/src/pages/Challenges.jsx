import { useState, useEffect } from 'react';
import client from '../api/client';
import ChallengeCard from '../components/ChallengeCard';
import './Challenges.css';

const Challenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const { data } = await client.get('/challenges');
                setChallenges(data);
            } catch (err) {
                setError('Failed to load challenges');
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []);

    if (loading) return <div className="loading">Loading challenges...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="challenges-page">
            <h1>Challenges</h1>
            <div className="challenges-grid">
                {challenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
            </div>
        </div>
    );
};

export default Challenges;
