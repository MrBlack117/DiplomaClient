export interface User {
  email: string
  password: string
  name?: string
  likedTests?: string[]
  dislikedTests?: string[]
}

export interface Message {
  message: string
}

export interface Comment {
  _id?: string
  text: string
  testId: string
  userId?: string
  date?:string
}

export interface Test {
  _id: string // _id?: string
  name: string
  brief: string
  description: string
  questionsIds?: string[]
  imageSrc?: string
  likes?: number
  dislikes?: number
  possibleResults?: string[]
  usersResults?: string[]
  comments?: string[]
  date?: string
}

export interface PossibleResult {
  _id?: string
  name: string
  description: string
  imageSrc?: string
  testId: string
}

export interface Question {
  _id?: string
  text: string
  testId: string
  answerOptionIds?: string[]
  answerOptions?:  string[]
  answerOptionsObj?: AnswerOption[]
}

export interface AnswerOption {
  _id?: string
  text: string
  questionId?: string
  possibleResultId: string
  score: number
}

export interface UserTestResult {
  _id?: string
  test: string
  user?: string
  date?: Date
  results: Result[]
  answers: string[]
}

export interface Result {
  _id: string //possibleResultId
  score: number
}

export interface ProcessedResult {
  name: string,
  description: string
  imageSrc?: string
  score: number
}

export interface TestStatistics {
  testName: string;
  possibleResults: { name: string, frequency: number, percent: number }[];
  questions: { name: string, answerOptions: { name: string, frequency: number, percent: number }[] }[];
}
