export interface FrenotesItem {
  id: string;
  sentence_pairs: string;
  core_expression1?: string;
  expression_usage1?: string;
  core_expression2?: string;
  expression_usage2?: string;
  core_expression3?: string;
  expression_usage3?: string;
  reusable_sentence1?: string;
  reusable_sentence2?: string;
  context_note?: string;
  emotion_or_tone?: string;
  topic?: string;
  difficulty?: string;
  note?: string;
  added_time?: string;
}
