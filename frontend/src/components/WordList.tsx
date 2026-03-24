import { useState } from 'react';
import type { Word } from '../types';
import { StarIcon, TrashIcon, BookIcon, EyeIcon, ChevronRightIcon } from './Icons';
import { WordDetail } from './WordDetail';

interface WordListProps {
  words: Word[];
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

const EXAM_LEVEL_COLORS: Record<string, string> = {
  CET4: 'bg-blue-100 text-blue-700',
  CET6: 'bg-green-100 text-green-700',
  IELTS: 'bg-purple-100 text-purple-700',
  TOEFL: 'bg-orange-100 text-orange-700',
  GRE: 'bg-red-100 text-red-700',
};

export function WordList({ words, onDelete, onToggleFavorite }: WordListProps) {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  if (words.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BookIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>暂无单词，开始添加你的第一个单词吧！</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单词</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">音标</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">词性</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">释义</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">等级</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">难度</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {words.map((word) => (
              <tr
                key={word.id}
                className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                onClick={() => setSelectedWord(word)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {word.favorite === 1 && (
                      <StarIcon filled className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                    )}
                    <span className="font-medium text-gray-900">{word.word}</span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-300 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-500 hidden sm:table-cell">{word.phonetic}</td>
                <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                    {word.part_of_speech}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate text-sm">{word.definition}</td>
                <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                  {word.exam_level && (
                    <span className={`px-2 py-1 rounded text-xs ${EXAM_LEVEL_COLORS[word.exam_level] || 'bg-gray-100 text-gray-700'}`}>
                      {word.exam_level}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-2 h-2 rounded-full ${star <= (word.difficulty || 3) ? 'bg-yellow-400' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedWord(word)}
                    className="p-1.5 text-gray-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors mr-1"
                    title="查看详情"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onToggleFavorite(word.id)}
                    className={`p-1.5 rounded-lg mr-1 transition-colors ${
                      word.favorite
                        ? 'text-yellow-500 hover:bg-yellow-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={word.favorite ? '取消收藏' : '收藏'}
                  >
                    <StarIcon filled={word.favorite === 1} />
                  </button>
                  <button
                    onClick={() => onDelete(word.id)}
                    className="p-1.5 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 详情弹窗 */}
      {selectedWord && (
        <WordDetail
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      )}
    </>
  );
}