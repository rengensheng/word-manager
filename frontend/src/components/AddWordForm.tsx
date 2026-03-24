import { useState } from 'react';
import { PlusIcon, LoaderIcon, SparklesIcon } from './Icons';

interface AddWordFormProps {
  onAdd: (word: string) => Promise<void>;
  isLoading: boolean;
}

export function AddWordForm({ onAdd, isLoading }: AddWordFormProps) {
  const [word, setWord] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedWord = word.trim();
    if (!trimmedWord) {
      setError('请输入单词');
      return;
    }

    if (!/^[a-zA-Z\s\-']+$/.test(trimmedWord)) {
      setError('请输入有效的英文单词');
      return;
    }

    try {
      await onAdd(trimmedWord);
      setWord('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败，请重试');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-800">添加新单词</h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                setError('');
              }}
              placeholder="输入要学习的单词，AI 将自动分析..."
              className={`w-full px-5 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
              disabled={isLoading}
            />
            {error && (
              <p className="absolute -bottom-6 left-0 text-sm text-red-500">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-w-[160px]"
          >
            {isLoading ? (
              <>
                <LoaderIcon className="w-5 h-5" />
                <span>AI 分析中...</span>
              </>
            ) : (
              <>
                <PlusIcon />
                <span>添加单词</span>
              </>
            )}
          </button>
        </div>
      </form>

      <p className="mt-3 text-sm text-gray-500">
        AI 将自动分析单词的音标、释义、例句、词源、记忆技巧、搭配等信息
      </p>
    </div>
  );
}