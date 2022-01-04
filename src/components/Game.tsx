import React from 'react';
import { GameState, GuessLetter, GuessValidationResult, KeyboardButtonStates } from '../models';
import GuessList from './GuessList';
import Keyboard from './Keyboard';

export const WORD_SIZE = 5;
export const GUESS_LIST_SIZE = 6;

class Game extends React.Component {
  state: GameState = {
    guesses: [
      [],
    ],
    isGameEnded: false,
    isGameWon: false,

    dailyWord: 'BOTAS'.split(''),
  }

  getLastGuess() {
    return this.state.guesses[this.state.guesses.length - 1];
  }

  updateLastGuess(newGuess: GuessLetter[]): GuessLetter[][] {
    return [...this.state.guesses.slice(0, this.state.guesses.length - 1), newGuess];
  }

  validateLastGuess(): GuessValidationResult {
    const lastGuess = this.getLastGuess();

    const missingLetters = [];
    const validatedGuess: GuessLetter[] = [];

    let isRightGuess = false;

    for (let i = 0; i < WORD_SIZE; i++) {
      const letterState = lastGuess[i].letter === this.state.dailyWord[i] ? 'right' : 'wrong';

      validatedGuess.push({
        letter: lastGuess[i].letter,
        state: letterState,
      });

      if (letterState === 'wrong') missingLetters.push(this.state.dailyWord[i]);
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
    this.setState({
      guesses: this.updateLastGuess([...this.getLastGuess(), { letter, state: 'typing' }]),
    });
  }

  handleKeyboardBack() {
    const lastGuess = this.getLastGuess();
    const newGuess = lastGuess.slice(0, lastGuess.length - 1);

    this.setState({
      guesses: this.updateLastGuess(newGuess),
    });
  }

  handleKeyboardEnter() {
    const { validatedGuess, isRightGuess } = this.validateLastGuess();

    this.updateLastGuess(validatedGuess);

    if (this.state.guesses.length === GUESS_LIST_SIZE || isRightGuess) {
      this.setState({
        isGameEnded: true,
        isGameWon: isRightGuess,
        guesses: this.updateLastGuess(validatedGuess),
      });
    } else {
      this.setState({
        guesses: [...this.updateLastGuess(validatedGuess), []],
      });
    }
  }

  render() {
    const lastGuess = this.getLastGuess();

    const buttonStates: KeyboardButtonStates = {
      letters: lastGuess.length < WORD_SIZE,
      back: lastGuess.length > 0,
      enter: lastGuess.length === WORD_SIZE,
    }

    return (
      <div className='container mt-3'>
        <div className='mb-4'>
          <GuessList
            guesses={this.state.guesses}
          />
        </div>

        <Keyboard
          onLetterPress={(letter: string) => this.handleKeyboardLetter(letter)}
          onBackPress={() => this.handleKeyboardBack()}
          onEnterPress={() => this.handleKeyboardEnter()}

          buttonStates={buttonStates}
          enabled={!this.state.isGameEnded}
        />
      </div>
    )
  }
}

export default Game;