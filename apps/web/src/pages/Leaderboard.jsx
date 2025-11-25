import { useState, useEffect } from 'react';
import client from '../api/client';
import LeaderboardTable from '../components/LeaderboardTable';
import './Leaderboard.css';

const Leaderboard = () => {
    const [mode, setMode] = useState('challenge'); // 'challenge' or 'course'
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async (id) => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const endpoint = mode === 'challenge' ? `/leaderboard/challenge/${id}` : `/leaderboard/course/${id}`;
            const { data } = await client.get(endpoint);
            setItems(data.entries || []);
        } catch (e) {
            setError('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    // When mode changes, reset selection
    useEffect(() => {
        setSelectedId('');
        setItems([]);
    }, [mode]);

    const handleSelect = (e) => {
        const id = e.target.value;
        setSelectedId(id);
        fetchData(id);
    };

    return (
        <div className="leaderboard-page">
            <h1>Leaderboard</h1>
            <div className="leaderboard-controls">
                <button
                    className={mode === 'challenge' ? 'active' : ''}
                    onClick={() => setMode('challenge')}
                >
                    Challenge
                </button>
                <button
                    className={mode === 'course' ? 'active' : ''}
                    onClick={() => setMode('course')}
                >
                    Course
                </button>
                <select value={selectedId} onChange={handleSelect} disabled={loading}>
                    <option value="">Select {mode} ID</option>
                    {/* In a real app you would fetch list of challenges/courses here. */}
                </select>
            </div>
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}
            {items.length > 0 && <LeaderboardTable entries={items} />}
        </div>
    );
};

export default Leaderboard;
