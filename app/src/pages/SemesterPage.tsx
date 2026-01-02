import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Breadcrumb } from '../components/Breadcrumb';
import { CourseCard } from '../components/CourseCard';
import { studyData } from '../data/structure';

export function SemesterPage() {
  const { semesterId } = useParams<{ semesterId: string }>();
  const semester = studyData.find((s) => s.id === semesterId);

  if (!semester) {
    return <Navigate to="/" replace />;
  }

  const totalFiles = semester.courses.reduce(
    (acc, course) => acc + course.sessions.reduce(
      (sessAcc, sess) => sessAcc + sess.files.length, 0
    ), 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: semester.name, icon: semester.icon }
          ]}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${semester.color} flex items-center justify-center shadow-lg`}>
            <span className="text-3xl">{semester.icon}</span>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {semester.name}
            </h1>
            <p className="text-gray-400">
              {semester.courses.length} courses • {totalFiles} study files
            </p>
          </div>
        </div>
      </motion.div>

      {/* Courses Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-white mb-6">Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {semester.courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              semesterId={semester.id}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
