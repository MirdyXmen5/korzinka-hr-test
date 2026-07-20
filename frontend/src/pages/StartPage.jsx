import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Briefcase, Calendar, Clock, BookOpen, Play } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../api/axios';

const StartPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    language: 'all',
    timer: null,
    testId: ''
  });

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get('/tests/');
        setTests(res.data);
      } catch (err) {
        console.error('Failed to fetch tests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const filteredTests = tests.filter(t => 
    formData.language === 'all' || t.language === formData.language
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.position || !formData.testId) return;
    
    navigate(`/quiz/${formData.testId}`, { 
      state: { 
        fullName: formData.fullName, 
        position: formData.position,
        timerMinutes: formData.timer
      }
    });
  };

  const timerOptions = [
    { value: null, label: 'Без таймера' },
    { value: 10, label: '10 минут' },
    { value: 20, label: '20 минут' },
    { value: 30, label: '30 минут' }
  ];

  const currentDate = format(new Date(), 'dd MMMM yyyy', { locale: ru });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Начать тестирование</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">Заполните данные, выберите тест и приступайте к ответам.</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text flex items-center gap-2"><User size={16} /> ФИО</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="input-field"
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div>
              <label className="label-text flex items-center gap-2"><Briefcase size={16} /> Должность</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={e => setFormData({...formData, position: e.target.value})}
                className="input-field"
                placeholder="Пекарь"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text flex items-center gap-2"><Calendar size={16} /> Дата</label>
              <input
                type="text"
                readOnly
                value={currentDate}
                className="input-field bg-white/5 opacity-70 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="label-text flex items-center gap-2"><BookOpen size={16} /> Язык тестов</label>
              <select
                value={formData.language}
                onChange={e => setFormData({...formData, language: e.target.value, testId: ''})}
                className="input-field"
              >
                <option value="all">Все языки</option>
                <option value="ru">Русский</option>
                <option value="kk">Қазақша</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-text flex items-center gap-2 mb-3"><Clock size={16} /> Ограничение по времени</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {timerOptions.map(opt => (
                <button
                  key={opt.value === null ? 'none' : opt.value}
                  type="button"
                  onClick={() => setFormData({...formData, timer: opt.value})}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    formData.timer === opt.value 
                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text">Выберите тест</label>
            {loading ? (
              <div className="input-field flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
                Загрузка тестов...
              </div>
            ) : (
              <select
                required
                value={formData.testId}
                onChange={e => setFormData({...formData, testId: e.target.value})}
                className="input-field"
              >
                <option value="" disabled>-- Выберите тест --</option>
                {filteredTests.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.name} ({test.language_display}) — {test.question_count} вопросов
                  </option>
                ))}
              </select>
            )}
            {!loading && filteredTests.length === 0 && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">Нет доступных тестов для выбранного языка.</p>
            )}
          </div>

          <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-white/10">
            <button
              type="submit"
              disabled={!formData.fullName || !formData.position || !formData.testId}
              className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Начать тест <Play size={18} />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default StartPage;
