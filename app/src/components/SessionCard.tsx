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
      return <Zap className="w-4 h-4 text-amber-300/80" />;
    }
    return <BookOpen className="w-4 h-4 text-gray-400" />;
  };

  const getFileStyle = (fileName: string) => {
    if (fileName.toLowerCase().includes('exam') || fileName.toLowerCase().includes('cram')) {
      return 'border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/5';
    }
    return 'border-white/10 hover:border-white/20 hover:bg-white/5';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-white/5 border-b border-white/10">
        <h4 className="font-medium text-gray-200 flex items-center gap-2">
          <span className={`w-7 h-7 rounded-md bg-gradient-to-br ${courseColor} flex items-center justify-center text-xs text-white`}>
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
