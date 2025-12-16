export enum AppMode {
  HOME = 'HOME',
  SUMMARIZER = 'SUMMARIZER',
  FLASHCARDS = 'FLASHCARDS',
  RESEARCH = 'RESEARCH',
  PRESENTATION = 'PRESENTATION',
  QUIZ = 'QUIZ',
}

export enum SummaryLevel {
  QUICK = 'مراجعة سريعة ومختصرة',
  MEDIUM = 'تلخيص متوسط وشامل',
  DETAILED = 'شرح مبسط وتفصيلي',
}

export enum Language {
  ARABIC = 'Arabic',
  ENGLISH = 'English',
  ENGLISH_ARABIC = 'English & Arabic (Bilingual)',
}

export enum QuizDifficulty {
  EASY = 'سهل',
  MEDIUM = 'متوسط',
  HARD = 'صعب',
}

export enum PresentationStyle {
  MODERN_BLUE = 'Modern Blue',
  MINIMALIST_DARK = 'Minimalist Dark',
  NATURE_FRESH = 'Nature Fresh',
  GEOMETRIC_PURPLE = 'Geometric Purple',
  ELEGANT_GOLD = 'Elegant Gold',
}

export enum PresentationDetailLevel {
  BRIEF = 'موجز (نقط رؤوس أقلام)',
  STANDARD = 'قياسي (متوازن)',
  DETAILED = 'مفصل (شرح وافي)',
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface QuizAnalysis {
  weakPoints: string[];
  recommendations: string;
}

export interface ChartData {
  type: 'bar' | 'pie';
  title: string;
  data: { name: string; value: number }[];
}

export interface Slide {
  title: string;
  content: string[];
  speakerNotes: string;
  imageBase64?: string; // Optional image data
  chart?: ChartData; // Optional chart data
}

export interface ResearchResult {
  content: string;
  sources: { uri: string; title: string }[];
}