import { Navigate, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from './store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Homework from './pages/Homework';
import Schedule from './pages/Schedule';
import Grades from './pages/Grades';
import Messages from './pages/Messages';
import Students from './pages/Students';
import News from './pages/News';
import Calendar from './pages/Calendar';
import Substitutions from './pages/Substitutions';
import Reports from './pages/Reports';

export default function App() {
  const user = useCurrentUser();
  if (!user) return <Login />;
  const canJournal = user.role === 'admin' || user.role === 'teacher';
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/substitutions" element={<Substitutions />} />
        <Route path="/reports" element={canJournal ? <Reports /> : <Navigate to="/" />} />
        <Route path="/news" element={<News />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/students" element={canJournal ? <Students /> : <Navigate to="/" />} />
        <Route path="/journal" element={canJournal ? <Journal /> : <Navigate to="/" />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
