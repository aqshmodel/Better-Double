export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  type: 'daily' | 'weekly';
}

export interface Habit {
  id:string;
  habitToChange: string; // 「悪い習慣」から変更
  trigger: string;
  idealAction: string; // 「代わりの行動」から変更
  successCount: number;
}

export interface AngerLog {
  id: string;
  date: string;
  situation: string;
  feelingScale: number;
  trigger: string;
  betterResponse: string;
}

export interface DatePlan {
  id: string;
  title: string;
  date: string;
  description: string;
  completed: boolean;
  authorId?: string; //
}

export interface SharedMemo {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
  isPlanned: boolean;
}

export interface AppreciationLog {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
}

export interface InstructionManualItem {
  id: string;
  category: 'pleasure' | 'sadness' | 'anger' | 'help' | 'other';
  content: string;
}

export interface WeeklyReflection { // 「WeeklyJournal」から変更
  id: string;
  date: string; // 週の終了日
  gratitude: string;
  challenge: string;
  learning: string;
  praise: string;
  nextAction: string;
}

export interface ValueItem {
  id: string;
  text: string;
  description: string;
}


export interface UserData {
  userId: string;
  partnerCode: string | null;
  goals: Goal[];
  habits: Habit[];
  angerLogs: AngerLog[];
  datePlans: DatePlan[];
  todayMood?: 'happy' | 'okay' | 'sad';
  sharedMemos?: SharedMemo[];
  wishes?: Wish[];
  appreciationLogs?: AppreciationLog[];
  instructionManual?: InstructionManualItem[];
  weeklyReflections?: WeeklyReflection[]; // 「weeklyJournals」から変更
  values?: ValueItem[];
}