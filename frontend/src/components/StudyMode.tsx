import { useState, useEffect } from 'react';
import type { Word } from '../types';
import { api } from '../services/api';
import { XIcon, CheckIcon, LoaderIcon, TargetIcon } from './Icons';

interface StudyModeProps {
  onClose: () => void;
  onComplete: () => void;
}

export function StudyMode({ onClose, onComplete }: StudyModeProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [studiedCount, setStudiedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const data = await api.getDueWords();
      setWords(data);
    } catch (err) {
      console.error('Failed to load words:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;

    try {
      await api.submitReview(currentWord.id, isCorrect);
      setStudiedCount((c) => c + 1);
      if (isCorrect) setCorrectCount((c) => c + 1);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      onComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
          <LoaderIcon className="w-8 h-8 text-indigo-600" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">暂无待复习单词</h3>
            <p className="text-gray-600 mb-6">你已经完成了所有待复习的单词，继续保持！</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TargetIcon className="w-5 h-5" />
              <span className="font-medium">学习模式</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between text-sm text-white/80">
            <span>进度: {currentIndex + 1} / {words.length}</span>
            <span>正确: {correctCount} / {studiedCount}</span>
          </div>
          <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 卡片 */}
        <div className="p-6">
          <div
            className="card-flip cursor-pointer h-64 mb-6"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`card-flip-inner relative w-full h-full transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* 正面 */}
              <div className="card-front absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 flex flex-col items-center justify-center p-6">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">{currentWord.word}</h2>
                <p className="text-lg text-gray-500 mb-2">{currentWord.phonetic}</p>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {currentWord.part_of_speech}
                </span>
                <p className="mt-4 text-sm text-gray-400">点击查看释义</p>
              </div>

              {/* 背面 */}
              <div className="card-back absolute inset-0 bg-white rounded-xl border-2 border-indigo-200 p-6 overflow-auto rotate-y-180">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">释义</h3>
                    <p className="text-gray-600 text-sm">{currentWord.definition}</p>
                  </div>
                  {currentWord.examples?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">例句</h3>
                      <p className="text-gray-600 text-xs">{currentWord.examples[0]}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <XIcon className="w-5 h-5" />
              不认识
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
            >
              <CheckIcon className="w-5 h-5" />
              认识
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}