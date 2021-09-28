const gameBoard = (() => {
	let _board = Array(9).fill(null)

	const getField = (index, board = _board) => board[index]
	const setField = (index, player, board = _board) => {
		board[index] = player.getSign()
	}

	const resetBoard = (board = _board) => {
		board.fill(null)
	}

	const getEmptyFieldsIndices = (board = _board) => {
		const emptyFieldIndices = []
		board.forEach((field, index) => {
			if (!field) {
				emptyFieldIndices.push(index)
			}
		})
		return emptyFieldIndices
	}

	const checkGameStatus = (board = _board) => {
		// check for rows
		for (let i = 0; i <= 6; i += 3) {
			// starting index of rows; 0, 3, 6
			if (board[i] && board[i] === board[i + 1] && board[i] === board[i + 2]) {
				return { status: 'over', winner: board[i], indices: [i, i + 1, i + 2] }
			}
		}
		// check for columns
		for (let i = 0; i < 3; i++) {
			if (
				board[i] &&
				board[i] === board[i + 3] &&
				board[i] === board[i + 3 + 3]
			) {
				return {
					status: 'over',
					winner: board[i],
					indices: [i, i + 3, i + 3 + 3]
				}
			}
		}

		// check diagnol #1
		if (board[0] && board[0] === board[4] && board[0] === board[8]) {
			return { status: 'over', winner: board[0], indices: [0, 4, 8] }
		}
		// check diagnol #2
		if (board[2] && board[2] === board[4] && board[2] === board[6]) {
			return { status: 'over', winner: board[2], indices: [2, 4, 6] }
		}

		// check if game is a tie
		if (!board.some(f => f === null)) {
			return {
				status: 'over',
				winner: 'tie',
				indices: [0, 1, 2, 3, 4, 5, 6, 7, 8]
			}
		}

		// if its not over yet
		return { status: 'not over', winner: null, indices: [] }
	}

	const getBoardClone = () => {
		return _board.slice()
	}

	return {
		getField,
		setField,
		resetBoard,
		getEmptyFieldsIndices,
		checkGameStatus,
		getBoardClone
	}
})()

const displayController = (() => {
	const _boardUI = Array.from(document.querySelectorAll('.field-btn p'))

	const events = {
		fieldSelect: null,
		signChange: null,
		reset: null,
		difficultyChange: null
	}

	const _resetBoardUI = () => {
		document
			.querySelectorAll('.winner')
			.forEach(btn => btn.classList.remove('winner'))
		_boardUI.forEach(p => (p.textContent = ''))
		updateGameInfo('__your turn__')
	}

	let updateGameInfo = gameInfo => {
		return message => {
			gameInfo.textContent = message
		}
	}

	const highlightFields = indices => {
		const fieldBtns = document.querySelectorAll('.field-btn')
		indices.forEach(i => {
			fieldBtns[i].classList.add('winner')
		})
	}

	const renderBoard = (board = null) => {
		if (!board) return _resetBoardUI()
		board.forEach((field, index) => {
			if (!field) return (_boardUI[index].textContent = '')
			_boardUI[index].textContent = field
		})
	}

	const on = (eventName, callback) => {
		events[eventName] = callback
		return displayController
	}

	const init = ({
		fieldBtns,
		signSwitchBtns,
		resetBtn,
		difficultyDropdown,
		gameInfo
	}) => {
		fieldBtns.forEach((btn, index) => {
			btn.addEventListener(
				'click',
				() => events.fieldSelect && events.fieldSelect(index)
			)
		})

		signSwitchBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				if (!events.signChange) return

				document.querySelector('.signbtn.selected').classList.remove('selected')
				btn.classList.add('selected')
				btn.dataset.sign === 'X'
					? events.signChange('X')
					: events.signChange('O')
			})
		})

		resetBtn.addEventListener('click', () => events.reset && events.reset())

		difficultyDropdown.addEventListener('change', function () {
			events.difficultyChange && events.difficultyChange(+this.value)
		})

		displayController.updateGameInfo = updateGameInfo(gameInfo)

		displayController.getSign = function () {
			if (signSwitchBtns[0].classList.contains('selected'))
				return signSwitchBtns[0].textContent
			return signSwitchBtns[1].textContent
		}

		displayController.getDifficulty = function () {
			return difficultyDropdown.value
		}
	}

	return {
		highlightFields,
		updateGameInfo,
		on,
		init,
		renderBoard
	}
})()

const playerFactory = sign => {
	let _sign = sign
	const getSign = () => _sign
	const setSign = sign => {
		_sign = sign
	}
	return {
		getSign,
		setSign
	}
}

const gameController = (() => {
	let gameOver = false
	let whosTurn = 'humanPlayer'
	let difficulty = 0 // any number between 0 and 100 inclusively
	let _gameBoard

	const events = {
		move: null,
		gameOver: null
	}

	const humanPlayer = playerFactory('X')
	const botPlayer = playerFactory('O')

	const setDifficulty = num => {
		difficulty = num
	}
	const changeSign = sign => {
		humanPlayer.setSign(sign)
		sign === 'X' ? botPlayer.setSign('O') : botPlayer.setSign('X')
	}

	const makeMove = index => {
		if (_gameBoard.getField(index) || whosTurn === 'botPlayer' || gameOver)
			return

		_gameBoard.setField(index, humanPlayer)
		const gameStatus = _gameBoard.checkGameStatus()
		if (gameStatus.status === 'over') {
			gameOver = true
			events.move && events.move()
			events.gameOver && events.gameOver(gameStatus)
		} else {
			whosTurn = 'botPlayer'
			events.move && events.move(`__Mr. Bot's turn__`)
			setTimeout(makeAiMove, 300)
		}
	}

	const makeAiMove = () => {
		const emptyIndices = gameBoard.getEmptyFieldsIndices()

		// get a random number between 0 and 100
		const random = Math.round(Math.random() * 100)

		// if difficulty is less than random, use pick a random choice else choose best choice

		let index
		if (difficulty < random) {
			const r = Math.floor(Math.random() * emptyIndices.length)
			index = emptyIndices[r]
		} else {
			const bestMove = minimax(gameBoard.getBoardClone(), botPlayer)
			index = bestMove.index
		}

		_gameBoard.setField(index, botPlayer)
		const gameStatus = _gameBoard.checkGameStatus()
		if (gameStatus.status === 'over') {
			gameOver = true
			events.move && events.move()
			events.gameOver && events.gameOver(gameStatus)
		} else {
			whosTurn = 'humanPlayer'
			events.move && events.move(`__Your turn__`)
		}
	}

	const minimax = (newBoard, player, depth = 0) => {
		const emptyIndices = _gameBoard.getEmptyFieldsIndices(newBoard)

		const { winner } = _gameBoard.checkGameStatus(newBoard)
		if (winner === humanPlayer.getSign()) {
			return { score: depth - 20 }
		}
		if (winner === botPlayer.getSign()) {
			return { score: 20 - depth }
		}
		if (winner === 'tie') {
			return { score: 0 }
		}

		let moves = []

		emptyIndices.forEach(i => {
			const move = {}
			move.index = i

			newBoard[i] = player.getSign()

			if (player === humanPlayer) {
				const result = minimax(newBoard, botPlayer, depth + 1)
				move.score = result.score
			} else {
				const result = minimax(newBoard, humanPlayer, depth + 1)
				move.score = result.score
			}

			newBoard[i] = null

			moves.push(move)
		})

		let bestMove, bestScore

		if (player === botPlayer) {
			bestScore = -Infinity

			for (let i = 0; i < moves.length; i++) {
				if (moves[i].score > bestScore) {
					bestMove = moves[i]
					bestScore = moves[i].score
				}
			}
		} else {
			bestScore = Infinity
			for (let i = 0; i < moves.length; i++) {
				if (moves[i].score < bestScore) {
					bestMove = moves[i]
					bestScore = moves[i].score
				}
			}
		}

		return bestMove
	}

	const on = (eventName, callback) => {
		events[eventName] = callback
		return gameController
	}

	const init = ({ initialSign, initialDifficulty, gameBoard }) => {
		changeSign(initialSign)

		setDifficulty(initialDifficulty)

		_gameBoard = gameBoard
	}

	const reset = () => {
		gameOver = false
		whosTurn = 'humanPlayer'
		_gameBoard.resetBoard()
	}
	return {
		makeMove,
		makeAiMove,
		changeSign,
		setDifficulty,
		on,
		init,
		reset
	}
})()

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
