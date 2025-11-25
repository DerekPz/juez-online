import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
    const { user } = useAuth();

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Welcome to Juez Online</h1>
            <p>Master your coding skills with our challenges</p>

            {user ? (
                <div style={{ marginTop: '2rem' }}>
                    <p style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}>
                        ✓ You are logged in!
                    </p>
                    <p>Username: <strong>{user.username || 'User'}</strong></p>
                    <Link to="/challenges" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                        Start Solving Challenges
                    </Link>
                </div>
            ) : (
                <div style={{ marginTop: '2rem' }}>
                    <p>Please login or register to start solving challenges</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                        <Link to="/login" className="btn-primary" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                            Login
                        </Link>
                        <Link to="/register" className="btn-primary" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
