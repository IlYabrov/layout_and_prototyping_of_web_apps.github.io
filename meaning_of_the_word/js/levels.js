// Логика страницы выбора уровней (levels.html)

document.addEventListener('DOMContentLoaded', () => {
	console.log('levels.js loaded');

	const playerName = Storage.getCurrentPlayer();
	console.log('Current player:', playerName);

	// Проверяем, что игрок залогинен
	if (!playerName) {
		alert('Сначала необходимо войти в игру');
		window.location.href = 'index.html';
		return;
	}

	// Отображаем имя игрока
	const playerNameDisplay = document.getElementById('playerNameDisplay');
	if (playerNameDisplay) {
		playerNameDisplay.textContent = playerName;
	} else {
		console.error('playerNameDisplay element not found');
	}

	// Получаем прогресс игрока
	const progress = Storage.getLevelProgress(playerName);
	console.log('Player progress:', progress);

	// Обновляем отображение уровней
	updateLevelsDisplay(progress);

	// Обработчики событий
	const backBtn = document.getElementById('backBtn');
	console.log('backBtn element:', backBtn);

	if (backBtn) {
		backBtn.addEventListener('click', () => {
			console.log('Back button clicked');
			window.location.href = 'index.html';
		});
	} else {
		console.error('backBtn element not found!');
	}

	const ratingBtn = document.getElementById('ratingBtn');
	if (ratingBtn) {
		ratingBtn.addEventListener('click', () => {
			window.location.href = 'rating.html';
		});
	}

	// Обработчики кнопок запуска уровней
	document.querySelectorAll('.level-start-btn').forEach(btn => {
		btn.addEventListener('click', e => {
			const level = parseInt(e.target.dataset.level);
			startLevel(level);
		});
	});
});

function updateLevelsDisplay(progress) {
	const playerName = Storage.getCurrentPlayer();

	// Обновляем каждый уровень
	[1, 2, 3, 4].forEach(level => {
		const card = document.querySelector(`.level-card[data-level="${level}"]`);
		const statusIcon = document.getElementById(`status-${level}`);
		const scoreDisplay = document.getElementById(`score-${level}`);
		const startBtn = card.querySelector('.level-start-btn');

		const levelData = progress[level];

		// Обновляем статус уровня
		if (levelData.completed) {
			statusIcon.textContent = '✅';
			card.classList.add('completed');
			card.classList.remove('locked');
			startBtn.disabled = false;
		} else if (levelData.unlocked) {
			statusIcon.textContent = '🔓';
			card.classList.remove('locked', 'completed');
			startBtn.disabled = false;
		} else {
			statusIcon.textContent = '🔒';
			card.classList.add('locked');
			startBtn.disabled = true;
		}

		// Показываем лучший результат, если он есть
		if (levelData.bestScore > 0) {
			scoreDisplay.textContent = `Лучший счёт: ${levelData.bestScore}`;
		} else {
			scoreDisplay.textContent = '';
		}
	});
}

function startLevel(level) {
	const playerName = Storage.getCurrentPlayer();

	// Проверяем, разблокирован ли уровень
	if (!Storage.isLevelUnlocked(playerName, level)) {
		showNotification(
			'Уровень заблокирован',
			'Сначала завершите предыдущий уровень'
		);
		return;
	}

	// Инициализируем состояние игры для выбранного уровня
	const initialGameState = {
		playerName: playerName,
		currentLevel: level,
		selectedLevel: level, // Добавляем флаг выбранного уровня
		currentQuestion: 0,
		score: 0,
		startTime: Date.now(),
		levelIndex: level - 1, // Для совместимости с существующим кодом
	};

	Storage.saveGameState(initialGameState);

	// Переход на страницу игры
	window.location.href = 'game.html';
}

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
