import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, ExternalLink, BarChart3 } from 'lucide-react';
import api from '../api/axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [filterTest, setFilterTest] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, testsRes] = await Promise.all([
          api.get('/results/'),
          api.get('/tests/')
        ]);
        setResults(resultsRes.data);
        setTests(testsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredResults = results.filter(r => {
    const matchSearch = r.full_name.toLowerCase().includes(search.toLowerCase()) || 
                        r.position.toLowerCase().includes(search.toLowerCase());
    const matchTest = filterTest ? r.test.toString() === filterTest : true;
    const matchDate = filterDate ? r.date === filterDate : true;
    return matchSearch && matchTest && matchDate;
  });

  const getScoreBadge = (score) => {
    if (score >= 70) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    if (score >= 40) return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Результаты тестирования</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">Просматривайте, фильтруйте и анализируйте результаты всех пройденных тестов.</p>
      </div>

      <div className="glass-card p-6 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по ФИО или должности..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="w-full md:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
          <select 
            value={filterTest}
            onChange={(e) => setFilterTest(e.target.value)}
            className="input-field pl-10"
          >
            <option value="">Все тесты</option>
            {tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        
        <div className="w-full md:w-48 relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <th className="p-4 rounded-tl-xl">ФИО / Должность</th>
                <th className="p-4">Тест</th>
                <th className="p-4">Дата</th>
                <th className="p-4 text-center">Прав / Неправ</th>
                <th className="p-4 text-center">Успеваемость</th>
                <th className="p-4 text-right rounded-tr-xl">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-600 dark:text-gray-400">Загрузка результатов...</td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-600 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <BarChart3 size={48} className="mb-4 text-gray-600" />
                      <p className="text-lg">Результаты не найдены</p>
                      <p className="text-sm">Попробуйте изменить параметры фильтрации</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResults.map((res) => (
                  <tr key={res.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{res.full_name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{res.position}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{res.test_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{res.test_language}</div>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      {format(new Date(res.date), 'dd.MM.yyyy')}
                    </td>
                    <td className="p-4 text-center font-medium">
                      <span className="text-emerald-400">{res.correct_count}</span>
                      <span className="text-gray-500 mx-1">/</span>
                      <span className="text-rose-400">{res.incorrect_count}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreBadge(res.score_percent)}`}>
                        {res.score_percent}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        to={`/results/${res.id}`} 
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-accent-600 transition-colors hover:bg-gray-200 hover:text-accent-700 dark:bg-white/5 dark:text-accent-400 dark:hover:bg-white/10 dark:hover:text-accent-300"
                      >
                        Подробнее <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsPage;
