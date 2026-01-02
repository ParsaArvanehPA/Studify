import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Target } from 'lucide-react';
import { SemesterCard } from '../components/SemesterCard';
import { studyData } from '../data/structure';

export function HomePage() {
  const totalCourses = studyData.reduce((acc, sem) => acc + sem.courses.length, 0);
  const totalFiles = studyData.reduce(
    (acc, sem) => acc + sem.courses.reduce(
      (courseAcc, course) => courseAcc + course.sessions.reduce(
        (sessAcc, sess) => sessAcc + sess.files.length, 0
      ), 0
    ), 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-gray-300">Your study materials, organized</span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
          <span className="text-white">Welcome to </span>
          <span className="gradient-text">Studify</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Navigate through your university courses, access study guides, and prepare for exams
          with beautifully organized content.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl px-6 py-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-white">{studyData.length}</p>
              <p className="text-sm text-gray-400">Semesters</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl px-6 py-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-white">{totalCourses}</p>
              <p className="text-sm text-gray-400">Courses</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl px-6 py-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-white">{totalFiles}</p>
              <p className="text-sm text-gray-400">Study Files</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Semesters Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
            📚
          </span>
          Your Semesters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyData.map((semester, index) => (
            <SemesterCard key={semester.id} semester={semester} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-16 glass rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold text-white mb-4">Quick Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-medium text-white">Exam Cram Mode</p>
              <p className="text-sm text-gray-400">Look for yellow-highlighted files for quick review</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <p className="font-medium text-white">Comprehensive Guides</p>
              <p className="text-sm text-gray-400">Blue files contain detailed study materials</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-medium text-white">Full Screen</p>
              <p className="text-sm text-gray-400">Press Esc to close, or use the expand button</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
