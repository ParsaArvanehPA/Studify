import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SemesterPage } from './pages/SemesterPage';
import { CoursePage } from './pages/CoursePage';
import { QuranExamPage } from './pages/QuranExamPage';
import { Letter53Page } from './pages/Letter53Page';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="semester/:semesterId" element={<SemesterPage />} />
          <Route path="semester/:semesterId/course/:courseId" element={<CoursePage />} />
          <Route path="exam-materials" element={<QuranExamPage />} />
          <Route path="letter-53" element={<Letter53Page />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
