import { useState, useEffect, useMemo } from 'react';
import { api } from './services/api';
import { WordCard } from './components/WordCard';
import { WordList } from './components/WordList';
import { AddWordForm } from './components/AddWordForm';
import { StudyMode } from './components/StudyMode';
import { StatsPanel } from './components/StatsPanel';
import type { Word, ViewMode, SortBy } from './types';
import {
  BookIcon,
  SearchIcon,
  StarIcon,
  GridIcon,
  ListIcon,
  PlayIcon,
  XIcon,
  LoaderIcon,
} from './components/Icons';

function App() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadWords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getWords();
      setWords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  const handleAddWord = async (word: string) => {
    setIsAdding(true);
    try {
      const newWord = await api.addWord(word);
      setWords((prev) => [newWord, ...prev]);
      setRefreshKey((k) => k + 1);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteWord = async (id: number) => {
    try {
      await api.deleteWord(id);
      setWords((prev) => prev.filter((w) => w.id !== id));
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const updated = await api.toggleFavorite(id);
      setWords((prev) => prev.map((w) => (w.id === id ? updated : w)));
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleStudyComplete = () => {
    setShowStudyMode(false);
    loadWords();
    setRefreshKey((k) => k + 1);
  };

  const filteredWords = useMemo(() => {
    let result = [...words];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.word.toLowerCase().includes(query) ||
          w.definition?.toLowerCase().includes(query) ||
          w.category?.toLowerCase().includes(query)
      );
    }

    if (showFavoritesOnly) {
      result = result.filter((w) => w.favorite === 1);
    }

    result.sort((a, b) => {
      if (sortBy === 'word') {
        return a.word.localeCompare(b.word);
      } else if (sortBy === 'favorite') {
        return b.favorite - a.favorite;
      } else if (sortBy === 'difficulty') {
        return (b.difficulty || 3) - (a.difficulty || 3);
      } else if (sortBy === 'review_count') {
        return (b.review_count || 0) - (a.review_count || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [words, searchQuery, sortBy, showFavoritesOnly]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookIcon className="w-6 h-6 text-white" />
              </div>
              Word Manager
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowStudyMode(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
              >
                <PlayIcon className="w-4 h-4" />
                <span className="hidden sm:inline">开始学习</span>
              </button>
              <div className="text-sm text-gray-500">
                共 <span className="font-semibold text-indigo-600">{words.length}</span> 个单词
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 添加单词表单 */}
        <section className="mb-8">
          <AddWordForm onAdd={handleAddWord} isLoading={isAdding} />
        </section>

        {/* 统计面板 */}
        <section className="mb-8">
          <StatsPanel key={refreshKey} />
        </section>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 工具栏 */}
        <section className="mb-6 flex flex-wrap items-center gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索单词、释义、分类..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
          </div>

          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="created_at">按添加时间</option>
            <option value="word">按字母顺序</option>
            <option value="favorite">按收藏</option>
            <option value="difficulty">按难度</option>
            <option value="review_count">按复习次数</option>
          </select>

          {/* 收藏过滤 */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2.5 rounded-xl border transition-colors flex items-center gap-2 ${
              showFavoritesOnly
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
            }`}
          >
            <StarIcon filled={showFavoritesOnly} className="w-5 h-5" />
            收藏
          </button>

          {/* 视图切换 */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2.5 transition-colors ${
                viewMode === 'card'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="卡片视图"
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="列表视图"
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* 单词列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoaderIcon className="w-8 h-8 text-indigo-600" />
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onDelete={handleDeleteWord}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <WordList
            words={filteredWords}
            onDelete={handleDeleteWord}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* 空状态 */}
        {!isLoading && filteredWords.length === 0 && (
          <div className="text-center py-20">
            <BookIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">
              {searchQuery || showFavoritesOnly ? '没有找到匹配的单词' : '暂无单词，开始添加你的第一个单词吧！'}
            </p>
          </div>
        )}
      </main>

      {/* 学习模式 */}
      {showStudyMode && (
        <StudyMode onClose={() => setShowStudyMode(false)} onComplete={handleStudyComplete} />
      )}

      {/* 页脚 */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        <p>Word Manager - 让英语学习更高效 ✨</p>
      </footer>
    </div>
  );
}

export default App;