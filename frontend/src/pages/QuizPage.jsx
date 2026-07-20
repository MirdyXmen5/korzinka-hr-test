import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const QuizPage = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const startedAt = React.useRef(new Date().toISOString());

  // Protect route if no state
  if (!state || !state.fullName) {
    return <Navigate to="/start" replace />;
  }

  const submitQuiz = useCallback(async (forced = false) => {
    if (submitting) return;

    const answeredCount = Object.keys(answers).length;
    if (!forced && answeredCount < questions.length) {
      setError('Пожалуйста, ответьте на все вопросы перед завершением теста.');
      return;
    }

    setSubmitting(true);
    
    // Format answers for API
    const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
      question_id: parseInt(qId),
      selected_answer: val
    }));

    const payload = {
      test_id: parseInt(testId),
      full_name: state.fullName,
      position: state.position,
      timer_minutes: state.timerMinutes,
      started_at: startedAt.current,
      answers: formattedAnswers
    };

    try {
      const res = await api.post('/results/', payload);
      navigate(`/results/${res.data.id}`, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Ошибка при отправке результатов.');
      setSubmitting(false);
    }
  }, [answers, navigate, state, submitting, testId]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/tests/${testId}/questions/`);
        setQuestions(res.data);
        if (state.timerMinutes) {
          setTimeLeft(state.timerMinutes * 60);
        }
      } catch (err) {
        setError('Не удалось загрузить вопросы теста.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId, state.timerMinutes]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          submitQuiz(true); // Auto-submit when time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, submitting, submitQuiz]);

  const handleOptionSelect = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(prev => prev - 1);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-center">
        <AlertCircle className="mx-auto mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)} className="mt-4 px-6 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-white transition-colors">OK</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center mt-10">В этом тесте нет вопросов.</div>;
  }

  const currentQ = questions[currentIdx];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft !== null && timeLeft < 60;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">Вопрос {currentIdx + 1} из {questions.length}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{state.fullName} • {state.position}</p>
        </div>
        
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${isLowTime ? 'animate-pulse border-rose-500 bg-rose-500/20 text-rose-400' : 'glass-card border-gray-200 dark:border-white/10'}`}>
            <Clock size={20} />
            <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
        <motion.div 
          className="h-full bg-gradient-to-r from-accent-500 to-accent-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="glass-card p-6 md:p-10 mb-8"
        >
          <h3 className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed text-gray-900 dark:text-white">
            {currentQ.text}
          </h3>

          <div className="space-y-4">
            {[
              { id: 'A', text: currentQ.option_a },
              { id: 'B', text: currentQ.option_b },
              { id: 'C', text: currentQ.option_c }
            ].map(opt => opt.text ? (
              <label 
                key={opt.id}
                className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                  answers[currentQ.id] === opt.id 
                    ? 'border-accent-500 bg-accent-500/20' 
                    : 'border-gray-200 bg-gray-50 hover:border-accent-400 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/30'
                }`}
              >
                <div className="pt-0.5">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    answers[currentQ.id] === opt.id ? 'border-accent-500 bg-accent-500' : 'border-gray-400'
                  }`}>
                    {answers[currentQ.id] === opt.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </div>
                <input 
                  type="radio" 
                  name={`q-${currentQ.id}`} 
                  value={opt.id}
                  checked={answers[currentQ.id] === opt.id}
                  onChange={() => handleOptionSelect(currentQ.id, opt.id)}
                  className="hidden"
                />
                <span className="text-lg flex-1 text-gray-900 dark:text-gray-100">{opt.text}</span>
              </label>
            ) : null)}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} /> Назад
        </button>

        {currentIdx === questions.length - 1 ? (
          <button
            onClick={() => submitQuiz(false)}
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            {submitting ? 'Отправка...' : 'Завершить тест'} <Check size={20} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary flex items-center gap-2"
          >
            Далее <ChevronRight size={20} />
          </button>
        )}
      </div>
      
      {/* Question Indicators Grid */}
      <div className="mt-12">
        <div className="flex flex-wrap gap-2 justify-center">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium border transition-colors ${
                currentIdx === idx ? 'border-accent-500 bg-accent-500/20 text-accent-700 dark:border-white dark:bg-white/20 dark:text-white' : 
                answers[q.id] ? 'border-accent-500/50 bg-accent-500/20 text-accent-700 dark:text-accent-300' : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-500 dark:hover:bg-white/10'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
