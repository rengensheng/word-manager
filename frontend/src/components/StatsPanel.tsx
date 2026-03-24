import { useEffect, useState } from 'react';
import type { StudyStats } from '../types';
import { api } from '../services/api';
import { BookIcon, ClockIcon, TargetIcon, TrendingUpIcon, LoaderIcon, ChevronRightIcon } from './Icons';

export function StatsPanel() {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-center">
        <LoaderIcon className="w-6 h-6 text-indigo-600" />
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { icon: BookIcon, label: '总单词', value: stats.total_words, color: 'text-indigo-600 bg-indigo-50' },
    { icon: ClockIcon, label: '今日复习', value: stats.today_reviews, color: 'text-green-600 bg-green-50' },
    { icon: TargetIcon, label: '待复习', value: stats.due_reviews, color: 'text-orange-600 bg-orange-50' },
    { icon: TrendingUpIcon, label: '正确率', value: `${Math.round(stats.correct_rate * 100)}%`, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* 头部 - 始终显示 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChartIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">学习统计</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-4 text-sm">
            {statItems.slice(0, 2).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-gray-500">{item.label}:</span>
                <span className="font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
          <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* 展开内容 */}
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* 核心统计 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
            {statItems.map((item, i) => (
              <div key={i} className="text-center">
                <div className={`w-12 h-12 rounded-xl ${item.color.split(' ')[1]} flex items-center justify-center mx-auto mb-2`}>
                  <item.icon className={`w-6 h-6 ${item.color.split(' ')[0]}`} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>

          {/* 考试分布 */}
          {Object.keys(stats.exam_distribution).length > 0 && (
            <div className="mb-4 pt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">考试等级分布</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.exam_distribution).map(([level, count]) => (
                  <span key={level} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {level}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 难度分布 */}
          {Object.keys(stats.difficulty_distribution).length > 0 && (
            <div className="pt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">难度分布</h4>
              <div className="flex items-end gap-2 h-16">
                {[1, 2, 3, 4, 5].map((level) => {
                  const maxCount = Math.max(...Object.values(stats.difficulty_distribution), 1);
                  const count = stats.difficulty_distribution[level] || 0;
                  const height = (count / maxCount) * 100;
                  return (
                    <div key={level} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-12">
                        {count > 0 && (
                          <span className="text-xs text-gray-500 mb-1">{count}</span>
                        )}
                        <div
                          className="w-full bg-indigo-400 rounded-t transition-all duration-300"
                          style={{ height: `${Math.max(height, count > 0 ? 8 : 0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 mt-1">{level}星</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}