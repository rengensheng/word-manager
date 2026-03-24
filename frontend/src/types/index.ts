export interface WordForms {
  noun?: string;
  verb?: string;
  adjective?: string;
  adverb?: string;
  past_tense?: string;
  past_participle?: string;
  present_participle?: string;
  plural?: string;
  comparative?: string;
  superlative?: string;
}

export interface Word {
  id: number;
  word: string;
  phonetic: string;
  part_of_speech: string;
  definition: string;
  examples: string[];
  etymology: string;
  memory_tips: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  word_forms: WordForms;
  exam_level: string;
  difficulty: number;
  frequency: number;
  category: string;
  review_count: number;
  correct_count: number;
  last_review_at: string;
  next_review_at: string;
  favorite: number;
  created_at: string;
  updated_at: string;
}

export interface StudyStats {
  total_words: number;
  total_reviews: number;
  correct_rate: number;
  today_reviews: number;
  due_reviews: number;
  exam_distribution: Record<string, number>;
  difficulty_distribution: Record<number, number>;
}

export type ViewMode = 'card' | 'list';

export type SortBy = 'created_at' | 'word' | 'favorite' | 'difficulty' | 'review_count';

export type SortOrder = 'asc' | 'desc';