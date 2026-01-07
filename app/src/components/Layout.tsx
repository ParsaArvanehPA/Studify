import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Home, BookOpen, ScrollText } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <GraduationCap className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold gradient-text">Studify</span>
            </Link>

            <nav className="flex items-center gap-4">
              {!isHome && (
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg glass glass-hover transition-all text-sm text-gray-300 hover:text-white"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              )}
              <Link
                to="/exam-materials"
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass glass-hover transition-all text-sm text-gray-300 hover:text-white"
              >
                <ScrollText className="w-4 h-4" />
                <span className="hidden sm:inline">Exam Materials</span>
              </Link>
              <a
                href="https://drive.google.com/drive/folders/145FEzdtEZkUxRus7G_mNkKcRngqaNN44?dmr=1&ec=wgc-drive-hero-goto"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass glass-hover transition-all text-sm text-gray-300 hover:text-white"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Docs</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="glass mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              Made with ❤️ for better studying
            </p>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Studify
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
