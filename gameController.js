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
		const emptyIndices = _gameBoard.getEmptyFieldsIndices()

		// get a random number between 0 and 100
		const random = Math.round(Math.random() * 100)

		// if difficulty is less than random, use pick a random choice else choose best choice

		let index
		if (difficulty < random) {
			const r = Math.floor(Math.random() * emptyIndices.length)
			index = emptyIndices[r]
		} else {
			const bestMove = minimax(_gameBoard.getBoardClone(), botPlayer)
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

export default gameController
