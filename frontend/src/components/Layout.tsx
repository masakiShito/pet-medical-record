import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <h1 className="text-xl font-bold text-neutral-900">
              Pet Medical Record
            </h1>
            <nav className="flex space-x-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive('/')
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                ホーム
              </Link>
              <Link
                to="/pets"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive('/pets')
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                ペット一覧
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
