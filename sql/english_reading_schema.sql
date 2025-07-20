-- English Reading Feature Database Schema
CREATE TABLE IF NOT EXISTS english_reading_articles (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS english_reading_word_queries (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES english_reading_articles(id) ON DELETE CASCADE,
  word_text TEXT NOT NULL,
  definition TEXT,
  examples TEXT[],
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS english_reading_sentence_queries (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES english_reading_articles(id) ON DELETE CASCADE,
  sentence_text TEXT NOT NULL,
  translation TEXT,
  analysis TEXT,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);