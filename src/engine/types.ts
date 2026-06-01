// ─── Step discriminated union (the engine's safety net) ───

export type StepBase = {
  id: string;
  xp?: number;
  primaryButton?: string;
};

// ─── Mini types for compound steps ───

export type Cue = {
  startMs: number;
  endMs: number;
  text: string;
};

// Question types supported inside a quiz widget
export type QuizQuestionType = "mc" | "tf" | "fillblank" | "match";

export type MiniQuestion = {
  id: string;
  question: string;
  questionType?: QuizQuestionType; // default: "mc"
  // MC fields
  options?: string[];
  correct: number | boolean | string; // MC: number index, TF: boolean, fillblank: string
  // TF fields
  feedback?: string[]; // [wrongFeedback, correctFeedback] for TF; per-option for MC
  // Fill-in-blank fields
  aliases?: string[]; // acceptable alternative answers
  // Match fields
  pairs?: { left: string; right: string }[]; // for match questions
};

export type ReflectionQuestion = {
  id: string;
  prompt: string;
  placeholder?: string;
  minChars?: number;
};

export type BuilderField = {
  id: string;
  label: string;
  placeholder?: string;
};

// ─── Step types ───

export type InfoStep = StepBase & {
  type: "info" | "scenario_card";
  title?: string;
  body: string;
  audioUrl?: string;
  cues?: Cue[];
};

export type ExampleStep = StepBase & {
  type: "example";
  title?: string;
  prompt: string;
};

export type McStep = StepBase & {
  type: "mc" | "scenario";
  question: string;
  options: string[];
  correct: number;
  feedback: string[];
};

export type TrueFalseStep = StepBase & {
  type: "tf";
  question: string;
  correct: boolean;
  feedback: string[];
};

export type HighlightStep = StepBase & {
  type: "highlight";
  body: string;
  highlights: string[];
};

export type FillBlankStep = StepBase & {
  type: "fillblank";
  question: string;
  answer: string;
  aliases?: string[];
  feedback: string[];
};

export type MatchStep = StepBase & {
  type: "match";
  pairs: { left: string; right: string }[];
};

export type GoodFitStep = StepBase & {
  type: "good_fit";
  question: string;
  correct: "good" | "notideal";
  feedback: string[];
};

export type QuizConfig = {
  mode?: "all_at_once" | "one_at_a_time"; // default: "one_at_a_time"
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResultsAfterEach?: boolean; // show per-question feedback immediately
  passingThreshold?: number; // 0–100, defaults to 70
  timerSeconds?: number; // per-question timer, 0 = no timer
  allowRetry?: boolean; // allow re-taking after submission
  showProgressBar?: boolean; // show question X of Y
};

export type QuizStep = StepBase & {
  type: "quiz";
  title?: string;
  subtitle?: string;
  questions: MiniQuestion[];
  config?: QuizConfig;
};

export type BuilderStep = StepBase & {
  type: "builder";
  fields: BuilderField[];
  template: string;
};

export type CopyActionStep = StepBase & {
  type: "copy_action";
  body: string;
  sourceStepId: string;
};

export type PasteCaptureStep = StepBase & {
  type: "paste_capture";
  body: string;
  minLength?: number;
};

export type CompareStep = StepBase & {
  type: "compare";
  question: string;
};

export type ReflectionStep = StepBase & {
  type: "reflection";
  questions: ReflectionQuestion[];
};

export type BadgeUnlockStep = StepBase & {
  type: "badge_unlock";
  badgeSlug: string;
};

export type StreakCommitStep = StepBase & {
  type: "streak_commitment";
  commitOptions: number[];
};

export type ReminderStep = StepBase & {
  type: "reminder_setup";
  reminderOptions: string[];
};

export type ChatStep = StepBase & {
  type: "chat";
  greeting?: string;
  placeholder?: string;
  systemPrompt?: string;
};

export type CompletionStep = StepBase & {
  type: "completion";
  title?: string;
  body: string;
};

export type PromptGeneratorField = {
  id: string;
  label: string;
  placeholder?: string;
};

export type PromptGeneratorStep = StepBase & {
  type: "prompt_generator";
  topic?: string;
  promptTemplate: string;
  categories?: string[];
  fields?: PromptGeneratorField[];
  title?: string;
  subtitle?: string;
};



// ─── Discriminated union ───

export type Step =
  | InfoStep
  | ExampleStep
  | McStep
  | TrueFalseStep
  | HighlightStep
  | FillBlankStep
  | MatchStep
  | GoodFitStep
  | QuizStep
  | BuilderStep
  | CopyActionStep
  | PasteCaptureStep
  | CompareStep
  | ReflectionStep
  | BadgeUnlockStep
  | StreakCommitStep
  | ReminderStep
  | CompletionStep
  | PromptGeneratorStep
  | ChatStep;

// ─── Content types ───

export type Program = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  unitLabel: string;
  artifactLabel: string;
  levelNames: string[];
  journeyShape: "linear";
};

export type Unit = {
  id: string;
  programId: string;
  orderNum: number;
  label: string;
  title: string;
  theme?: string;
  deliverableId?: string;
};

export type Lesson = {
  id: string;
  unitId: string;
  orderNum: number;
  title: string;
  estMinutes?: number;
  steps: Step[];
};

// ─── Progress types ───

export type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  goal?: string;
  dailyMins?: number;
  learnTime?: string;
  onboarded?: boolean;
  streak: number;
  shieldCount: number;
  xp: number;
  level: number;
};

export type LessonProgress = {
  id: string;
  userId: string;
  lessonId: string;
  completedAt: string;
  xpEarned: number;
  score: number;
};

// ─── Session types ───

export type StepResponse = unknown;

export type SessionState = {
  lessonId: string;
  stepIndex: number;
  sessionXp: number;
  responses: Record<string, StepResponse>;
  correctCount: number;
  totalGraded: number;
  comboStreak: number;
};

// ─── Narration ───

export type NarrationController = {
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: boolean;
  speed: number;
  setSpeed: (s: number) => void;
  transcript: string;
};

// ─── RPC result types ───

export type CompleteLessonResult = {
  xp_earned: number;
  total_xp: number;
  new_level: number;
  streak: number;
  already_completed: boolean;
};
