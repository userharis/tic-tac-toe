const gameBoard = (() => {
	let _board = Array(9).fill(undefined)

	const getField = index => _board[index]
	const setField = (index, player) => {
		_board[index] = player.getSign()
	}
	const resetBoard = () => {
		_board.fill(undefined)
	}
	const getEmptyFieldsIndexes = () => {}
	return {
		getField,
		setField,
		resetBoard
	}
})()

const displayController = (() => {
	const _boardUI = Array.from(document.querySelectorAll('.field-btn p'))

	const setField = (index, player) => {
		const el = _boardUI[index]
		el.textContent = player.getSign()
	}

	const resetBoardUI = () => {
		_boardUI.forEach(p => (p.textContent = ''))
	}

	return {
		setField,
		resetBoardUI
	}
})()
