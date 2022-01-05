import { KeyboardButtonStates } from ".";

export type GuessLetterState =
  'typing' |
  'wrong' |
  'displaced' |
  'right' |
  'disabled' |
  'wordlistError';

export interface GuessLetter {
  letter: string;
  state: GuessLetterState;
}

export interface DailyWord {
  edition: string;
  date: string;
  word: string;
}

export interface DailyWordDatabase {
  [date: string]: DailyWord;
}

export interface GameState {
  dailyWord: DailyWord;
  guesses: GuessLetter[][];

  isGameEnded: boolean;
  isGameWon: boolean;

  keyboardButtonStates: KeyboardButtonStates;
}

export interface GuessValidationResult {
  validatedGuess: GuessLetter[];
  isRightGuess: boolean;
}