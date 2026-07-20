import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Briefcase, Calendar, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import api from '../api/axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ResultDetailPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/results/${id}/`);
        setResult(res.data);
      } catch (err) {
        setError('Не удалось загрузить результаты');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error || !result) {
    return (
      <div className="text-center p-10 glass-card">
        <XCircle size={48} className="mx-auto mb-4 text-rose-500" />
        <h2 className="text-2xl font-bold mb-4">{error || 'Результат не найден'}</h2>
        <Link to="/results" className="btn-secondary inline-block">Вернуться к списку</Link>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreRing = (score) => {
    if (score >= 70) return "border-emerald-400/30";
    if (score >= 40) return "border-amber-400/30";
    return "border-rose-400/30";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Link to="/results" className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
        <ChevronLeft size={20} /> Назад к списку
      </Link>

      <div className="glass-card p-6 md:p-10 mb-8 relative overflow-hidden">
        {/* Decorative background element based on score */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-10 ${
          result.score_percent >= 70 ? 'bg-emerald-500' : result.score_percent >= 40 ? 'bg-amber-500' : 'bg-rose-500'
        }`}></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          
          <div className="space-y-4 flex-1">
            <h1 className="text-3xl font-bold">{result.full_name}</h1>
            
            <div className="grid grid-cols-1 gap-y-3 gap-x-6 text-gray-700 dark:text-gray-300 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-gray-500" /> {result.position}
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-500" /> {result.test_name} ({result.test_language})
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" /> {format(new Date(result.date), 'dd MMMM yyyy', { locale: ru })}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" /> 
                {result.timer_minutes ? `Лимит: ${result.timer_minutes} мин` : 'Без таймера'}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center mb-2 ${getScoreRing(result.score_percent)}`}>
              <span className={`text-4xl font-extrabold ${getScoreColor(result.score_percent)}`}>
                {result.score_percent}%
              </span>
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-emerald-400">{result.correct_count} прав.</span>
              <span className="text-rose-400">{result.incorrect_count} неправ.</span>
            </div>
          </div>

        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Детализация ответов</h2>

      <div className="space-y-6">
        {result.answers.map((ans, idx) => {
          const q = ans.question;
          const selected = ans.selected_answer;
          // In utils we store correct as e.g. "A" or "A,B".
          // If the user selected correctly, ans.is_correct is true.
          
          const options = [
            { id: 'A', text: q.option_a },
            { id: 'B', text: q.option_b },
            { id: 'C', text: q.option_c }
          ].filter(o => o.text);

          const correctAnswersSet = new Set(q.correct_answers.split(','));
          const selectedAnswersSet = new Set(selected.split(','));

          return (
            <div key={ans.id} className="glass-card p-6 border-l-4" style={{ borderLeftColor: ans.is_correct ? '#10b981' : '#f43f5e' }}>
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="text-lg font-medium">
                  <span className="mr-2 text-gray-500 dark:text-gray-400">{idx + 1}.</span> 
                  {q.text}
                </h3>
                <div className="flex-shrink-0 mt-1">
                  {ans.is_correct ? <CheckCircle2 className="text-emerald-500" size={24} /> : <XCircle className="text-rose-500" size={24} />}
                </div>
              </div>

              <div className="space-y-3">
                {options.map(opt => {
                  const isCorrect = correctAnswersSet.has(opt.id);
                  const isSelected = selectedAnswersSet.has(opt.id);
                  
                  let style = "border border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300";
                  let icon = null;

                  if (isCorrect && isSelected) {
                    style = "bg-emerald-500/20 border-emerald-500 text-emerald-100";
                    icon = <CheckCircle2 size={18} className="text-emerald-400" />;
                  } else if (isCorrect && !isSelected) {
                    style = "border-emerald-500/50 bg-emerald-500/10 text-gray-700 dark:text-gray-300";
                    icon = <CheckCircle2 size={18} className="text-emerald-400/50" />;
                  } else if (!isCorrect && isSelected) {
                    style = "bg-rose-500/20 border-rose-500 text-rose-100";
                    icon = <XCircle size={18} className="text-rose-400" />;
                  }

                  return (
                    <div key={opt.id} className={`flex items-center justify-between p-3 rounded-lg ${style}`}>
                      <span className="flex-1">{opt.text}</span>
                      {icon && <div className="ml-4">{icon}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ResultDetailPage;
