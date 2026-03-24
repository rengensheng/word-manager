import type { Word } from '../types';
import { XIcon, StarIcon, TrashIcon, TagIcon, LayersIcon, SparklesIcon, ClockIcon } from './Icons';
import { highlightWord } from '../utils/highlight.tsx';

interface WordDetailProps {
  word: Word;
  onClose: () => void;
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
}

const EXAM_LEVEL_COLORS: Record<string, string> = {
  CET4: 'bg-blue-100 text-blue-700 border-blue-200',
  CET6: 'bg-green-100 text-green-700 border-green-200',
  IELTS: 'bg-purple-100 text-purple-700 border-purple-200',
  TOEFL: 'bg-orange-100 text-orange-700 border-orange-200',
  GRE: 'bg-red-100 text-red-700 border-red-200',
};

const DIFFICULTY_LABELS = ['简单', '较易', '中等', '较难', '困难'];
const FREQUENCY_LABELS = ['罕见', '较少', '一般', '常用', '高频'];

export function WordDetail({ word, onClose, onToggleFavorite, onDelete }: WordDetailProps) {
  const correctRate = word.review_count ? Math.round((word.correct_count / word.review_count) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>

          <div className="flex items-start justify-between pr-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">{word.word}</h2>
              <p className="text-lg text-white/80 mb-3">{word.phonetic}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {word.part_of_speech}
                </span>
                {word.exam_level && (
                  <span className={`px-3 py-1 rounded-full text-sm ${EXAM_LEVEL_COLORS[word.exam_level] || 'bg-white/20'}`}>
                    {word.exam_level}
                  </span>
                )}
                {word.category && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    {word.category}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onToggleFavorite(word.id)}
                className={`p-2 rounded-lg transition-colors ${
                  word.favorite ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 hover:bg-white/30'
                }`}
                title={word.favorite ? '取消收藏' : '收藏'}
              >
                <StarIcon filled={word.favorite === 1} className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`确定删除单词 "${word.word}" 吗？`)) {
                    onDelete(word.id);
                    onClose();
                  }
                }}
                className="p-2 bg-white/20 hover:bg-red-400 rounded-lg transition-colors"
                title="删除"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 难度和词频 */}
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white/60">难度:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`w-3 h-3 rounded-full ${star <= (word.difficulty || 3) ? 'bg-yellow-400' : 'bg-white/30'}`}
                  />
                ))}
              </div>
              <span className="text-white/80">{DIFFICULTY_LABELS[(word.difficulty || 3) - 1]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">词频:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`w-3 h-3 rounded-full ${star <= (word.frequency || 3) ? 'bg-green-400' : 'bg-white/30'}`}
                  />
                ))}
              </div>
              <span className="text-white/80">{FREQUENCY_LABELS[(word.frequency || 3) - 1]}</span>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          {/* 释义 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">释义</h3>
            <p className="text-gray-700 leading-relaxed">{word.definition}</p>
          </div>

          {/* 例句 */}
          {word.examples?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-indigo-500">📝</span> 例句
              </h3>
              <ul className="space-y-3">
                {word.examples.map((example, i) => (
                  <li key={i} className="text-gray-600 text-sm pl-4 border-l-2 border-indigo-300 py-1">
                    {highlightWord(example, word.word)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 搭配 */}
          {word.collocations?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-purple-500">🔗</span> 常见搭配
              </h3>
              <div className="flex flex-wrap gap-2">
                {word.collocations.map((col, i) => (
                  <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-100">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 词形变化 */}
          {word.word_forms && Object.values(word.word_forms).some(v => v) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-blue-500">🔄</span> 词形变化
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(word.word_forms).map(([key, value]) => (
                  value && (
                    <div key={key} className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-500 capitalize block mb-1">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-gray-800 font-medium">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* 同义词/反义词 */}
          {(word.synonyms?.length > 0 || word.antonyms?.length > 0) && (
            <div className="mb-6 flex gap-6">
              {word.synonyms?.length > 0 && (
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">同义词</h3>
                  <div className="flex flex-wrap gap-2">
                    {word.synonyms.map((syn, i) => (
                      <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {word.antonyms?.length > 0 && (
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">反义词</h3>
                  <div className="flex flex-wrap gap-2">
                    {word.antonyms.map((ant, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        {ant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 词源 */}
          {word.etymology && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-green-500">🔍</span> 词源
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                {word.etymology}
              </p>
            </div>
          )}

          {/* 记忆技巧 */}
          {word.memory_tips && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                记忆技巧
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed bg-amber-50 p-4 rounded-lg border border-amber-100">
                {word.memory_tips}
              </p>
            </div>
          )}

          {/* 学习进度 */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <LayersIcon className="w-4 h-4 text-indigo-500" />
              学习进度
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">{word.review_count || 0}</p>
                <p className="text-xs text-gray-500">复习次数</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{correctRate}%</p>
                <p className="text-xs text-gray-500">正确率</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">{word.correct_count || 0}</p>
                <p className="text-xs text-gray-500">正确次数</p>
              </div>
            </div>
            {word.last_review_at && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                上次复习: {new Date(word.last_review_at).toLocaleString('zh-CN')}
              </div>
            )}
          </div>
        </div>

        {/* 底部 */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            添加于 {new Date(word.created_at).toLocaleDateString('zh-CN')}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}