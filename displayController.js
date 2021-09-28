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

export default displayController
