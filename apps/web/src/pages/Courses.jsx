import { useState, useEffect } from 'react';
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
            <h1>Courses</h1>
            <ul className="courses-list">
                {courses.map((course) => (
                    <li key={course.id} className="course-item">
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Courses;
