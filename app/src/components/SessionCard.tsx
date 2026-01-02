import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, Zap } from 'lucide-react';
import type { Session, StudyFile } from '../data/structure';

interface SessionCardProps {
  session: Session;
  courseColor: string;
  index: number;
  onFileClick: (file: StudyFile) => void;
}

export function SessionCard({ session, courseColor, index, onFileClick }: SessionCardProps) {
  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().includes('exam') || fileName.toLowerCase().includes('cram')) {
      return <Zap className="w-4 h-4 text-amber-400" />;
    }
    return <BookOpen className="w-4 h-4 text-indigo-400" />;
  };

  const getFileStyle = (fileName: string) => {
    if (fileName.toLowerCase().includes('exam') || fileName.toLowerCase().includes('cram')) {
      return 'border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10';
    }
    return 'border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className={`px-4 py-3 bg-gradient-to-r ${courseColor} bg-opacity-20`}>
        <h4 className="font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
            {index + 1}
          </span>
          {session.name}
        </h4>
      </div>

      {/* Files */}
      <div className="p-3 space-y-2">
        {session.files.map((file, fileIndex) => (
          <motion.button
            key={file.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + fileIndex * 0.02 }}
            onClick={() => onFileClick(file)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group ${getFileStyle(file.name)}`}
          >
            {getFileIcon(file.name)}
            <span className="flex-1 text-sm text-gray-300 group-hover:text-white truncate">
              {file.name}
            </span>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
