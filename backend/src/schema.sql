-- 单词表
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,
  phonetic TEXT,
  part_of_speech TEXT,
  definition TEXT,
  examples TEXT,           -- JSON array
  etymology TEXT,
  memory_tips TEXT,
  synonyms TEXT,           -- JSON array
  antonyms TEXT,           -- JSON array

  -- 扩展字段
  collocations TEXT,       -- JSON array: 常见搭配
  word_forms TEXT,         -- JSON object: 词形变化
  exam_level TEXT,         -- 考试等级: CET4/CET6/IELTS/TOEFL/GRE
  difficulty INTEGER,      -- 难度等级: 1-5
  frequency INTEGER,       -- 词频等级: 1-5
  category TEXT,           -- 分类标签

  -- 学习统计
  review_count INTEGER DEFAULT 0,      -- 复习次数
  correct_count INTEGER DEFAULT 0,     -- 正确次数
  last_review_at TEXT,                 -- 上次复习时间
  next_review_at TEXT,                 -- 下次复习时间

  favorite INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS study_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id INTEGER NOT NULL,
  is_correct INTEGER NOT NULL,         -- 是否答对
  studied_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_words_favorite ON words(favorite);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words(created_at);
CREATE INDEX IF NOT EXISTS idx_words_exam_level ON words(exam_level);
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty);
CREATE INDEX IF NOT EXISTS idx_words_next_review ON words(next_review_at);
CREATE INDEX IF NOT EXISTS idx_study_records_word_id ON study_records(word_id);