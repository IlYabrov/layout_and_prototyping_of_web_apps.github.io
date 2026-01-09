// Логика стартовой страницы (index.html)

document.addEventListener('DOMContentLoaded', () => {
	const playerNameInput = document.getElementById('playerName');
	const startBtn = document.getElementById('startBtn');
	const ratingBtn = document.getElementById('ratingBtn');

	// Проверяем, есть ли сохранённое имя игрока
	const savedPlayer = Storage.getCurrentPlayer();
	if (savedPlayer) {
		playerNameInput.value = savedPlayer;
	}

	// Фокус на поле ввода
	playerNameInput.focus();

	// Валидация имени при вводе
	playerNameInput.addEventListener('input', e => {
		const value = e.target.value.trim();
		startBtn.disabled = value.length < 2;

		// Визуальная обратная связь
		if (value.length >= 2) {
			playerNameInput.style.borderColor = '#27ae60';
		} else {
			playerNameInput.style.borderColor = '';
		}
	});

	// Начать игру при нажатии Enter
	playerNameInput.addEventListener('keypress', e => {
		if (e.key === 'Enter' && playerNameInput.value.trim().length >= 2) {
			startGame();
		}
	});

	// Обработчик кнопки "Начать игру"
	startBtn.addEventListener('click', startGame);

	// Обработчик кнопки "Выбрать уровень"
	document.getElementById('levelSelectBtn').addEventListener('click', () => {
		const playerName = playerNameInput.value.trim();

		if (playerName.length < 2) {
			showNotification('Ошибка', 'Пожалуйста, введите имя (минимум 2 символа)');
			playerNameInput.focus();
			return;
		}

		// Сохраняем имя игрока
		Storage.saveCurrentPlayer(playerName);

		// Переходим на страницу выбора уровней
		window.location.href = 'levels.html';
	});

	// Обработчик кнопки "Рейтинг"
	ratingBtn.addEventListener('click', () => {
		window.location.href = 'rating.html';
	});

	// Функция для показа уведомлений
	function showNotification(title, message) {
		const modal = document.getElementById('notificationModal');
		const titleEl = document.getElementById('notificationTitle');
		const messageEl = document.getElementById('notificationMessage');
		const okBtn = document.getElementById('notificationOkBtn');

		titleEl.textContent = title;
		messageEl.textContent = message;

		okBtn.onclick = () => {
			modal.classList.remove('show');
		};

		modal.classList.add('show');
	}

	function startGame() {
		const playerName = playerNameInput.value.trim();

		if (playerName.length < 2) {
			showNotification('Ошибка', 'Пожалуйста, введите имя (минимум 2 символа)');
			playerNameInput.focus();
			return;
		}

		// Сохраняем имя игрока
		Storage.saveCurrentPlayer(playerName);

		// Инициализируем начальное состояние игры
		const initialGameState = {
			playerName: playerName,
			currentLevel: 1,
			currentQuestion: 0,
			score: 0,
			startTime: Date.now(),
		};

		Storage.saveGameState(initialGameState);

		// Анимация перехода
		document.querySelector('.container').style.animation = 'fadeOut 0.5s ease';

		setTimeout(() => {
			window.location.href = 'game.html';
		}, 500);
	}

	// Добавляем CSS для анимации выхода
	const style = document.createElement('style');
	style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }
    `;
	document.head.appendChild(style);

	// Анимация заголовка при наведении
	const gameTitle = document.querySelector('.game-title');
	gameTitle.addEventListener('mouseenter', () => {
		gameTitle.style.transform = 'scale(1.1) rotate(-2deg)';
	});

	gameTitle.addEventListener('mouseleave', () => {
		gameTitle.style.transform = '';
	});

	// Эффект печатания для подзаголовка
	const subtitle = document.querySelector('.subtitle');
	const subtitleText = subtitle.textContent;
	subtitle.textContent = '';

	let i = 0;
	const typeWriter = () => {
		if (i < subtitleText.length) {
			subtitle.textContent += subtitleText.charAt(i);
			i++;
			setTimeout(typeWriter, 50);
		}
	};

	setTimeout(typeWriter, 500);
});
