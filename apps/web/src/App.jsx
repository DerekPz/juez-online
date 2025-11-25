import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Challenges from './pages/Challenges';
import ChallengeSolver from './pages/ChallengeSolver';
import Leaderboard from './pages/Leaderboard';
import Courses from './pages/Courses';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
          <Route path="challenge/:id" element={<ProtectedRoute><ChallengeSolver /></ProtectedRoute>} />
          <Route path="leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
