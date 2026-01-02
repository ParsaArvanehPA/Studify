import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Breadcrumb } from '../components/Breadcrumb';
import { SessionCard } from '../components/SessionCard';
import { DocumentViewer } from '../components/DocumentViewer';
import { studyData, type StudyFile } from '../data/structure';

export function CoursePage() {
  const { semesterId, courseId } = useParams<{ semesterId: string; courseId: string }>();
  const [selectedFile, setSelectedFile] = useState<StudyFile | null>(null);

  const semester = studyData.find((s) => s.id === semesterId);
  const course = semester?.courses.find((c) => c.id === courseId);

  if (!semester || !course) {
    return <Navigate to="/" replace />;
  }

  const totalFiles = course.sessions.reduce((acc, sess) => acc + sess.files.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: semester.name, path: `/semester/${semester.id}`, icon: semester.icon },
            { label: course.name, icon: course.icon }
          ]}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg shrink-0`}>
            <span className="text-3xl">{course.icon}</span>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {course.name}
            </h1>
            {course.description && (
              <p className="text-gray-400 mt-1">{course.description}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {course.sessions.length} sessions • {totalFiles} study files
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-3 h-3 rounded bg-indigo-500/50"></div>
            <span>Study Guides</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-3 h-3 rounded bg-amber-500/50"></div>
            <span>Exam Cram / Quick Review</span>
          </div>
        </div>
      </motion.div>

      {/* Sessions Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-white mb-6">Sessions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {course.sessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              courseColor={course.color}
              index={index}
              onFileClick={setSelectedFile}
            />
          ))}
        </div>
      </motion.div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
}
