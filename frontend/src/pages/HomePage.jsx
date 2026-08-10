import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, ClipboardCheck, BarChart3, Users, FileText } from 'lucide-react';
import api from '../api/axios';

const HomePage = () => {
  const [stats, setStats] = useState({ tests: 0, results: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [testsRes, resultsRes] = await Promise.all([
          api.get('/tests/'),
          api.get('/results/')
        ]);
        setStats({
          tests: testsRes.data.length || 0,
          results: resultsRes.data.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="max-w-6xl mx-auto py-12 flex flex-col items-center justify-center min-h-[80vh]"
    >
      <motion.div variants={itemVariants} className="text-center mb-16 relative">
        <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-accent-500 to-purple-600 rounded-full w-[300px] h-[300px] mx-auto top-1/2 -translate-y-1/2"></div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white">
          Платформа тестирования <br/>
          <span className="gradient-text">KRG</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Создавайте, проводите и анализируйте тесты для сотрудников.<br/> 
          Простой импорт из Excel и детальная аналитика.
        </p>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16">
        <Link to="/upload">
          <motion.div variants={itemVariants} className="glass-card glass-card-hover p-8 h-full flex flex-col items-center text-center cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-accent-500 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Загрузить тест</h3>
            <p className="text-gray-600 dark:text-gray-400">Импортируйте тесты из Excel файлов за пару кликов.</p>
          </motion.div>
        </Link>

        <Link to="/start">
          <motion.div variants={itemVariants} className="glass-card glass-card-hover p-8 h-full flex flex-col items-center text-center cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
              <ClipboardCheck size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Пройти тест</h3>
            <p className="text-gray-600 dark:text-gray-400">Выберите тест и начните прохождение с учетом времени.</p>
          </motion.div>
        </Link>

        <Link to="/results">
          <motion.div variants={itemVariants} className="glass-card glass-card-hover p-8 h-full flex flex-col items-center text-center cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
              <BarChart3 size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Результаты</h3>
            <p className="text-gray-600 dark:text-gray-400">Просматривайте и анализируйте результаты сотрудников.</p>
          </motion.div>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-8 justify-center">
        <div className="flex items-center gap-3 glass-card px-6 py-4">
          <FileText className="text-accent-500" />
          <div>
            <div className="text-2xl font-bold ">{stats.tests}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Доступных тестов</div>
          </div>
        </div>
        <div className="flex items-center gap-3 glass-card px-6 py-4">
          <Users className="text-accent-500" />
          <div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.results}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Пройденных тестов</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
