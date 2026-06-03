import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SemesterPage } from './pages/SemesterPage';
import { CoursePage } from './pages/CoursePage';
import { QuranExamPage } from './pages/QuranExamPage';
import { Letter53Page } from './pages/Letter53Page';
import { VocabularyPage } from './pages/VocabularyPage';

function App() {
  // basename matches Vite `base` ('/Studify/') so deep links resolve on GitHub Pages.
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="semester/:semesterId" element={<SemesterPage />} />
          <Route path="semester/:semesterId/course/:courseId" element={<CoursePage />} />
          <Route path="exam-materials" element={<QuranExamPage />} />
          <Route path="letter-53" element={<Letter53Page />} />
          <Route path="letter-53-vocabulary" element={<VocabularyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
