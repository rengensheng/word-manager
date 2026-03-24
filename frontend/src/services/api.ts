import type { Word, StudyStats } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // 获取所有单词
  getWords: () => fetchAPI<Word[]>('/api/words'),

  // 获取单个单词
  getWord: (id: number) => fetchAPI<Word>(`/api/words/${id}`),

  // 添加单词（AI 分析）
  addWord: (word: string) => fetchAPI<Word>('/api/words', {
    method: 'POST',
    body: JSON.stringify({ word }),
  }),

  // 更新单词
  updateWord: (id: number, data: Partial<Word>) => fetchAPI<Word>(`/api/words/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除单词
  deleteWord: (id: number) => fetchAPI<{ success: boolean }>(`/api/words/${id}`, {
    method: 'DELETE',
  }),

  // 切换收藏状态
  toggleFavorite: (id: number) => fetchAPI<Word>(`/api/words/${id}/favorite`, {
    method: 'PATCH',
  }),

  // 获取待复习单词
  getDueWords: () => fetchAPI<Word[]>('/api/review/due'),

  // 提交复习结果
  submitReview: (id: number, isCorrect: boolean) => fetchAPI<Word>(`/api/review/${id}`, {
    method: 'POST',
    body: JSON.stringify({ is_correct: isCorrect }),
  }),

  // 获取学习统计
  getStats: () => fetchAPI<StudyStats>('/api/stats'),
};