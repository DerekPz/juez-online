import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import './Courses.css';

const BrowseCourses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // We need a public endpoint or use the list endpoint which returns all courses
                // Currently list endpoint returns courses for the user.
                // We need to update the backend to support browsing all courses or add a new endpoint.
                // For now, let's assume we can get all courses.
                // Wait, the requirement says "search courses".
                // Let's use the existing list endpoint but we might need to update it to return ALL courses for browsing.
                // Actually, let's create a new endpoint /courses/browse in the backend or use a query param.
                // For now, I'll use /courses but I suspect it filters by user.
                // Let's check the backend logic for list().
                // It calls listCourses.execute({ userId, role }).
                // If role is student, it returns enrolled courses.
                // So we need a new endpoint for browsing.

                // Temporary: I'll use the same endpoint but I need to fix the backend first to allow browsing.
                // But the user asked to "search courses".

                const { data } = await client.get('/courses/browse');
                setCourses(data);
                setFilteredCourses(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const results = courses.filter(course =>
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(results);
    }, [searchTerm, courses]);

    if (loading) return <div className="loading">Loading courses...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="courses-page">
            <div className="page-header">
                <h1>Browse Courses</h1>
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="courses-grid">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="course-card">
                        <h3>{course.name}</h3>
                        <p>Code: {course.code}</p>
                        <p>Period: {course.period}</p>
                        <p>Professor: {course.professorName || 'Unknown'}</p>
                        {/* Add Enroll button if not enrolled? Or just show info */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrowseCourses;
