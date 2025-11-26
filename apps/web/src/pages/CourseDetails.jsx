import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { getCourseExams } from '../api/exams';
import { AuthContext } from '../context/AuthContext';
import './Courses.css';

const CourseDetails = () => {
    const { id } = useParams();
    const { token, user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch course info (assuming endpoint exists or we get it from list)
                // For now, let's just fetch exams
                const examsData = await getCourseExams(id, token);
                setExams(examsData);
                // Mock course data if endpoint missing
                setCourse({ id, title: 'Course Details' });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, token]);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="course-details-page">
            <h1>{course?.title}</h1>

            <section className="exams-section">
                <h2>Exams</h2>
                {exams.length === 0 ? (
                    <p>No exams available.</p>
                ) : (
                    <ul className="exams-list">
                        {exams.map(exam => (
                            <li key={exam.id} className="exam-item">
                                <h3>{exam.title}</h3>
                                <p>Duration: {exam.durationMinutes} mins</p>
                                <p>Start: {new Date(exam.startTime).toLocaleString()}</p>
                                <Link to={`/exam/${exam.id}`} className="btn-start-exam">
                                    Start Exam
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default CourseDetails;
