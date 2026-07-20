import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [testName, setTestName] = useState('');
  const [language, setLanguage] = useState('ru');
  const [importAllSheets, setImportAllSheets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке файла');
    } finally {
      setLoading(false);
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

      <div className="glass-card p-8">
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
    </motion.div>
  );
};

export default UploadPage;
