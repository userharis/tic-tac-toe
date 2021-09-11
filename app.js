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

	const setField = (index, player) => {
		const el = _boardUI[index]
		el.textContent = player.getSign()
	}

	const resetBoardUI = () => {
		document
			.querySelectorAll('.winner')
			.forEach(btn => btn.classList.remove('winner'))
		_boardUI.forEach(p => (p.textContent = ''))
		updateGameInfo('__your turn__')
	}

	const updateGameInfo = message => {
		const gameInfo = document.querySelector('.game-info')
		gameInfo.textContent = message
	}
	const highlightFields = indices => {
		const fieldBtns = document.querySelectorAll('.field-btn')
		indices.forEach(i => {
			fieldBtns[i].classList.add('winner')
		})
	}

	const _signSwitch = (() => {
		const btns = document.querySelectorAll('.signbtn')
		btns.forEach(btn => {
			btn.addEventListener('click', () => {
				document.querySelector('.signbtn.selected').classList.remove('selected')
				btn.classList.add('selected')
				btn.dataset.sign === 'X'
					? gameController.changeSign('X')
					: gameController.changeSign('O')
			})
		})
	})()

	const _difficultyDropdown = (() => {
		const dropdown = document.getElementById('dropdown')
		dropdown.addEventListener('change', function () {
			const difficulty = +this.value
			gameController.setDifficulty(difficulty)
		})
	})()

	const _init = (() => {
		const fieldBtns = document.querySelectorAll('.field-btn')
		fieldBtns.forEach((btn, index) => {
			btn.addEventListener('click', () => gameController.makeMove(index))
		})
	})()

	return {
		setField,
		resetBoardUI,
		highlightFields,
		updateGameInfo
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

	const humanPlayer = playerFactory('X')
	const botPlayer = playerFactory('O')

	const setDifficulty = num => {
		difficulty = num
	}
	const changeSign = sign => {
		gameOver = false
		whosTurn = 'humanPlayer'
		displayController.resetBoardUI()
		gameBoard.resetBoard()

		humanPlayer.setSign(sign)
		sign === 'X' ? botPlayer.setSign('O') : botPlayer.setSign('X')
	}

	const makeMove = index => {
		if (gameBoard.getField(index) || whosTurn === 'botPlayer' || gameOver)
			return
		gameBoard.setField(index, humanPlayer)
		displayController.setField(index, humanPlayer)
		const gameStatus = gameBoard.checkGameStatus()
		if (gameStatus.status === 'over') {
			displayController.highlightFields(gameStatus.indices)
			if (gameStatus.winner === 'tie') {
				displayController.updateGameInfo(`__It's a tie, try again!__`)
			} else {
				displayController.updateGameInfo(
					`__${gameStatus.winner} wins the game.__`
				)
			}
			gameOver = true
		} else {
			whosTurn = 'botPlayer'
			displayController.updateGameInfo("__Mr. Bot's turn__")
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

		gameBoard.setField(index, botPlayer)
		displayController.setField(index, botPlayer)

		const gameStatus = gameBoard.checkGameStatus()
		if (gameStatus.status === 'over') {
			displayController.highlightFields(gameStatus.indices)
			if (gameStatus.winner === 'tie') {
				displayController.updateGameInfo(`__It's a tie, try again!__`)
			} else {
				displayController.updateGameInfo(
					`__${gameStatus.winner} wins the game.__`
				)
			}
			gameOver = true
		} else {
			whosTurn = 'humanPlayer'
			displayController.updateGameInfo('__your turn__')
		}
	}

	const minimax = (newBoard, player, depth = 0) => {
		const emptyIndices = gameBoard.getEmptyFieldsIndices(newBoard)

		const { winner } = gameBoard.checkGameStatus(newBoard)
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

	return {
		makeMove,
		makeAiMove,
		changeSign,
		setDifficulty
	}
})()
