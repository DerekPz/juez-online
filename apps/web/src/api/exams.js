const API_URL = 'http://localhost:3000';

export const getCourseExams = async (courseId, token) => {
  const res = await fetch(`${API_URL}/exams/course/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch exams');
  return res.json();
};

export const createExam = async (examData, token) => {
  const res = await fetch(`${API_URL}/exams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(examData),
  });
  if (!res.ok) throw new Error('Failed to create exam');
  return res.json();
};

export const getExamDetails = async (examId, token) => {
  const res = await fetch(`${API_URL}/exams/${examId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch exam details');
  return res.json();
};
