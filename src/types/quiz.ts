export type QuizPhase = 'setup' | 'playing' | 'roundBreak' | 'finished';

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export interface QuizTeam {
  id: string;
  name: string;
  score: number;
}
