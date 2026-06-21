import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChallengeQuestion {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

export const ALL_QUESTIONS: ChallengeQuestion[] = [
  {
    id: 1,
    question: 'What does "temperature" control in a language model?',
    options: [
      'Processing speed',
      'Randomness / creativity of output',
      'Maximum token length',
      'Context window size',
    ],
    correct: 1,
    explanation:
      'Temperature controls how random or deterministic the model output is. Higher values produce more creative, varied responses; lower values produce more focused, deterministic ones.',
  },
  {
    id: 2,
    question: 'Which prompt technique asks the model to reason step-by-step before answering?',
    options: [
      'Few-shot prompting',
      'Zero-shot prompting',
      'Chain-of-thought prompting',
      'Role prompting',
    ],
    correct: 2,
    explanation:
      'Chain-of-thought (CoT) prompting encourages the model to show its reasoning process, which often leads to more accurate answers on complex tasks.',
  },
  {
    id: 3,
    question: 'What is a "token" in the context of LLMs?',
    options: [
      'An authentication credential',
      'A full word or sentence',
      'A chunk of text (roughly a word or part of a word)',
      'A database record',
    ],
    correct: 2,
    explanation:
      'Tokens are the basic units LLMs process. A token is roughly 4 characters or ¾ of a word. The model generates text one token at a time.',
  },
  {
    id: 4,
    question: 'What is "RAG" in AI applications?',
    options: [
      'Rapid Application Generation',
      'Retrieval-Augmented Generation',
      'Random Activation Gating',
      'Recursive Attention Graph',
    ],
    correct: 1,
    explanation:
      'Retrieval-Augmented Generation (RAG) combines a retrieval system with an LLM, letting the model answer based on retrieved documents rather than only its training data.',
  },
  {
    id: 5,
    question: 'What is "hallucination" in large language models?',
    options: [
      'When the model runs out of memory',
      'When the model generates confident but factually incorrect output',
      'When the model repeats itself in a loop',
      'A technique to visualize attention',
    ],
    correct: 1,
    explanation:
      "Hallucination refers to the model generating plausible-sounding but incorrect or made-up information, often presenting it confidently as fact.",
  },
  {
    id: 6,
    question: 'In prompt engineering, what is a "system prompt"?',
    options: [
      'A user message in a chat',
      'Instructions given to the model before any user input, setting its behavior',
      'The model\'s internal monologue',
      'A tool call result',
    ],
    correct: 1,
    explanation:
      'A system prompt is a privileged set of instructions provided before the conversation starts, typically used to define the model\'s persona, rules, and task context.',
  },
  {
    id: 7,
    question: 'What does "few-shot prompting" mean?',
    options: [
      'Providing no examples in the prompt',
      'Fine-tuning a model on a small dataset',
      'Including a small number of input/output examples in the prompt',
      'Running inference with reduced precision',
    ],
    correct: 2,
    explanation:
      'Few-shot prompting includes 1–10 example input/output pairs in the prompt to demonstrate the desired format or reasoning pattern to the model.',
  },
  {
    id: 8,
    question: 'What is the "context window" of an LLM?',
    options: [
      'The UI panel showing the chat',
      'The maximum amount of text (in tokens) the model can process at once',
      'A window of time during training',
      'The model\'s attention to the most recent message only',
    ],
    correct: 1,
    explanation:
      'The context window is the total amount of text (measured in tokens) the model can attend to simultaneously — including both the input and the output it generates.',
  },
  {
    id: 9,
    question: 'Which of these is a best practice for writing effective prompts?',
    options: [
      'Keep prompts as short as possible, always',
      'Use vague language to give the model flexibility',
      'Be specific about the task, format, and desired output',
      'Never provide examples',
    ],
    correct: 2,
    explanation:
      'Effective prompts are specific about what you want: describe the task clearly, specify the output format, provide context, and include examples when helpful.',
  },
  {
    id: 10,
    question: 'What is "fine-tuning" an LLM?',
    options: [
      'Adjusting the temperature at inference time',
      'Training the model further on a specific dataset to adapt its behavior',
      'Pruning unused weights from the model',
      'Caching frequent queries for faster responses',
    ],
    correct: 1,
    explanation:
      'Fine-tuning continues training a pre-trained model on a curated dataset, adapting its knowledge and style to a specific domain or task.',
  },
]

// Seeded shuffle by date string
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  for (let i = copy.length - 1; i > 0; i--) {
    hash = ((hash * 1664525) + 1013904223) | 0
    const j = Math.abs(hash) % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function getDailyQuestions(): ChallengeQuestion[] {
  const today = new Date().toISOString().slice(0, 10)
  const shuffled = seededShuffle(ALL_QUESTIONS, today)
  return shuffled.slice(0, 5)
}

interface DailyChallengeState {
  date: string
  answers: Record<number, number>
  completed: boolean
  score: number
  startTime: number | null
  endTime: number | null
  setAnswer: (questionId: number, answer: number) => void
  completeChallenge: (score: number) => void
  resetIfNewDay: () => void
}

export const useDailyChallengeStore = create<DailyChallengeState>()(
  persist(
    (set, get) => ({
      date: '',
      answers: {},
      completed: false,
      score: 0,
      startTime: null,
      endTime: null,

      setAnswer: (questionId, answer) => {
        const today = new Date().toISOString().slice(0, 10)
        const state = get()
        if (state.date !== today) {
          set({ date: today, answers: { [questionId]: answer }, completed: false, score: 0, startTime: Date.now(), endTime: null })
        } else {
          set({ answers: { ...state.answers, [questionId]: answer }, startTime: state.startTime ?? Date.now() })
        }
      },

      completeChallenge: (score) => {
        set({ completed: true, score, endTime: Date.now() })
      },

      resetIfNewDay: () => {
        const today = new Date().toISOString().slice(0, 10)
        if (get().date !== today) {
          set({ date: today, answers: {}, completed: false, score: 0, startTime: null, endTime: null })
        }
      },
    }),
    {
      name: 'daily-challenge-storage',
    },
  ),
)
