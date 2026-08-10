import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Trash2, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [testName, setTestName] = useState('');
  const [language, setLanguage] = useState('ru');
  const [importAllSheets, setImportAllSheets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testsLoading, setTestsLoading] = useState(true);
  const [deletingTestId, setDeletingTestId] = useState(null);
  const [tests, setTests] = useState([]);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchTests = useCallback(async () => {
    setTestsLoading(true);
    try {
      const res = await api.get('/tests/');
      setTests(res.data);
    } catch (err) {
      setError('Не удалось загрузить список тестов');
    } finally {
      setTestsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setSuccess(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    if (!importAllSheets && (!testName.trim() || !language)) {
      setError('Пожалуйста, укажите название теста и язык (или выберите импорт всех листов).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('import_all_sheets', importAllSheets);
    if (!importAllSheets) {
      formData.append('name', testName);
      formData.append('language', language);
    }

    try {
      const res = await api.post('/tests/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(`Успешно импортировано тестов: ${res.data.length}`);
      setFile(null);
      setTestName('');
      setTests(currentTests => [...res.data, ...currentTests]);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке файла');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (test) => {
    const confirmed = window.confirm(`Удалить тест "${test.name}"? Все вопросы и результаты этого теста тоже будут удалены.`);
    if (!confirmed) return;

    setDeletingTestId(test.id);
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/tests/${test.id}/`);
      setTests(currentTests => currentTests.filter(item => item.id !== test.id));
      setSuccess(`Тест "${test.name}" удален`);
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось удалить тест');
    } finally {
      setDeletingTestId(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white">Загрузить тест</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">Загрузите файл Excel (.xlsx) с вопросами для тестирования.</p>
      </div>

      <div className="glass-card p-8 mb-8">
        <form onSubmit={handleUpload} className="space-y-6">
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-accent-500 bg-accent-500/10' : 'border-gray-300 hover:border-accent-400 hover:bg-gray-100 dark:border-white/20 dark:hover:border-white/40 dark:hover:bg-white/5'
            }`}
          >
            <input {...getInputProps()} />
            
            {!file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-accent-500">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-1 text-gray-900 dark:text-white">Нажмите или перетащите файл сюда</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Поддерживаются форматы Excel (.xlsx, .xls)</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet size={32} />
                </div>
                <div>
                  <p className="text-lg font-medium text-emerald-400 mb-1">{file.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-sm text-rose-400 hover:text-rose-300 mt-2 underline"
                >
                  Удалить файл
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
            <input
              type="checkbox"
              id="importAllSheets"
              checked={importAllSheets}
              onChange={(e) => setImportAllSheets(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-accent-500 focus:ring-accent-500 dark:border-white/20 dark:bg-slate-800"
            />
            <div>
              <label htmlFor="importAllSheets" className="font-medium cursor-pointer text-gray-900 dark:text-white">Импортировать все листы автоматически</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Каждый лист в файле будет загружен как отдельный тест (язык определяется по суффиксу '(каз)')</p>
            </div>
          </div>

          {!importAllSheets && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="label-text">Название теста</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="input-field"
                  placeholder="Например: Тест для пекарей"
                />
              </div>
              <div>
                <label className="label-text">Язык</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field"
                >
                  <option value="ru">Русский</option>
                  <option value="kk">Қазақша</option>
                </select>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
              <CheckCircle2 size={20} />
              <p>{success}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!file || loading}
              className={`btn-primary flex items-center gap-2 ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
              {loading ? 'Загрузка...' : 'Загрузить и импортировать'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Загруженные тесты</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Удалите тесты, которые больше не нужны.</p>
          </div>
          <button
            type="button"
            onClick={fetchTests}
            disabled={testsLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <RefreshCw size={16} className={testsLoading ? 'animate-spin' : ''} />
            Обновить
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <th className="p-4">Название</th>
                <th className="p-4">Язык</th>
                <th className="p-4 text-center">Вопросы</th>
                <th className="p-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {testsLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-600 dark:text-gray-400">Загрузка тестов...</td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-600 dark:text-gray-400">Пока нет загруженных тестов</td>
                </tr>
              ) : (
                tests.map(test => (
                  <tr key={test.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{test.name}</div>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{test.language_display}</td>
                    <td className="p-4 text-center text-gray-700 dark:text-gray-300">{test.question_count}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteTest(test)}
                        disabled={deletingTestId === test.id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400"
                        title="Удалить тест"
                      >
                        {deletingTestId === test.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Удалить
                      </button>
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

export default UploadPage;
