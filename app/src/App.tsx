import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SemesterPage } from './pages/SemesterPage';
import { CoursePage } from './pages/CoursePage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="semester/:semesterId" element={<SemesterPage />} />
          <Route path="semester/:semesterId/course/:courseId" element={<CoursePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
