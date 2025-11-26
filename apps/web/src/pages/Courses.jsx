import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import './Courses.css';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await client.get('/courses');
                setCourses(data);
            } catch (err) {
                setError('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div className="loading">Loading courses...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="courses-page">
            <h1>My Courses</h1>
            {courses.length === 0 ? (
                <div className="empty-state">
                    <h3>📚 No Courses Available</h3>
                    <p>There are no courses available at the moment. Check back later or create a new course if you're a professor.</p>
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map((course) => (
                        <Link key={course.id} to={`/courses/${course.id}`} className="course-card">
                            <h3>{course.name}</h3>
                            <p>Code: {course.code}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Courses;
