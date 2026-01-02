import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, FileText, Calendar } from 'lucide-react';
import type { Course } from '../data/structure';

interface CourseCardProps {
  course: Course;
  semesterId: string;
  index: number;
}

export function CourseCard({ course, semesterId, index }: CourseCardProps) {
  const totalFiles = course.sessions.reduce((acc, sess) => acc + sess.files.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/semester/${semesterId}/course/${course.id}`}>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="glass glass-hover rounded-2xl p-6 cursor-pointer transition-all group relative overflow-hidden h-full"
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-4`}>
            <span className="text-xl">{course.icon}</span>
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold text-white mb-2 group-hover:gradient-text transition-all line-clamp-2">
            {course.name}
          </h3>

          {course.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {course.sessions.length} sessions
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {totalFiles} files
            </span>
          </div>

          {/* Action */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-sm text-gray-400 group-hover:text-gray-300">
              View sessions
            </span>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
