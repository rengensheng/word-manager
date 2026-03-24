import { useState } from 'react';
import type { Word } from '../types';
import { StarIcon, TrashIcon, TagIcon, LayersIcon, SparklesIcon, EyeIcon } from './Icons';
import { WordDetail } from './WordDetail';
import { highlightWord } from '../utils/highlight.tsx';

interface WordCardProps {
  word: Word;
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

const DIFFICULTY_STARS = [1, 2, 3, 4, 5];

export function WordCard({ word, onDelete, onToggleFavorite }: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className="relative group">
        {/* 操作按钮 */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetail(true);
            }}
            className="p-2 text-gray-400 bg-white/80 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title="查看详情"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(word.id);
            }}
            className={`p-2 rounded-full transition-colors ${
              word.favorite
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-400 bg-white/80 hover:bg-gray-100'
            }`}
            title={word.favorite ? '取消收藏' : '收藏'}
          >
            <StarIcon filled={word.favorite === 1} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="p-2 text-gray-400 bg-white/80 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
            title="删除"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white p-4 rounded-lg shadow-xl">
              <p className="text-gray-700 mb-4">确定删除单词 "{word.word}" 吗？</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    onDelete(word.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 卡片翻转容器 */}
        <div
          className="card-flip cursor-pointer h-96"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`card-flip-inner relative w-full h-full transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* 正面 */}
            <div className="card-front absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg flex flex-col">
              {/* 顶部标签 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {word.exam_level && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${EXAM_LEVEL_COLORS[word.exam_level] || 'bg-white/20'}`}>
                    {word.exam_level}
                  </span>
                )}
                {word.category && (
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    {word.category}
                  </span>
                )}
              </div>

              {/* 单词主体 */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-4xl font-bold mb-2">{word.word}</h2>
                <p className="text-lg text-white/80 mb-2">{word.phonetic}</p>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm mb-3">
                  {word.part_of_speech}
                </span>
                <p className="text-center text-white/90 text-sm px-4 line-clamp-3">{word.definition}</p>
              </div>

              {/* 底部信息 */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/60">难度</span>
                  <div className="flex gap-0.5">
                    {DIFFICULTY_STARS.map((star) => (
                      <div
                        key={star}
                        className={`w-2 h-2 rounded-full ${star <= (word.difficulty || 3) ? 'bg-yellow-400' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <LayersIcon className="w-3 h-3" />
                  复习 {word.review_count || 0} 次
                </div>
              </div>

              <p className="text-xs text-white/50 text-center mt-2">点击翻转查看详情</p>
            </div>

            {/* 背面 */}
            <div className="card-back absolute inset-0 bg-white rounded-2xl shadow-lg overflow-auto rotate-y-180">
              <div className="p-5 space-y-4">
                {/* 标题 */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-xl font-bold text-gray-800">{word.word}</h2>
                  <span className="text-sm text-gray-400">{word.phonetic}</span>
                </div>

                {/* 例句 */}
                {word.examples?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <span className="text-indigo-500">📝</span> 例句
                    </h3>
                    <ul className="space-y-2">
                      {word.examples.map((example, i) => (
                        <li key={i} className="text-gray-600 text-xs pl-3 border-l-2 border-indigo-200">
                          {highlightWord(example, word.word)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 搭配 */}
                {word.collocations?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <span className="text-purple-500">🔗</span> 常见搭配
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {word.collocations.map((col, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 词形变化 */}
                {word.word_forms && Object.keys(word.word_forms).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <span className="text-blue-500">🔄</span> 词形变化
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(word.word_forms).map(([key, value]) => (
                        value && (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-gray-700">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* 词源 */}
                {word.etymology && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <span className="text-green-500">🔍</span> 词源
                    </h3>
                    <p className="text-gray-600 text-xs">{word.etymology}</p>
                  </div>
                )}

                {/* 记忆技巧 */}
                {word.memory_tips && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <SparklesIcon className="w-4 h-4 text-amber-500" />
                      记忆技巧
                    </h3>
                    <p className="text-gray-600 text-xs bg-amber-50 p-3 rounded-lg">{word.memory_tips}</p>
                  </div>
                )}

                {/* 同义词/反义词 */}
                <div className="flex gap-4">
                  {word.synonyms?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-800 mb-1">同义词</h3>
                      <div className="flex flex-wrap gap-1">
                        {word.synonyms.map((syn, i) => (
                          <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {word.antonyms?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-800 mb-1">反义词</h3>
                      <div className="flex flex-wrap gap-1">
                        {word.antonyms.map((ant, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            {ant}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 学习进度 */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>复习 {word.review_count || 0} 次</span>
                    <span>正确率 {word.review_count ? Math.round((word.correct_count / word.review_count) * 100) : 0}%</span>
                  </div>
                </div>

                {/* 查看详情按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetail(true);
                  }}
                  className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <EyeIcon className="w-4 h-4" />
                  查看完整详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      {showDetail && (
        <WordDetail
          word={word}
          onClose={() => setShowDetail(false)}
          onToggleFavorite={onToggleFavorite}
          onDelete={(id) => {
            onDelete(id);
            setShowDetail(false);
          }}
        />
      )}
    </>
  );
}