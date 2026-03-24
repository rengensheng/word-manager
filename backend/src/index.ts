import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
  AI_API_KEY: string
  AI_API_BASE_URL?: string
  AI_MODEL?: string
}

type WordRow = {
  id: number
  word: string
  phonetic: string
  part_of_speech: string
  definition: string
  examples: string
  etymology: string
  memory_tips: string
  synonyms: string
  antonyms: string
  collocations: string
  word_forms: string
  exam_level: string
  difficulty: number
  frequency: number
  category: string
  review_count: number
  correct_count: number
  last_review_at: string
  next_review_at: string
  favorite: number
  created_at: string
  updated_at: string
}

type Word = Omit<WordRow, 'examples' | 'synonyms' | 'antonyms' | 'collocations' | 'word_forms'> & {
  examples: string[]
  synonyms: string[]
  antonyms: string[]
  collocations: string[]
  word_forms: WordForms
}

type WordForms = {
  noun?: string
  verb?: string
  adjective?: string
  adverb?: string
  past_tense?: string
  past_participle?: string
  present_participle?: string
  plural?: string
  comparative?: string
  superlative?: string
}

type StudyStats = {
  total_words: number
  total_reviews: number
  correct_rate: number
  today_reviews: number
  due_reviews: number
  exam_distribution: Record<string, number>
  difficulty_distribution: Record<number, number>
}

function parseWord(row: WordRow): Word {
  return {
    ...row,
    examples: safeJsonParse(row.examples, []),
    synonyms: safeJsonParse(row.synonyms, []),
    antonyms: safeJsonParse(row.antonyms, []),
    collocations: safeJsonParse(row.collocations, []),
    word_forms: safeJsonParse(row.word_forms, {})
  }
}

function safeJsonParse<T>(str: string, fallback: T): T {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

app.get('/', (c) => c.json({ status: 'ok', message: 'Word Manager API' }))

// 获取所有单词
app.get('/api/words', async (c) => {
  const db = c.env.DB
  const { results } = await db.prepare('SELECT * FROM words ORDER BY created_at DESC').all<WordRow>()
  return c.json(results.map(parseWord))
})

// 获取单个单词
app.get('/api/words/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  const result = await db.prepare('SELECT * FROM words WHERE id = ?').bind(id).first<WordRow>()
  if (!result) {
    return c.json({ error: 'Word not found' }, 404)
  }
  return c.json(parseWord(result))
})

// 添加单词（AI 分析）
app.post('/api/words', async (c) => {
  const db = c.env.DB
  const apiKey = c.env.AI_API_KEY
  const apiBaseUrl = c.env.AI_API_BASE_URL || 'https://api.deepseek.com'
  const model = c.env.AI_MODEL || 'deepseek-chat'
  const body = await c.req.json<{ word: string }>()
  const word = body.word?.trim().toLowerCase()

  if (!word) {
    return c.json({ error: 'Word is required' }, 400)
  }

  const existing = await db.prepare('SELECT * FROM words WHERE word = ?').bind(word).first<WordRow>()
  if (existing) {
    return c.json(parseWord(existing))
  }

  const analysis = await analyzeWord(word, apiKey, apiBaseUrl, model)

  const result = await db.prepare(`
    INSERT INTO words (word, phonetic, part_of_speech, definition, examples, etymology, memory_tips, synonyms, antonyms, collocations, word_forms, exam_level, difficulty, frequency, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    RETURNING *
  `).bind(
    word,
    analysis.phonetic,
    analysis.part_of_speech,
    analysis.definition,
    JSON.stringify(analysis.examples),
    analysis.etymology,
    analysis.memory_tips,
    JSON.stringify(analysis.synonyms),
    JSON.stringify(analysis.antonyms),
    JSON.stringify(analysis.collocations),
    JSON.stringify(analysis.word_forms),
    analysis.exam_level,
    analysis.difficulty,
    analysis.frequency,
    analysis.category
  ).first<WordRow>()

  return c.json(parseWord(result!))
})

// 更新单词
app.put('/api/words/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  const body = await c.req.json()

  const jsonFields = ['examples', 'synonyms', 'antonyms', 'collocations', 'word_forms']
  const fields = []
  const values = []

  for (const [key, value] of Object.entries(body)) {
    if (['phonetic', 'part_of_speech', 'definition', 'examples', 'etymology', 'memory_tips', 'synonyms', 'antonyms', 'collocations', 'word_forms', 'exam_level', 'difficulty', 'frequency', 'category', 'favorite'].includes(key)) {
      fields.push(`${key} = ?`)
      values.push(jsonFields.includes(key) && typeof value === 'object' ? JSON.stringify(value) : value)
    }
  }

  if (fields.length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400)
  }

  values.push(id)
  const result = await db.prepare(`
    UPDATE words SET ${fields.join(', ')} WHERE id = ?
    RETURNING *
  `).bind(...values).first<WordRow>()

  if (!result) {
    return c.json({ error: 'Word not found' }, 404)
  }

  return c.json(parseWord(result))
})

// 删除单词
app.delete('/api/words/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  await db.prepare('DELETE FROM words WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// 切换收藏状态
app.patch('/api/words/:id/favorite', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  const result = await db.prepare(`
    UPDATE words SET favorite = NOT favorite WHERE id = ?
    RETURNING *
  `).bind(id).first<WordRow>()

  if (!result) {
    return c.json({ error: 'Word not found' }, 404)
  }

  return c.json(parseWord(result))
})

// 获取待复习单词
app.get('/api/review/due', async (c) => {
  const db = c.env.DB
  const { results } = await db.prepare(`
    SELECT * FROM words
    WHERE next_review_at IS NULL OR next_review_at <= datetime('now')
    ORDER BY next_review_at ASC, created_at ASC
    LIMIT 20
  `).all<WordRow>()
  return c.json(results.map(parseWord))
})

// 提交复习结果
app.post('/api/review/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  const body = await c.req.json<{ is_correct: boolean }>()
  const isCorrect = body.is_correct ? 1 : 0

  // 记录学习
  await db.prepare(`
    INSERT INTO study_records (word_id, is_correct)
    VALUES (?, ?)
  `).bind(id, isCorrect).run()

  // 更新单词统计和下次复习时间
  const word = await db.prepare('SELECT * FROM words WHERE id = ?').bind(id).first<WordRow>()
  if (!word) {
    return c.json({ error: 'Word not found' }, 404)
  }

  const newReviewCount = word.review_count + 1
  const newCorrectCount = word.correct_count + isCorrect
  const correctRate = newCorrectCount / newReviewCount

  // 简单的间隔重复算法
  let intervalDays = 1
  if (correctRate >= 0.9) intervalDays = 7
  else if (correctRate >= 0.7) intervalDays = 3
  else if (correctRate >= 0.5) intervalDays = 2

  const result = await db.prepare(`
    UPDATE words SET
      review_count = ?,
      correct_count = ?,
      last_review_at = datetime('now'),
      next_review_at = datetime('now', '+' || ? || ' days')
    WHERE id = ?
    RETURNING *
  `).bind(newReviewCount, newCorrectCount, intervalDays, id).first<WordRow>()

  return c.json(parseWord(result!))
})

// 获取学习统计
app.get('/api/stats', async (c) => {
  const db = c.env.DB

  const totalWords = await db.prepare('SELECT COUNT(*) as count FROM words').first<{ count: number }>()
  const totalReviews = await db.prepare('SELECT COUNT(*) as count FROM study_records').first<{ count: number }>()
  const correctReviews = await db.prepare('SELECT COUNT(*) as count FROM study_records WHERE is_correct = 1').first<{ count: number }>()
  const todayReviews = await db.prepare(`
    SELECT COUNT(*) as count FROM study_records
    WHERE date(studied_at) = date('now')
  `).first<{ count: number }>()
  const dueReviews = await db.prepare(`
    SELECT COUNT(*) as count FROM words
    WHERE next_review_at IS NULL OR next_review_at <= datetime('now')
  `).first<{ count: number }>()

  const examDistribution = await db.prepare(`
    SELECT exam_level, COUNT(*) as count FROM words
    WHERE exam_level IS NOT NULL AND exam_level != ''
    GROUP BY exam_level
  `).all<{ exam_level: string; count: number }>()

  const difficultyDistribution = await db.prepare(`
    SELECT difficulty, COUNT(*) as count FROM words
    WHERE difficulty IS NOT NULL
    GROUP BY difficulty
  `).all<{ difficulty: number; count: number }>()

  const stats: StudyStats = {
    total_words: totalWords?.count || 0,
    total_reviews: totalReviews?.count || 0,
    correct_rate: totalReviews?.count ? (correctReviews?.count || 0) / totalReviews.count : 0,
    today_reviews: todayReviews?.count || 0,
    due_reviews: dueReviews?.count || 0,
    exam_distribution: Object.fromEntries(examDistribution.results.map(r => [r.exam_level, r.count])),
    difficulty_distribution: Object.fromEntries(difficultyDistribution.results.map(r => [r.difficulty, r.count]))
  }

  return c.json(stats)
})

// AI 分析单词
async function analyzeWord(word: string, apiKey: string, apiBaseUrl: string, model: string) {
  const prompt = `Analyze the English word "${word}" comprehensively for Chinese learners. Return ONLY a valid JSON object (no markdown, no code blocks) with the following structure:
{
  "phonetic": "IPA phonetic transcription",
  "part_of_speech": "main part of speech (noun/verb/adj/adv/etc.)",
  "definition": "Chinese definition with multiple meanings if applicable",
  "examples": ["English example sentence 1 with Chinese translation", "English example sentence 2 with Chinese translation"],
  "etymology": "Chinese explanation of word origin, root/affix breakdown",
  "memory_tips": "Chinese memory techniques, mnemonics, and associations",
  "synonyms": ["synonym1", "synonym2"],
  "antonyms": ["antonym1", "antonym2"],
  "collocations": ["common collocation 1 with Chinese meaning", "common collocation 2 with Chinese meaning"],
  "word_forms": {
    "noun": "noun form if different",
    "verb": "verb form if different",
    "adjective": "adjective form if different",
    "adverb": "adverb form if different",
    "past_tense": "past tense if verb",
    "past_participle": "past participle if verb",
    "present_participle": "present participle if verb",
    "plural": "plural form if noun",
    "comparative": "comparative form if adj/adv",
    "superlative": "superlative form if adj/adv"
  },
  "exam_level": "one of: CET4/CET6/IELTS/TOEFL/GRE or empty string if not common exam word",
  "difficulty": 1-5 (1=easy, 5=very difficult),
  "frequency": 1-5 (1=rare, 5=very common),
  "category": "word category like: daily/academic/business/technology/travel/food/emotion etc."
}

Make sure all Chinese content is accurate and helpful for learners. Return ONLY the JSON, nothing else.`

  const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
  }
  const content = data.choices[0].message.content

  let jsonStr = content.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
  }

  return JSON.parse(jsonStr)
}

export default app