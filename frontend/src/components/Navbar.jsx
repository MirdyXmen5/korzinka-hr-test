import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, UploadCloud, PlayCircle, BarChart2, Home } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Главная', path: '/', icon: <Home size={18} /> },
    { name: 'Загрузить тест', path: '/upload', icon: <UploadCloud size={18} /> },
    { name: 'Пройти тест', path: '/start', icon: <PlayCircle size={18} /> },
    { name: 'Результаты', path: '/results', icon: <BarChart2 size={18} /> },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-200/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 rounded-none rounded-b-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center font-bold text-white shadow-lg">
                K
              </div>
              <span className="font-bold text-xl gradient-text">KRG Test</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent-500/10 text-accent-600 dark:bg-white/10 dark:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
                    }`
                  }
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
            </div>
            <ThemeToggle />
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-card rounded-none border-t-0">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-accent-500/10 text-accent-600 dark:bg-white/10 dark:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
