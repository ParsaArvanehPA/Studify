import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen } from 'lucide-react';
import type { Semester } from '../data/structure';

interface SemesterCardProps {
  semester: Semester;
  index: number;
}

export function SemesterCard({ semester, index }: SemesterCardProps) {
  const totalFiles = semester.courses.reduce(
    (acc, course) => acc + course.sessions.reduce(
      (sessAcc, sess) => sessAcc + sess.files.length, 0
    ), 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/semester/${semester.id}`}>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="glass glass-hover rounded-2xl p-6 cursor-pointer transition-all group relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${semester.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-4">
            <span className="text-2xl">{semester.icon}</span>
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all">
            {semester.name}
          </h3>

          <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {semester.courses.length} courses
            </span>
            <span>{totalFiles} files</span>
          </div>

          {/* Course preview */}
          <div className="flex flex-wrap gap-2 mb-4">
            {semester.courses.slice(0, 3).map((course) => (
              <span
                key={course.id}
                className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-300"
              >
                {course.icon} {course.name}
              </span>
            ))}
            {semester.courses.length > 3 && (
              <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-400">
                +{semester.courses.length - 3} more
              </span>
            )}
          </div>

          {/* Action */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 group-hover:text-gray-300">
              View courses
            </span>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
