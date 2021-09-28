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

export default gameBoard
