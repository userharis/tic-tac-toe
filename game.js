import displayController from './displayController.js'
import gameBoard from './gameBoard.js'
import gameController from './gameController.js'

const game = (() => {
	// DOM selections
	const fieldBtns = document.querySelectorAll('.field-btn')
	const signSwitchBtns = document.querySelectorAll('.signbtn')

	const resetBtn = document.querySelector('#reset')
	const difficultyDropdown = document.querySelector('#dropdown')

	const gameInfo = document.querySelector('.game-info')

	if (
		fieldBtns.length !== 9 ||
		signSwitchBtns.length !== 2 ||
		!resetBtn ||
		!difficultyDropdown ||
		!gameInfo
	) {
		throw new Error('cannot Initialize game because DOM selection(s) are null')
	}

	// Initialization

	displayController.init({
		fieldBtns,
		signSwitchBtns,
		resetBtn,
		difficultyDropdown,
		gameInfo
	})
	const initialSign = displayController.getSign()
	const initialDifficulty = displayController.getDifficulty()

	gameController.init({ initialSign, initialDifficulty, gameBoard })

	// Events
	displayController
		.on('fieldSelect', index => {
			gameController.makeMove(index)
		})

		.on('signChange', sign => {
			gameController.reset()
			displayController.renderBoard()
			gameController.changeSign(sign)
		})

		.on('reset', () => {
			gameController.reset()
			displayController.renderBoard()
		})

		.on('difficultyChange', difficulty => {
			console.log(difficulty)
			gameController.reset()
			displayController.renderBoard()
			gameController.setDifficulty(difficulty)
		})

	gameController
		.on('move', message => {
			const board = gameBoard.getBoardClone()
			displayController.renderBoard(board)
			if (message) {
				displayController.updateGameInfo(message)
			}
		})

		.on('gameOver', status => {
			const { winner } = status

			displayController.highlightFields(status.indices)

			if (winner === 'tie')
				return displayController.updateGameInfo(`__It's a tie, try again!__`)

			displayController.updateGameInfo(`__${winner} wins the game`)
		})
})()
