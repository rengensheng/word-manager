-- 创建学习记录表
CREATE TABLE IF NOT EXISTS study_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id INTEGER NOT NULL,
  is_correct INTEGER NOT NULL,
  studied_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_study_records_word_id ON study_records(word_id);