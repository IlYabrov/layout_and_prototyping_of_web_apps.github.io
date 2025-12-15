// Работа с localStorage для сохранения данных игры

const Storage = {
	// Ключи для хранения
	KEYS: {
		CURRENT_PLAYER: 'meaningGame_currentPlayer',
		GAME_STATE: 'meaningGame_gameState',
		RATINGS: 'meaningGame_ratings',
	},

	// Сохранить текущего игрока
	saveCurrentPlayer(playerName) {
		localStorage.setItem(this.KEYS.CURRENT_PLAYER, playerName);
	},

	// Получить текущего игрока
	getCurrentPlayer() {
		return localStorage.getItem(this.KEYS.CURRENT_PLAYER) || null;
	},

	// Сохранить состояние игры
	saveGameState(gameState) {
		localStorage.setItem(this.KEYS.GAME_STATE, JSON.stringify(gameState));
	},

	// Получить состояние игры
	getGameState() {
		const state = localStorage.getItem(this.KEYS.GAME_STATE);
		return state ? JSON.parse(state) : null;
	},

	// Очистить состояние игры
	clearGameState() {
		localStorage.removeItem(this.KEYS.GAME_STATE);
	},

	// Сохранить результат в рейтинг
	saveRating(playerName, score, level) {
		const ratings = this.getRatings();
		const newRating = {
			playerName,
			score,
			level,
			date: new Date().toISOString(),
			timestamp: Date.now(),
		};

		ratings.push(newRating);

		// Сортируем по очкам (по убыванию)
		ratings.sort((a, b) => b.score - a.score);

		localStorage.setItem(this.KEYS.RATINGS, JSON.stringify(ratings));
	},

	// Получить все рейтинги
	getRatings() {
		const ratings = localStorage.getItem(this.KEYS.RATINGS);
		return ratings ? JSON.parse(ratings) : [];
	},

	// Получить топ N игроков
	getTopRatings(limit = 10) {
		const ratings = this.getRatings();
		return ratings.slice(0, limit);
	},

	// Очистить все рейтинги
	clearRatings() {
		localStorage.removeItem(this.KEYS.RATINGS);
	},

	// Получить лучший результат игрока
	getPlayerBestScore(playerName) {
		const ratings = this.getRatings();
		const playerRatings = ratings.filter(r => r.playerName === playerName);

		if (playerRatings.length === 0) return 0;

		return Math.max(...playerRatings.map(r => r.score));
	},

	// Проверить, существует ли игрок с таким именем
	playerExists(playerName) {
		const ratings = this.getRatings();
		return ratings.some(r => r.playerName === playerName);
	},

	// Очистить все данные
	clearAll() {
		Object.values(this.KEYS).forEach(key => {
			localStorage.removeItem(key);
		});
	},
};
