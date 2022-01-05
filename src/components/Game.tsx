import React from 'react';
import { GameState, GuessLetter, GuessValidationResult, KeyboardButtonStates } from '../models';
import { dailyWords, wordList } from '../utils';
import GuessList from './GuessList';
import Keyboard from './Keyboard';

export const WORD_SIZE = 5;
export const GUESS_LIST_SIZE = 6;

export const KEY_BACKSPACE = 'Backspace';
export const KEY_ENTER = 'Enter';
export const KEY_LETTERS = 'abcdefghijklmnopqrstuvwxyz';


class Game extends React.Component {
  state: GameState = {
    guesses: [
      [],
    ],
    isGameEnded: false,
    isGameWon: false,

    dailyWord: dailyWords[new Date().toISOString().split('T')[0]],

    keyboardButtonStates: {
      letters: true,
      back: false,
      enter: false,
    }
  }

  handleKeyDownFunction = (event: KeyboardEvent) => this.handleKeyDown(event);

  getLastGuess(guesses = this.state.guesses) {
    return guesses[guesses.length - 1];
  }

  updateLastGuess(newGuess: GuessLetter[]): GuessLetter[][] {
    return [...this.state.guesses.slice(0, this.state.guesses.length - 1), newGuess];
  }

  updateKeyboardButtonStates(guesses: GuessLetter[][]): KeyboardButtonStates {
    const lastGuess = this.getLastGuess(guesses);

    return {
      letters: lastGuess.length < WORD_SIZE,
      back: lastGuess.length > 0,
      enter: lastGuess.length === WORD_SIZE,
    }
  }

  isLastGuessInWordList(): boolean {
    const lastGuessWord = this.getLastGuess()
      .map(guess => guess.letter)
      .join('');

    return wordList.includes(lastGuessWord);
  }

  validateLastGuess(): GuessValidationResult {
    const lastGuess = this.getLastGuess();
    const dailyWordLetters = this.state.dailyWord.word.split('');

    const missingLetters = [];
    const validatedGuess: GuessLetter[] = [];

    let isRightGuess = false;

    for (let i = 0; i < WORD_SIZE; i++) {
      const letterState = lastGuess[i].letter === dailyWordLetters[i] ? 'right' : 'wrong';

      validatedGuess.push({
        letter: lastGuess[i].letter,
        state: letterState,
      });

      if (letterState === 'wrong') missingLetters.push(dailyWordLetters[i]);
    }

    isRightGuess = missingLetters.length <= 0;

    if (missingLetters.length) {
      const wrongLetters = validatedGuess.filter(guess => guess.state === 'wrong');

      for (let guessLetter of wrongLetters) {
        const indexOnMissingLetters = missingLetters.indexOf(guessLetter.letter);

        if (indexOnMissingLetters !== -1) {
          guessLetter.state = 'displaced';
          missingLetters.splice(indexOnMissingLetters, 1);
        }
      }
    }

    return {
      validatedGuess, isRightGuess,
    };
  }

  handleKeyboardLetter(letter: string) {
    const updatedGuesses = this.updateLastGuess([...this.getLastGuess(), { letter, state: 'typing' }]);

    this.setState({
      guesses: updatedGuesses,
      keyboardButtonStates: this.updateKeyboardButtonStates(updatedGuesses),
    });
  }

  handleKeyboardBack() {
    const lastGuess = this.getLastGuess();
    const newGuess: GuessLetter[] = lastGuess
      .slice(0, lastGuess.length - 1)
      .map(oldGuess => ({ letter: oldGuess.letter, state: 'typing' }) as GuessLetter);

    const updatedGuesses = this.updateLastGuess(newGuess);

    this.setState({
      guesses: updatedGuesses,
      keyboardButtonStates: this.updateKeyboardButtonStates(updatedGuesses),
    });
  }

  handleKeyboardEnter() {
    if (!this.isLastGuessInWordList()) {
      const newGuess = this.getLastGuess()
        .map(guess => ({ letter: guess.letter, state: 'wordlistError' }) as GuessLetter);

      const updatedGuesses = this.updateLastGuess(newGuess);

      this.setState({
        guesses: updatedGuesses,
        keyboardButtonStates: this.updateKeyboardButtonStates(updatedGuesses),
      });

      return;
    }

    const { validatedGuess, isRightGuess } = this.validateLastGuess();

    if (this.state.guesses.length === GUESS_LIST_SIZE || isRightGuess) {
      const updatedGuesses = this.updateLastGuess(validatedGuess);

      this.setState({
        isGameEnded: true,
        isGameWon: isRightGuess,
        guesses: updatedGuesses,
        keyboardButtonStates: this.updateKeyboardButtonStates(updatedGuesses),
      });
    } else {
      const updatedGuesses = [...this.updateLastGuess(validatedGuess), []];

      this.setState({
        guesses: updatedGuesses,
        keyboardButtonStates: this.updateKeyboardButtonStates(updatedGuesses),
      });
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === KEY_BACKSPACE && this.state.keyboardButtonStates.back) {
      this.handleKeyboardBack();
      return;
    }

    if (event.key === KEY_ENTER && this.state.keyboardButtonStates.enter) {
      this.handleKeyboardEnter();
      return;
    }

    if (KEY_LETTERS.includes(event.key) && this.state.keyboardButtonStates.letters) {
      this.handleKeyboardLetter(event.key.toUpperCase());
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDownFunction);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDownFunction);
  }

  render() {
    return (
      <div
        className='container mt-3'
      >
        <div className='mb-4'>
          <GuessList
            guesses={this.state.guesses}
          />
        </div>

        <Keyboard
          onLetterPress={(letter: string) => this.handleKeyboardLetter(letter)}
          onBackPress={() => this.handleKeyboardBack()}
          onEnterPress={() => this.handleKeyboardEnter()}

          buttonStates={this.state.keyboardButtonStates}
          enabled={!this.state.isGameEnded}
        />
      </div>
    )
  }
}

export default Game;