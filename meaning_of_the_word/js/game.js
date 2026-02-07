// Основная логика игры (game.html)

class Game {
	constructor() {
		this.gameState = Storage.getGameState();

		if (!this.gameState) {
			alert('Ошибка загрузки игры. Возврат на главную страницу.');
			window.location.href = 'index.html';
			return;
		}

		// Проверяем режим игры: отдельный уровень или последовательное прохождение
		this.isSingleLevelMode = !!this.gameState.selectedLevel;

		if (this.isSingleLevelMode) {
			// Режим одного уровня
			this.currentLevel = this.gameState.selectedLevel;
			this.levelSequence = [this.currentLevel];
			this.levelIndex = 0;
		} else {
			// Последовательное прохождение уровней: 1, 2, 3, 4
			this.levelSequence = [1, 2, 3, 4];
			this.levelIndex = this.gameState.levelIndex || 0;
			this.currentLevel = this.levelSequence[this.levelIndex];
		}

		this.currentQuestion = 0;
		this.score = this.gameState.score || 0;
		this.timer = null;

		// Устанавливаем таймер в зависимости от режима
		if (this.isSingleLevelMode) {
			const settings = difficultySettings[this.currentLevel];
			this.timeLeft = settings.timeLimit;
		} else {
			this.timeLeft = 230; // Общий таймер на всю игру
		}

		this.questionsAnswered = 0;
		this.timerStarted = false; // Флаг для однократного запуска таймера

		this.currentLevelData = null;
		this.userAnswers = [];

		// Массив для отслеживания использованных наборов пар слов
		this.usedDataSets = [];
		// Массивы для отслеживания использованных данных уровней 2 и 3
		this.usedClusterSets = [];
		this.usedTextSets = [];

		this.init();
	}

	init() {
		console.log('Game.init() called');
		console.log('Current level:', this.currentLevel);
		console.log('isSingleLevelMode:', this.isSingleLevelMode);
		this.updateUI();
		this.setupEventListeners();
		this.loadLevel();
		console.log('Game.init() completed');
	}

	setupEventListeners() {
		document
			.getElementById('checkBtn')
			.addEventListener('click', () => this.checkAnswer());
		document
			.getElementById('skipBtn')
			.addEventListener('click', () => this.skipQuestion());
		document
			.getElementById('exitBtn')
			.addEventListener('click', () => this.exitGame());
		document
			.getElementById('nextBtn')
			.addEventListener('click', () => this.nextQuestion());
		document
			.getElementById('restartBtn')
			.addEventListener('click', () => this.restartGame());
		document.getElementById('ratingPageBtn').addEventListener('click', () => {
			window.location.href = 'rating.html';
		});
		document.getElementById('levelsPageBtn').addEventListener('click', () => {
			window.location.href = 'levels.html';
		});

		// Клавиатурные события
		document.addEventListener('keydown', e => {
			if (e.key === 'Escape') {
				this.exitGame();
			}
		});
	}

	updateUI() {
		document.getElementById('currentPlayer').textContent =
			this.gameState.playerName;
		document.getElementById('currentLevel').textContent = this.currentLevel;
		document.getElementById('score').textContent = this.score;
	}

	loadLevel() {
		console.log('loadLevel called, currentLevel:', this.currentLevel);
		this.questionsAnswered = 0;
		// Запускаем таймер только один раз в начале игры
		if (!this.timerStarted) {
			this.startTimer();
			this.timerStarted = true;
		}

		try {
			switch (this.currentLevel) {
				case 1:
					this.loadPairsLevel();
					break;
				case 2:
					this.loadPathLevel();
					break;
				case 3:
					this.loadTextLevel();
					break;
				case 4:
					this.loadFallingLevel();
					break;
				default:
					this.completeGame();
			}
		} catch (error) {
			console.error('Error in loadLevel:', error);
			alert('Ошибка загрузки уровня: ' + error.message);
		}
	}

	startTimer() {
		console.log('startTimer called, timeLeft:', this.timeLeft);
		// Таймер уже установлен в конструкторе (150 секунд на всю игру)
		const timerEl = document.getElementById('timer');
		if (!timerEl) {
			console.error('timer element not found!');
			return;
		}
		timerEl.textContent = this.timeLeft;

		if (this.timer) clearInterval(this.timer);

		this.timer = setInterval(() => {
			this.timeLeft--;
			document.getElementById('timer').textContent = this.timeLeft;

			const timerElement = document.querySelector('.timer');
			if (this.timeLeft <= 10) {
				timerElement.classList.add('warning');
			}

			if (this.timeLeft <= 0) {
				clearInterval(this.timer);
				this.timeUp();
			}
		}, 1000);
		console.log('Timer started successfully');
	}

	stopTimer() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	timeUp() {
		this.showModal(
			'⏰ Время вышло!',
			`Вы не успели завершить уровень ${this.currentLevel}. Ваш счёт: ${this.score}`,
			true
		);
	}

	// ========== УРОВЕНЬ 1: Пары слов ==========
	loadPairsLevel() {
		console.log('loadPairsLevel called');
		const gameArea = document.getElementById('gameArea');
		if (!gameArea) {
			console.error('gameArea not found!');
			return;
		}

		gameArea.innerHTML =
			'<h2>Уровень 1. Найти пары слов</h2><p>Соедините связанные слова, нажимая сначала на слово в левом ряду, а затем на подходящее слово в правом ряду.</p>';

		const levelSettings = difficultySettings[this.currentLevel];
		console.log('Settings:', levelSettings);

		const totalQuestionsEl = document.getElementById('totalQuestions');
		if (totalQuestionsEl) {
			totalQuestionsEl.textContent = levelSettings.questionsPerLevel;
		} else {
			console.error('totalQuestions element not found!');
		}

		this.generatePairsQuestion();
	}

	generatePairsQuestion() {
		console.log('generatePairsQuestion called');
		const settings = difficultySettings[this.currentLevel];
		document.getElementById('currentQuestion').textContent =
			this.questionsAnswered + 1;

		console.log(
			'wordPairsData:',
			wordPairsData ? wordPairsData.length : 'undefined'
		);

		// Выбираем случайный набор данных, исключая уже использованные
		let availableDataSets = wordPairsData.filter(
			(_, index) => !this.usedDataSets.includes(index)
		);

		// Если все наборы уже использованы, сбрасываем список
		if (availableDataSets.length === 0) {
			this.usedDataSets = [];
			availableDataSets = wordPairsData;
		}

		// Случайный выбор из доступных наборов
		const randomIndex = Math.floor(Math.random() * availableDataSets.length);
		const dataSet = availableDataSets[randomIndex];

		// Запоминаем индекс использованного набора в оригинальном массиве
		const originalIndex = wordPairsData.indexOf(dataSet);
		this.usedDataSets.push(originalIndex);

		const pairs = [...dataSet.pairs];

		// Перемешиваем правые слова
		const rightWords = pairs.map(p => p.right).sort(() => Math.random() - 0.5);

		this.currentLevelData = {
			correctPairs: pairs,
			userMatches: {},
			pairColors: [
				'#FF6B6B',
				'#4ECDC4',
				'#45B7D1',
				'#FFA07A',
				'#98D8C8',
				'#F7DC6F',
				'#BB8FCE',
				'#85C1E2',
				'#F8B195',
				'#C06C84',
			],
			usedColorIndex: 0,
		};

		const gameArea = document.getElementById('gameArea');

		// Удаляем предыдущий контейнер пар, если есть
		const oldContainer = gameArea.querySelector('.pairs-game');
		if (oldContainer) {
			oldContainer.remove();
		}

		const pairsContainer = document.createElement('div');
		pairsContainer.className = 'pairs-game';
		pairsContainer.innerHTML = `
            <div class="word-column">
                <h3>Слова</h3>
                <div id="leftColumn"></div>
            </div>
            <div class="word-column">
                <h3>Соедините с</h3>
                <div id="rightColumn"></div>
            </div>
        `;

		gameArea.appendChild(pairsContainer);

		const leftColumn = document.getElementById('leftColumn');
		const rightColumn = document.getElementById('rightColumn');

		// Создаём левые слова
		pairs.forEach((pair, index) => {
			const wordItem = document.createElement('div');
			wordItem.className = 'word-item';
			wordItem.textContent = pair.left;
			wordItem.dataset.index = index;
			wordItem.draggable = true;

			wordItem.addEventListener('dragstart', e => {
				e.dataTransfer.setData('leftIndex', index);
				wordItem.classList.add('dragging');
			});

			wordItem.addEventListener('dragend', () => {
				wordItem.classList.remove('dragging');
			});

			// Клик для выбора
			wordItem.addEventListener('click', () => {
				document.querySelectorAll('#leftColumn .word-item').forEach(el => {
					if (el !== wordItem) el.classList.remove('selected');
				});
				wordItem.classList.toggle('selected');
			});

			leftColumn.appendChild(wordItem);
		});

		// Создаём правые слова
		rightWords.forEach((word, index) => {
			const wordItem = document.createElement('div');
			wordItem.className = 'word-item';
			wordItem.textContent = word;
			wordItem.dataset.word = word;

			wordItem.addEventListener('dragover', e => {
				e.preventDefault();
			});

			wordItem.addEventListener('drop', e => {
				e.preventDefault();
				const leftIndex = e.dataTransfer.getData('leftIndex');
				const leftWord = pairs[leftIndex].left;
				const leftElement = document.querySelector(
					`#leftColumn .word-item[data-index="${leftIndex}"]`
				);

				// Отменяем предыдущее соединение для этого правого слова
				this.unmatchRightWord(word);

				// Отменяем предыдущее соединение для левого слова, если было
				if (this.currentLevelData.userMatches[leftWord]) {
					this.unmatchLeftWord(leftWord);
				}

				// Создаем новое соединение
				const color =
					this.currentLevelData.pairColors[
						this.currentLevelData.usedColorIndex %
							this.currentLevelData.pairColors.length
					];
				this.currentLevelData.usedColorIndex++;

				this.currentLevelData.userMatches[leftWord] = word;
				wordItem.style.background = color;
				wordItem.style.color = 'white';
				wordItem.dataset.matchedWith = leftWord;

				if (leftElement) {
					leftElement.style.background = color;
					leftElement.style.color = 'white';
					leftElement.classList.add('matched');
				}
			});

			// Клик для соединения
			wordItem.addEventListener('click', () => {
				const selectedLeft = document.querySelector(
					'#leftColumn .word-item.selected'
				);
				if (selectedLeft) {
					const leftWord = selectedLeft.textContent;

					// Отменяем предыдущее соединение для этого правого слова
					this.unmatchRightWord(word);

					// Отменяем предыдущее соединение для левого слова, если было
					if (this.currentLevelData.userMatches[leftWord]) {
						this.unmatchLeftWord(leftWord);
					}

					// Создаем новое соединение
					const color =
						this.currentLevelData.pairColors[
							this.currentLevelData.usedColorIndex %
								this.currentLevelData.pairColors.length
						];
					this.currentLevelData.usedColorIndex++;

					this.currentLevelData.userMatches[leftWord] = word;
					wordItem.style.background = color;
					wordItem.style.color = 'white';
					wordItem.dataset.matchedWith = leftWord;

					selectedLeft.classList.remove('selected');
					selectedLeft.classList.add('matched');
					selectedLeft.style.background = color;
					selectedLeft.style.color = 'white';
				} else {
					// Если ничего не выбрано слева, отменяем соединение этого правого слова
					this.unmatchRightWord(word);
				}
			});

			// Двойной клик для отмены соединения
			wordItem.addEventListener('dblclick', () => {
				this.unmatchRightWord(word);
			});

			rightColumn.appendChild(wordItem);
		});
	}

	unmatchRightWord(rightWord) {
		// Находим левое слово, которое было соединено с этим правым
		let leftWord = null;
		Object.keys(this.currentLevelData.userMatches).forEach(key => {
			if (this.currentLevelData.userMatches[key] === rightWord) {
				leftWord = key;
			}
		});

		if (leftWord) {
			delete this.currentLevelData.userMatches[leftWord];

			// Сбрасываем стили правого слова
			const rightElement = document.querySelector(
				`#rightColumn .word-item[data-word="${rightWord}"]`
			);
			if (rightElement) {
				rightElement.style.background = '';
				rightElement.style.color = '';
				delete rightElement.dataset.matchedWith;
			}

			// Сбрасываем стили левого слова
			const leftElement = Array.from(
				document.querySelectorAll('#leftColumn .word-item')
			).find(el => el.textContent === leftWord);
			if (leftElement) {
				leftElement.style.background = '';
				leftElement.style.color = '';
				leftElement.classList.remove('matched');
			}
		}
	}

	unmatchLeftWord(leftWord) {
		const rightWord = this.currentLevelData.userMatches[leftWord];
		if (rightWord) {
			// Сбрасываем стили правого слова
			const rightElement = document.querySelector(
				`#rightColumn .word-item[data-word="${rightWord}"]`
			);
			if (rightElement) {
				rightElement.style.background = '';
				rightElement.style.color = '';
				delete rightElement.dataset.matchedWith;
			}

			// Сбрасываем стили левого слова
			const leftElement = Array.from(
				document.querySelectorAll('#leftColumn .word-item')
			).find(el => el.textContent === leftWord);
			if (leftElement) {
				leftElement.style.background = '';
				leftElement.style.color = '';
				leftElement.classList.remove('matched');
			}

			delete this.currentLevelData.userMatches[leftWord];
		}
	}

	checkPairsAnswer() {
		const correctPairs = this.currentLevelData.correctPairs;
		const userMatches = this.currentLevelData.userMatches;

		let correct = 0;
		let incorrect = 0;

		// Визуально отмечаем правильные и неправильные пары с анимацией
		correctPairs.forEach((pair, index) => {
			setTimeout(() => {
				const leftElement = Array.from(
					document.querySelectorAll('#leftColumn .word-item')
				).find(el => el.textContent === pair.left);
				const rightWord = userMatches[pair.left];

				if (rightWord === pair.right) {
					// Правильная пара
					correct++;
					if (leftElement) {
						leftElement.classList.add('correct-pair');
						leftElement.style.background = '';
						leftElement.classList.add('correct');
						// Эффект частиц
						const rect = leftElement.getBoundingClientRect();
						this.createParticles(
							rect.left + rect.width / 2,
							rect.top + rect.height / 2,
							8
						);
					}
					const rightElement = document.querySelector(
						`#rightColumn .word-item[data-word="${rightWord}"]`
					);
					if (rightElement) {
						rightElement.classList.add('correct-pair');
						rightElement.style.background = '';
						rightElement.classList.add('correct');
						// Эффект частиц
						const rect = rightElement.getBoundingClientRect();
						this.createParticles(
							rect.left + rect.width / 2,
							rect.top + rect.height / 2,
							8
						);
					}
				} else if (rightWord) {
					// Неправильная пара
					incorrect++;
					if (leftElement) {
						leftElement.style.background = '#e74c3c';
						leftElement.style.color = 'white';
						leftElement.classList.add('incorrect-pair');
						leftElement.classList.add('incorrect');
					}
					const rightElement = document.querySelector(
						`#rightColumn .word-item[data-word="${rightWord}"]`
					);
					if (rightElement) {
						rightElement.style.background = '#e74c3c';
						rightElement.style.color = 'white';
						rightElement.classList.add('incorrect-pair');
						rightElement.classList.add('incorrect');
					}
				}
			}, index * 200); // Задержка для последовательной анимации
		});

		// Подсчитываем результаты сразу (без анимации)
		let correctCount = 0;
		let incorrectCount = 0;
		correctPairs.forEach(pair => {
			const rightWord = userMatches[pair.left];
			if (rightWord === pair.right) {
				correctCount++;
			} else if (rightWord) {
				incorrectCount++;
			}
		});

		const settings = difficultySettings[this.currentLevel];
		const points =
			correctCount * settings.pointsPerCorrect +
			incorrectCount * settings.penalty;
		this.score += points;

		this.updateUI();

		const message = `
            Правильно: ${correctCount}<br>
            Неправильно: ${incorrectCount}<br>
            Получено очков: ${points > 0 ? '+' : ''}${points}
        `;

		this.questionsAnswered++;

		// Задержка для проигрывания анимации
		const animationDelay = correctPairs.length * 200 + 500;

		setTimeout(() => {
			if (this.questionsAnswered >= settings.questionsPerLevel) {
				this.showModal(
					'🎉 Уровень завершён!',
					message + '<br>Переход на следующий уровень',
					false,
					true
				);
			} else {
				this.showModal('Результат', message, false);
			}
		}, animationDelay);
	}

	// ========== УРОВЕНЬ 2: Кластеризация слов ==========
	loadPathLevel() {
		const gameArea = document.getElementById('gameArea');
		gameArea.innerHTML =
			'<h2>Уровень 2. Распределить слова по категориям</h2><p>Перетаскивайте слова в соответствующие секции</p>';

		const settings = difficultySettings[this.currentLevel];
		document.getElementById('totalQuestions').textContent =
			settings.questionsPerLevel;

		this.generatePathQuestion();
	}

	generatePathQuestion() {
		document.getElementById('currentQuestion').textContent =
			this.questionsAnswered + 1;

		// Если все наборы использованы, сбрасываем
		if (this.usedClusterSets.length >= clusterGameData.length) {
			this.usedClusterSets = [];
		}

		// Выбираем случайный неиспользованный набор
		let availableSets = clusterGameData.filter(
			(_, index) => !this.usedClusterSets.includes(index)
		);
		const randomIndex = Math.floor(Math.random() * availableSets.length);
		const dataIndex = clusterGameData.indexOf(availableSets[randomIndex]);
		this.usedClusterSets.push(dataIndex);

		const data = clusterGameData[dataIndex];

		const gameArea = document.getElementById('gameArea');

		// Удаляем предыдущий контейнер, если есть
		const oldContainer = gameArea.querySelector('.cluster-game');
		if (oldContainer) {
			oldContainer.remove();
		}

		const clusterContainer = document.createElement('div');
		clusterContainer.className = 'cluster-game';

		// Создаем секции категорий
		const categoriesContainer = document.createElement('div');
		categoriesContainer.className = 'categories-container';

		data.categories.forEach(categoryName => {
			const categoryBox = document.createElement('div');
			categoryBox.className = 'category-box';
			categoryBox.dataset.category = categoryName;

			const categoryTitle = document.createElement('h3');
			categoryTitle.textContent = categoryName;
			categoryBox.appendChild(categoryTitle);

			const wordsArea = document.createElement('div');
			wordsArea.className = 'category-words';
			categoryBox.appendChild(wordsArea);

			// Поддержка перетаскивания
			wordsArea.addEventListener('dragover', e => {
				e.preventDefault();
				categoryBox.classList.add('drag-over');
			});

			wordsArea.addEventListener('dragleave', () => {
				categoryBox.classList.remove('drag-over');
			});

			wordsArea.addEventListener('drop', e => {
				e.preventDefault();
				categoryBox.classList.remove('drag-over');

				const wordText = e.dataTransfer.getData('word');
				const wordElement = document.querySelector(
					`.word-to-cluster[data-word="${wordText}"]`
				);

				if (wordElement && !wordElement.dataset.placed) {
					const clone = wordElement.cloneNode(true);
					clone.draggable = false;
					clone.classList.add('placed');

					// Добавляем кнопку для удаления
					const removeBtn = document.createElement('span');
					removeBtn.className = 'remove-word';
					removeBtn.textContent = '✕';
					removeBtn.addEventListener('click', () => {
						clone.remove();
						wordElement.dataset.placed = '';
						wordElement.style.opacity = '1';
						wordElement.draggable = true;
						delete this.currentLevelData.userClusters[wordText];
					});
					clone.appendChild(removeBtn);

					wordsArea.appendChild(clone);
					wordElement.dataset.placed = 'true';
					wordElement.style.opacity = '0.3';
					wordElement.draggable = false;

					// Сохраняем выбор
					this.currentLevelData.userClusters[wordText] = categoryName;

					// Добавляем эффекты при размещении
					categoryBox.classList.add('ripple-effect');
					categoryBox.classList.add('success-flash');
					this.createClusterParticles(wordsArea, clone);

					setTimeout(() => {
						categoryBox.classList.remove('ripple-effect');
						categoryBox.classList.remove('success-flash');
					}, 600);
				}
			});

			categoriesContainer.appendChild(categoryBox);
		});

		clusterContainer.appendChild(categoriesContainer);

		// Создаем контейнер со словами для распределения
		const wordsContainer = document.createElement('div');
		wordsContainer.className = 'words-container';

		const wordsTitle = document.createElement('h3');
		wordsTitle.textContent = 'Слова для распределения:';
		wordsContainer.appendChild(wordsTitle);

		const wordsPool = document.createElement('div');
		wordsPool.className = 'words-pool';

		// Перемешиваем слова
		const shuffledWords = [...data.words].sort(() => Math.random() - 0.5);

		shuffledWords.forEach(wordData => {
			const wordItem = document.createElement('div');
			wordItem.className = 'word-to-cluster';
			wordItem.textContent = wordData.word;
			wordItem.dataset.word = wordData.word;
			wordItem.draggable = true;

			wordItem.addEventListener('dragstart', e => {
				e.dataTransfer.setData('word', wordData.word);
				wordItem.classList.add('dragging');
			});

			wordItem.addEventListener('dragend', () => {
				wordItem.classList.remove('dragging');
			});

			wordsPool.appendChild(wordItem);
		});

		wordsContainer.appendChild(wordsPool);
		clusterContainer.appendChild(wordsContainer);

		gameArea.appendChild(clusterContainer);

		// Инициализируем данные уровня
		this.currentLevelData = {
			correctClusters: data.words.reduce((acc, item) => {
				acc[item.word] = item.category;
				return acc;
			}, {}),
			userClusters: {},
		};
	}

	checkPathAnswer() {
		const correctClusters = this.currentLevelData.correctClusters;
		const userClusters = this.currentLevelData.userClusters;

		let correct = 0;
		let incorrect = 0;
		let notPlaced = 0;

		const words = Object.keys(correctClusters);

		// Сначала подсчитываем результаты
		words.forEach(word => {
			const correctCategory = correctClusters[word];
			const userCategory = userClusters[word];

			if (userCategory === correctCategory) {
				correct++;
			} else if (userCategory) {
				incorrect++;
			} else {
				notPlaced++;
			}
		});

		// Затем визуально отмечаем с анимацией
		words.forEach((word, index) => {
			const correctCategory = correctClusters[word];
			const userCategory = userClusters[word];

			setTimeout(() => {
				if (userCategory === correctCategory) {
					// Подсвечиваем правильно размещенные слова зеленым
					const placedWord = document.querySelector(
						`.category-box[data-category="${userCategory}"] .word-to-cluster.placed[data-word="${word}"]`
					);
					if (placedWord) {
						placedWord.style.background = '#2ecc71';
						placedWord.style.color = 'white';
						placedWord.classList.add('correct-answer');
						// Эффект частиц для правильных ответов
						const rect = placedWord.getBoundingClientRect();
						this.createParticles(
							rect.left + rect.width / 2,
							rect.top + rect.height / 2,
							8
						);
					}
				} else if (userCategory) {
					// Подсвечиваем неправильно размещенные слова красным
					const placedWord = document.querySelector(
						`.category-box[data-category="${userCategory}"] .word-to-cluster.placed[data-word="${word}"]`
					);
					if (placedWord) {
						placedWord.style.background = '#e74c3c';
						placedWord.style.color = 'white';
						placedWord.classList.add('wrong-answer');
					}
				} else {
					// Подсвечиваем не размещенные слова оранжевым
					const unplacedWord = document.querySelector(
						`.words-pool .word-to-cluster[data-word="${word}"]`
					);
					if (unplacedWord) {
						unplacedWord.style.background = '#f39c12';
						unplacedWord.style.color = 'white';
						unplacedWord.classList.add('wrong-answer');
					}
				}
			}, index * 150); // Последовательная анимация с задержкой
		});

		const settings = difficultySettings[this.currentLevel];
		const points =
			correct * settings.pointsPerCorrect +
			incorrect * settings.penalty +
			notPlaced * settings.penalty;

		this.score += points;
		this.updateUI();

		const message = `
            Правильно: ${correct}<br>
            Неправильно: ${incorrect}<br>
            Не размещено: ${notPlaced}<br>
            Получено очков: ${points > 0 ? '+' : ''}${points}
        `;

		this.questionsAnswered++;

		// Задержка для проигрывания анимации (слова * 150мс + 800мс на эффекты)
		const animationDelay = words.length * 150 + 800;

		setTimeout(() => {
			if (this.questionsAnswered >= settings.questionsPerLevel) {
				this.showModal(
					'🎉 Уровень завершён!',
					message + '<br>Переход на следующий уровень',
					false,
					true
				);
			} else {
				this.showModal('Результат', message, false);
			}
		}, animationDelay);
	}

	// ========== УРОВЕНЬ 3: Чужеродные фрагменты ==========
	loadTextLevel() {
		const gameArea = document.getElementById('gameArea');
		gameArea.innerHTML =
			'<h2>Уровень 3: Найдите чужеродные слова</h2><p>Кликните на слова, которые не относятся к тексту</p>';

		const settings = difficultySettings[this.currentLevel];
		document.getElementById('totalQuestions').textContent =
			settings.questionsPerLevel;

		this.generateTextQuestion();
	}

	generateTextQuestion() {
		document.getElementById('currentQuestion').textContent =
			this.questionsAnswered + 1;

		// Если все тексты использованы, сбрасываем
		if (this.usedTextSets.length >= textGameData.length) {
			this.usedTextSets = [];
		}

		// Выбираем случайный неиспользованный текст
		let availableTexts = textGameData.filter(
			(_, index) => !this.usedTextSets.includes(index)
		);
		const randomIndex = Math.floor(Math.random() * availableTexts.length);
		const dataIndex = textGameData.indexOf(availableTexts[randomIndex]);
		this.usedTextSets.push(dataIndex);

		const data = textGameData[dataIndex];

		this.currentLevelData = {
			alienWords: data.alienWords,
			selectedWords: [],
		};

		const gameArea = document.getElementById('gameArea');

		// Удаляем предыдущий контейнер, если есть
		const oldContainer = gameArea.querySelector('.text-game');
		if (oldContainer) {
			oldContainer.remove();
		}

		const textContainer = document.createElement('div');
		textContainer.className = 'text-game';

		const storyDiv = document.createElement('div');
		storyDiv.className = 'story';

		// Разбиваем текст на слова
		const words = data.story.split(' ');

		words.forEach((word, index) => {
			const span = document.createElement('span');
			span.className = 'text-word';
			span.textContent = word;
			span.dataset.word = word;
			span.dataset.index = index;

			// Клик для выделения
			span.addEventListener('click', () => {
				if (span.classList.contains('selected')) {
					span.classList.remove('selected');
					const idx = this.currentLevelData.selectedWords.indexOf(word);
					if (idx > -1) {
						this.currentLevelData.selectedWords.splice(idx, 1);
					}
				} else {
					span.classList.add('selected');
					this.currentLevelData.selectedWords.push(word);
				}
			});

			// Двойной клик для быстрого выбора
			span.addEventListener('dblclick', () => {
				span.classList.add('selected');
				if (!this.currentLevelData.selectedWords.includes(word)) {
					this.currentLevelData.selectedWords.push(word);
				}
			});

			// Наведение для подсказки
			span.addEventListener('mouseenter', () => {
				span.style.transform = 'scale(1.1)';
			});

			span.addEventListener('mouseleave', () => {
				span.style.transform = '';
			});

			storyDiv.appendChild(span);
			storyDiv.appendChild(document.createTextNode(' '));
		});

		textContainer.appendChild(storyDiv);
		gameArea.appendChild(textContainer);
	}

	checkTextAnswer() {
		const alienWords = this.currentLevelData.alienWords;
		const selectedWords = this.currentLevelData.selectedWords;

		let correctFound = 0;
		let wrongSelected = 0;
		let notFound = 0;

		let animationIndex = 0;

		// Визуальная обратная связь с последовательной анимацией
		document.querySelectorAll('.text-word').forEach(span => {
			const word = span.dataset.word;
			// Убираем знаки препинания для сравнения
			const cleanWord = word.replace(/[.,!?;:]/g, '');

			if (alienWords.includes(cleanWord) && selectedWords.includes(word)) {
				// Верно выбранные - зеленый с эффектом частиц
				setTimeout(() => {
					span.classList.remove('selected');
					span.classList.add('correct-found');
					// Эффект частиц
					const rect = span.getBoundingClientRect();
					this.createParticles(
						rect.left + rect.width / 2,
						rect.top + rect.height / 2,
						10
					);
				}, animationIndex * 150);
				correctFound++;
				animationIndex++;
			} else if (
				alienWords.includes(cleanWord) &&
				!selectedWords.includes(word)
			) {
				// Пропущенные (должны были отметить, но не отметили) - синий
				setTimeout(() => {
					span.classList.add('missed-word');
				}, animationIndex * 150);
				notFound++;
				animationIndex++;
			} else if (
				!alienWords.includes(cleanWord) &&
				selectedWords.includes(word)
			) {
				// Неверно выбранные - красный с тряской
				wrongSelected++;
				setTimeout(() => {
					span.classList.add('wrong-selected');
					// Убираем красный цвет через 2 секунды
					setTimeout(() => {
						span.classList.remove('wrong-selected');
						span.classList.remove('selected');
					}, 2000);
				}, animationIndex * 150);
				animationIndex++;
			}
		});

		const settings = difficultySettings[this.currentLevel];
		const points =
			correctFound * settings.pointsPerCorrect +
			wrongSelected * settings.penalty +
			notFound * settings.penalty;

		this.score += points;
		this.updateUI();

		const message = `
            Верно найдено: ${correctFound}<br>
            Неверно выбрано: ${wrongSelected}<br>
            Не найдено: ${notFound}<br>
            Получено очков: ${points > 0 ? '+' : ''}${points}
        `;

		this.questionsAnswered++;

		// Задержка с учётом анимации
		const animationDelay = animationIndex * 150 + 1000;

		setTimeout(() => {
			if (this.questionsAnswered >= settings.questionsPerLevel) {
				this.showModal(
					'🎉 Уровень завершён!',
					message + '<br>Игра завершена!',
					false,
					true
				);
			} else {
				this.showModal('Результат', message, false);
			}
		}, animationDelay);
	}

	// ========== УРОВЕНЬ 4: Падающие слова ==========
	loadFallingLevel() {
		const gameArea = document.getElementById('gameArea');
		gameArea.innerHTML =
			'<h2>Уровень 4: Лови слова!</h2><p>Перетаскивайте падающие слова в нужные категории. ПКМ по лишним словам даёт бонус!</p>';

		const settings = difficultySettings[this.currentLevel];
		document.getElementById('totalQuestions').textContent =
			settings.questionsPerLevel;

		this.generateFallingQuestion();
	}

	generateFallingQuestion() {
		document.getElementById('currentQuestion').textContent =
			this.questionsAnswered + 1;

		// Выбираем случайный набор данных
		if (!this.usedFallingSets) this.usedFallingSets = [];
		if (this.usedFallingSets.length >= fallingWordsData.length) {
			this.usedFallingSets = [];
		}

		let availableSets = fallingWordsData.filter(
			(_, index) => !this.usedFallingSets.includes(index)
		);
		const randomIndex = Math.floor(Math.random() * availableSets.length);
		const dataIndex = fallingWordsData.indexOf(availableSets[randomIndex]);
		this.usedFallingSets.push(dataIndex);

		const data = fallingWordsData[dataIndex];
		const settings = difficultySettings[this.currentLevel];

		// Инициализируем данные уровня
		this.currentLevelData = {
			categories: data.categories.map(cat => ({ ...cat, count: 0 })),
			words: [...data.words].sort(() => Math.random() - 0.5),
			caught: 0,
			missed: 0,
			skipScore: 0,
			skipHits: 0,
			maxMissed: settings.maxMissed || 5,
			targetScore: data.categories.reduce((sum, cat) => sum + cat.target, 0),
			spawnInterval: settings.spawnInterval || 2500,
			targetFallSeconds: settings.targetFallSeconds || 10,
			skipReward: settings.skipReward || 30,
			wordIndex: 0,
			spawnTimer: null,
			currentSpeed: 1.0,
			isFinished: false,
		};

		const gameArea = document.getElementById('gameArea');

		// Удаляем предыдущий контейнер, если есть
		const oldContainer = gameArea.querySelector('.falling-game');
		if (oldContainer) {
			oldContainer.remove();
		}

		// Создаём контейнер игры
		const fallingContainer = document.createElement('div');
		fallingContainer.className = 'falling-game';

		// Панель статистики
		const statsPanel = document.createElement('div');
		statsPanel.className = 'falling-stats-panel';
		statsPanel.innerHTML = `
			<div class="falling-stat">
				<span class="stat-icon">🎯</span>
				<span>Поймано: <strong id="falling-caught">0</strong>/${this.currentLevelData.targetScore}</span>
			</div>
			<div class="falling-stat">
				<span class="stat-icon">⚠️</span>
				<span>Пропущено: <strong id="falling-missed">0</strong>/${this.currentLevelData.maxMissed}</span>
			</div>
			<div class="falling-stat">
				<span class="stat-icon">✨</span>
				<span>Бонус: <strong id="falling-skip">0</strong></span>
			</div>
		`;
		fallingContainer.appendChild(statsPanel);

		// Область падения слов
		const stormArea = document.createElement('div');
		stormArea.className = 'storm-area';
		stormArea.id = 'storm-area';
		fallingContainer.appendChild(stormArea);

		// Область категорий
		const categoriesArea = document.createElement('div');
		categoriesArea.className = 'falling-categories-area';
		categoriesArea.id = 'falling-categories-area';

		this.currentLevelData.categories.forEach(cat => {
			const zone = document.createElement('div');
			zone.className = 'category-zone';
			zone.dataset.category = cat.id;
			zone.innerHTML = `
				<div class="category-label">${cat.name}</div>
				<div class="category-counter">
					<span class="cat-count">${cat.count}</span>/${cat.target}
				</div>
			`;

			categoriesArea.appendChild(zone);
		});

		fallingContainer.appendChild(categoriesArea);
		gameArea.appendChild(fallingContainer);

		// Запускаем спавн слов
		this.startFallingSpawn();
	}

	startFallingSpawn() {
		const settings = difficultySettings[this.currentLevel];
		const data = this.currentLevelData;

		const spawnNext = () => {
			if (data.isFinished) return;
			if (data.caught >= data.targetScore) return;
			if (data.wordIndex >= data.words.length) {
				data.wordIndex = 0;
				data.words.sort(() => Math.random() - 0.5);
			}

			this.spawnFallingWord(data.words[data.wordIndex]);
			data.wordIndex++;
		};

		spawnNext();

		data.spawnTimer = setInterval(() => {
			if (data.isFinished) {
				clearInterval(data.spawnTimer);
				return;
			}
			spawnNext();

			// Увеличиваем скорость после каждых 3 пойманных слов
			if (data.caught > 0 && data.caught % 3 === 0) {
				data.currentSpeed = Math.min(2.5, data.currentSpeed + 0.15);
			}
		}, data.spawnInterval);
	}

	spawnFallingWord(wordData) {
		const area = document.getElementById('storm-area');
		if (!area) return;

		const el = document.createElement('div');
		el.className = 'falling-word';
		el.innerText = wordData.text;
		el.dataset.word = wordData.text;
		el.dataset.category = wordData.category;
		el.style.top = '-40px';

		area.appendChild(el);

		// Случайная позиция по горизонтали
		const maxLeft = Math.max(0, area.clientWidth - el.offsetWidth);
		el.style.left = Math.random() * maxLeft + 'px';

		// Перетаскивание через mouse events (надёжнее чем drag API)
		this.makeFallingWordDraggable(el, wordData, area);

		// ПКМ для "лишних" слов
		el.addEventListener('contextmenu', e => {
			e.preventDefault();
			if (this.canSkipFallingWord(el)) {
				this.handleSkipFallingWord(el);
			} else {
				this.handleInvalidSkip(el);
			}
		});

		// Запускаем падение
		this.startFallingWord(el, area);
	}

	makeFallingWordDraggable(el, wordData, container) {
		let isDragging = false;
		let offsetX = 0;
		let offsetY = 0;

		const onMouseDown = e => {
			if (e.button !== 0) return; // Только левая кнопка мыши
			if (el.classList.contains('caught')) return;

			isDragging = true;
			this.stopFallingWord(el);

			const rect = el.getBoundingClientRect();
			offsetX = e.clientX - rect.left;
			offsetY = e.clientY - rect.top;

			// Перемещаем элемент в body для свободного перетаскивания
			el._dragContext = {
				parent: el.parentElement,
				width: rect.width,
				wordData: wordData,
			};

			document.body.appendChild(el);
			el.style.position = 'fixed';
			el.style.left = rect.left + 'px';
			el.style.top = rect.top + 'px';
			el.style.width = rect.width + 'px';
			el.style.zIndex = '10000';
			el.classList.add('dragging');
		};

		const onMouseMove = e => {
			if (!isDragging) return;
			e.preventDefault();

			const newX = e.clientX - offsetX;
			const newY = e.clientY - offsetY;

			el.style.left =
				Math.max(0, Math.min(newX, window.innerWidth - el.offsetWidth)) + 'px';
			el.style.top =
				Math.max(0, Math.min(newY, window.innerHeight - el.offsetHeight)) +
				'px';

			// Создаём след за словом (каждый 3-й кадр)
			if (!this._trailCounter) this._trailCounter = 0;
			this._trailCounter++;
			if (this._trailCounter % 3 === 0) {
				const style = getComputedStyle(el);
				const bgColor =
					style.background.match(/rgb[a]?\([^)]+\)/)?.[0] || '#6c5ce7';
				this.createDragTrail(e.clientX, e.clientY, bgColor);
			}

			// Подсвечиваем зоны при наведении
			this.highlightFallingZones(e);
		};

		const onMouseUp = e => {
			if (!isDragging) return;
			isDragging = false;
			el.classList.remove('dragging');
			el.style.zIndex = '100';

			// Проверяем, попали ли в зону категории
			const dropped = this.checkFallingDrop(el, e, wordData.category);

			if (!dropped && el._dragContext) {
				// Возвращаем в область падения
				const host = el._dragContext.parent || container;
				if (host) {
					const hostRect = host.getBoundingClientRect();
					const currentLeft = parseFloat(el.style.left) || 0;
					const currentTop = parseFloat(el.style.top) || 0;
					const relativeLeft = currentLeft - hostRect.left;
					const relativeTop = currentTop - hostRect.top;

					host.appendChild(el);
					el.style.position = 'absolute';
					el.style.width = '';

					const maxX = Math.max(0, host.clientWidth - el.offsetWidth);
					el.style.left = Math.max(0, Math.min(relativeLeft, maxX)) + 'px';
					el.style.top = Math.max(-40, relativeTop) + 'px';

					this.resumeFallingWord(el, container);
				}
				delete el._dragContext;
			} else {
				delete el._dragContext;
			}
		};

		el.addEventListener('mousedown', onMouseDown);
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	highlightFallingZones(e) {
		const zones = document.querySelectorAll('.category-zone');
		zones.forEach(zone => {
			const rect = zone.getBoundingClientRect();
			if (
				e.clientX >= rect.left &&
				e.clientX <= rect.right &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom
			) {
				zone.classList.add('highlight');
			} else {
				zone.classList.remove('highlight');
			}
		});
	}

	checkFallingDrop(el, e, wordCategory) {
		const zones = document.querySelectorAll('.category-zone');
		let dropped = false;

		zones.forEach(zone => {
			const rect = zone.getBoundingClientRect();
			if (
				e.clientX >= rect.left &&
				e.clientX <= rect.right &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom
			) {
				zone.classList.remove('highlight');
				this.handleFallingDrop(el, zone, wordCategory);
				dropped = true;
			}
		});

		// Убираем подсветку со всех зон
		zones.forEach(z => z.classList.remove('highlight'));

		return dropped;
	}

	hasActiveCategory(categoryId) {
		return this.currentLevelData.categories.some(cat => cat.id === categoryId);
	}

	canSkipFallingWord(el) {
		if (!el) return false;
		const category = el.dataset.category;
		return !this.hasActiveCategory(category);
	}

	handleSkipFallingWord(el) {
		if (!el || el.classList.contains('caught')) return;
		this.stopFallingWord(el);
		el.classList.add('caught');

		const data = this.currentLevelData;
		data.skipHits++;
		data.skipScore += data.skipReward;

		document.getElementById('falling-skip').innerText = data.skipScore;

		el.style.transition = 'all 0.25s ease-out';
		el.style.transform = 'scale(1.2)';
		el.style.opacity = '0';
		el.style.background = '#a29bfe';
		setTimeout(() => el.remove(), 250);
	}

	handleInvalidSkip(el) {
		if (!el || el.classList.contains('caught')) return;
		this.stopFallingWord(el);
		el.classList.add('caught');

		const data = this.currentLevelData;
		data.missed++;
		document.getElementById('falling-missed').innerText = data.missed;

		const area = document.getElementById('storm-area');
		if (area) {
			area.style.animation = 'shake 0.4s';
			setTimeout(() => (area.style.animation = ''), 400);
		}

		el.style.transition = 'all 0.25s ease-out';
		el.style.transform = 'scale(0.8)';
		el.style.opacity = '0';
		el.style.background = '#d63031';
		setTimeout(() => el.remove(), 250);

		if (data.missed >= data.maxMissed) {
			setTimeout(() => this.finishFallingLevel(false), 500);
		}
	}

	startFallingWord(el, area) {
		if (!area) return;
		this.stopFallingWord(el);

		const data = this.currentLevelData;
		const areaHeight = area.clientHeight;
		const areaWidth = Math.max(0, area.clientWidth - el.offsetWidth);
		const clampX = val => Math.max(0, Math.min(val, areaWidth));

		// Скорость падения
		const effectiveTime = Math.max(
			3,
			data.targetFallSeconds / data.currentSpeed
		);
		const verticalSpeed = areaHeight / effectiveTime;

		// Тип траектории: straight, sine, diagonal
		const trajectoryTypes = ['straight', 'sine', 'diagonal'];
		const type =
			trajectoryTypes[Math.floor(Math.random() * trajectoryTypes.length)];

		const trajectory = {
			type,
			baseX: parseFloat(el.style.left) || 0,
			currentX: parseFloat(el.style.left) || 0,
			currentY: parseFloat(el.style.top) || -40,
			verticalSpeed,
			areaHeight,
			elapsed: 0,
			lastTimestamp: null,
			phase: Math.random() * Math.PI * 2,
		};

		if (type === 'sine') {
			trajectory.amplitude = Math.min(80, areaWidth / 3);
			trajectory.frequency = 1 + Math.random() * 1.5;
			const minBase = trajectory.amplitude;
			const maxBase = Math.max(minBase, areaWidth - trajectory.amplitude);
			trajectory.baseX = clampX(
				Math.max(minBase, Math.min(trajectory.currentX, maxBase))
			);
		} else if (type === 'diagonal') {
			trajectory.horizontalSpeed = 50 + Math.random() * 50;
			trajectory.direction = Math.random() > 0.5 ? 1 : -1;
		}

		el._trajectory = trajectory;

		const animate = timestamp => {
			if (
				el.classList.contains('dragging') ||
				el.classList.contains('caught')
			) {
				this.stopFallingWord(el);
				return;
			}

			if (trajectory.lastTimestamp === null) {
				trajectory.lastTimestamp = timestamp;
			}

			const delta = (timestamp - trajectory.lastTimestamp) / 1000;
			trajectory.lastTimestamp = timestamp;
			trajectory.elapsed += delta;
			trajectory.currentY += trajectory.verticalSpeed * delta;

			if (trajectory.type === 'sine') {
				const nextX =
					trajectory.baseX +
					Math.sin(
						trajectory.elapsed * trajectory.frequency + trajectory.phase
					) *
						trajectory.amplitude;
				trajectory.currentX = clampX(nextX);
			} else if (trajectory.type === 'diagonal') {
				let nextX =
					trajectory.currentX +
					trajectory.horizontalSpeed * delta * trajectory.direction;
				if (nextX <= 0 || nextX >= areaWidth) {
					trajectory.direction *= -1;
					nextX = clampX(nextX);
				}
				trajectory.currentX = nextX;
			} else {
				trajectory.currentX = clampX(trajectory.baseX);
			}

			el.style.left = trajectory.currentX + 'px';
			el.style.top = trajectory.currentY + 'px';

			if (trajectory.currentY > areaHeight) {
				this.stopFallingWord(el);
				if (el.parentNode && !el.classList.contains('caught')) {
					this.wordFallingMissed(el);
				}
				return;
			}

			// Проверка опасной зоны (80% высоты)
			if (
				trajectory.currentY > areaHeight * 0.7 &&
				!el.classList.contains('danger-zone')
			) {
				el.classList.add('danger-zone');
			}

			const frameId = requestAnimationFrame(animate);
			el.dataset.fallFrame = frameId;
		};

		const frameId = requestAnimationFrame(animate);
		el.dataset.fallFrame = frameId;
	}

	resumeFallingWord(el, area) {
		if (!area || !el._trajectory) return;
		const type = el._trajectory.type;
		this.startFallingWord(el, area);
	}

	stopFallingWord(el) {
		if (!el || !el.dataset) return;
		const frameId = Number(el.dataset.fallFrame);
		if (frameId) {
			cancelAnimationFrame(frameId);
		}
		delete el.dataset.fallFrame;
		el.classList.remove('danger-zone');
	}

	// ========== Эффекты и анимации ==========

	// Создание частиц конфетти
	createParticles(x, y, count = 15) {
		const colors = [
			'#ff6b6b',
			'#feca57',
			'#48dbfb',
			'#ff9ff3',
			'#54a0ff',
			'#5f27cd',
			'#00d2d3',
			'#26de81',
		];

		for (let i = 0; i < count; i++) {
			const particle = document.createElement('div');
			particle.className = 'particle';

			const color = colors[Math.floor(Math.random() * colors.length)];
			const size = 5 + Math.random() * 10;
			const angle = Math.random() * 360 * (Math.PI / 180);
			const velocity = 50 + Math.random() * 100;
			const duration = 0.5 + Math.random() * 0.5;

			particle.style.cssText = `
				left: ${x}px;
				top: ${y}px;
				width: ${size}px;
				height: ${size}px;
				background: ${color};
				animation-duration: ${duration}s;
				--tx: ${Math.cos(angle) * velocity}px;
				--ty: ${Math.sin(angle) * velocity - 50}px;
			`;

			// Кастомная анимация для разлёта
			particle.style.animation = `particleFly ${duration}s ease-out forwards`;

			document.body.appendChild(particle);
			setTimeout(() => particle.remove(), duration * 1000);
		}
	}

	// Создание частиц для уровня 2 (кластеризация)
	createClusterParticles(container, wordEl) {
		const rect = wordEl.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const colors = [
			'#ff6b6b',
			'#feca57',
			'#48dbfb',
			'#ff9ff3',
			'#54a0ff',
			'#26de81',
		];

		for (let i = 0; i < 10; i++) {
			const star = document.createElement('div');
			star.className = 'cluster-star';
			const color = colors[Math.floor(Math.random() * colors.length)];
			const size = 4 + Math.random() * 8;
			const angle = (Math.PI * 2 * i) / 10;
			const velocity = 30 + Math.random() * 50;

			star.style.cssText = `
				position: fixed;
				left: ${centerX}px;
				top: ${centerY}px;
				width: ${size}px;
				height: ${size}px;
				background: ${color};
				border-radius: 50%;
				pointer-events: none;
				z-index: 9999;
				animation: clusterStarFly 0.6s ease-out forwards;
				--tx: ${Math.cos(angle) * velocity}px;
				--ty: ${Math.sin(angle) * velocity}px;
			`;

			document.body.appendChild(star);
			setTimeout(() => star.remove(), 600);
		}
	}

	// Показать комбо-эффект
	showComboEffect(combo) {
		const messages = [
			'',
			'',
			'Комбо x2! 🔥',
			'Комбо x3! 💥',
			'Комбо x4! ⚡',
			'СУПЕР! x5! 🌟',
		];
		const message = combo >= 5 ? messages[5] : messages[combo];

		if (combo >= 2 && message) {
			const indicator = document.createElement('div');
			indicator.className = 'combo-indicator';
			indicator.innerText = message;
			document.body.appendChild(indicator);
			setTimeout(() => indicator.remove(), 800);
		}
	}

	// Эффект волны по зоне
	createRippleEffect(zone) {
		zone.classList.add('ripple');
		setTimeout(() => zone.classList.remove('ripple'), 600);
	}

	// След за словом при перетаскивании
	createDragTrail(x, y, color) {
		const trail = document.createElement('div');
		trail.className = 'drag-trail';
		trail.style.cssText = `
			left: ${x}px;
			top: ${y}px;
			background: ${color};
			box-shadow: 0 0 10px ${color};
		`;
		document.body.appendChild(trail);
		setTimeout(() => trail.remove(), 500);
	}

	handleFallingDrop(el, zone, wordCategory) {
		const data = this.currentLevelData;
		const zoneCategory = zone.dataset.category;

		if (wordCategory === zoneCategory) {
			// Правильно!
			this.stopFallingWord(el);
			el.classList.add('caught');

			// Получаем позицию для эффектов
			const rect = el.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			// Создаём эффект частиц
			this.createParticles(centerX, centerY, 12);

			// Эффект волны по зоне
			this.createRippleEffect(zone);

			// Комбо система
			data.combo = (data.combo || 0) + 1;
			this.showComboEffect(data.combo);

			el.style.transition = 'all 0.3s ease-out';
			el.style.transform = 'scale(1.5)';
			el.style.opacity = '0';
			setTimeout(() => el.remove(), 300);

			zone.classList.add('correct');
			setTimeout(() => zone.classList.remove('correct'), 500);

			const cat = data.categories.find(c => c.id === zoneCategory);
			if (cat) {
				cat.count++;
				const counter = zone.querySelector('.cat-count');
				if (counter) counter.innerText = cat.count;
			}

			data.caught++;
			document.getElementById('falling-caught').innerText = data.caught;

			if (data.caught >= data.targetScore) {
				setTimeout(() => this.finishFallingLevel(true), 500);
			}
		} else {
			// Неправильно!
			zone.classList.add('wrong');
			setTimeout(() => zone.classList.remove('wrong'), 500);

			// Сбрасываем комбо при ошибке
			data.combo = 0;

			// Штраф за неправильное размещение
			const settings = difficultySettings[this.currentLevel];
			data.wrongPlacements = (data.wrongPlacements || 0) + 1;
			data.wrongPenalty = (data.wrongPenalty || 0) + Math.abs(settings.penalty);

			// Обновляем отображение штрафа
			const skipDisplay = document.getElementById('falling-skip');
			if (skipDisplay) {
				const netBonus = data.skipScore - data.wrongPenalty;
				skipDisplay.innerText = netBonus >= 0 ? netBonus : netBonus;
				skipDisplay.style.color = netBonus < 0 ? '#d63031' : '';
			}

			// Возвращаем слово к падению
			const area = document.getElementById('storm-area');
			if (area && el.parentNode) {
				this.resumeFallingWord(el, area);
			}
		}
	}

	wordFallingMissed(el) {
		const data = this.currentLevelData;

		// Пропускаем только слова активных категорий
		if (!this.hasActiveCategory(el.dataset.category)) {
			el.remove();
			return;
		}

		data.missed++;
		document.getElementById('falling-missed').innerText = data.missed;

		const area = document.getElementById('storm-area');
		if (area) {
			area.style.animation = 'shake 0.5s';
			setTimeout(() => (area.style.animation = ''), 500);
		}

		el.remove();

		if (data.missed >= data.maxMissed) {
			setTimeout(() => this.finishFallingLevel(false), 600);
		}
	}

	finishFallingLevel(success) {
		const data = this.currentLevelData;
		if (data.isFinished) return;
		data.isFinished = true;

		// Останавливаем спавн
		if (data.spawnTimer) {
			clearInterval(data.spawnTimer);
		}

		// Останавливаем все падающие слова
		const area = document.getElementById('storm-area');
		if (area) {
			Array.from(area.querySelectorAll('.falling-word')).forEach(word => {
				this.stopFallingWord(word);
				word.remove();
			});
		}

		const settings = difficultySettings[this.currentLevel];
		const basePoints = data.caught * settings.pointsPerCorrect;
		const skipBonus = data.skipScore;
		const missedPenalty = data.missed * Math.abs(settings.penalty);
		const wrongPenalty = data.wrongPenalty || 0;
		const totalPenalty = missedPenalty + wrongPenalty;
		const totalPoints = Math.max(0, basePoints + skipBonus - totalPenalty);

		this.score += totalPoints;
		this.updateUI();

		const message = success
			? `
				Отлично!<br>
				Поймано: ${data.caught}/${data.targetScore}<br>
				Пропущено: ${data.missed}/${data.maxMissed}<br>
				Бонус за лишние: +${skipBonus}<br>
				Штраф за пропуски: -${missedPenalty}<br>
				Штраф за ошибки: -${wrongPenalty}<br>
				<strong>Получено очков: +${totalPoints}</strong>
			`
			: `
				Слишком много пропущено!<br>
				Поймано: ${data.caught}/${data.targetScore}<br>
				Пропущено: ${data.missed}/${data.maxMissed}<br>
				Бонус за лишние: +${skipBonus}<br>
				Штраф за пропуски: -${missedPenalty}<br>
				Штраф за ошибки: -${wrongPenalty}<br>
				<strong>Получено очков: +${totalPoints}</strong>
			`;

		this.questionsAnswered++;

		setTimeout(() => {
			if (this.questionsAnswered >= settings.questionsPerLevel) {
				this.showModal(
					success ? 'Уровень завершён!' : 'Уровень завершён',
					message,
					false,
					true, 
					
				);
			} else {
				this.showModal(
					success ? 'Результат' : 'Попробуйте ещё',
					message,
					false
				);
			}
		}, 500);
	}

	checkFallingAnswer() {
		// Уровень 4 проверяется автоматически в finishFallingLevel
		// Этот метод для совместимости с кнопкой "Проверить"
		const data = this.currentLevelData;
		if (!data.isFinished) {
			this.finishFallingLevel(data.caught >= data.targetScore);
		}
	}

	// ========== Общие методы ==========
	checkAnswer() {
		switch (this.currentLevel) {
			case 1:
				this.checkPairsAnswer();
				break;
			case 2:
				this.checkPathAnswer();
				break;
			case 3:
				this.checkTextAnswer();
				break;
			case 4:
				this.checkFallingAnswer();
				break;
		}
	}

	skipQuestion() {
		this.showConfirm(
			'Пропустить вопрос?',
			'Вы уверены, что хотите пропустить вопрос? Вы не получите очки.',
			() => {
				this.questionsAnswered++;
				const settings = difficultySettings[this.currentLevel];

				if (this.questionsAnswered >= settings.questionsPerLevel) {
					this.nextLevel();
				} else {
					this.nextQuestion();
				}
			}
		);
	}

	nextQuestion() {
		document.getElementById('resultModal').classList.remove('show');

		switch (this.currentLevel) {
			case 1:
				this.loadPairsLevel();
				break;
			case 2:
				this.loadPathLevel();
				break;
			case 3:
				this.loadTextLevel();
				break;
			case 4:
				this.loadFallingLevel();
				break;
		}
	}

	nextLevel() {
		// Сохраняем прогресс пройденного уровня
		if (this.isSingleLevelMode) {
			Storage.saveLevelProgress(
				this.gameState.playerName,
				this.currentLevel,
				this.score,
				true
			);
		}

		this.levelIndex++;

		if (this.levelIndex >= this.levelSequence.length) {
			this.completeGame();
		} else {
			this.currentLevel = this.levelSequence[this.levelIndex];
			document.getElementById('resultModal').classList.remove('show');
			this.gameState.currentLevel = this.currentLevel;
			this.gameState.levelIndex = this.levelIndex;
			this.gameState.score = this.score;
			Storage.saveGameState(this.gameState);

			this.updateUI();
			this.loadLevel();
		}
	}

	completeGame() {
		this.stopTimer();

		// Сохраняем прогресс уровня
		if (this.isSingleLevelMode) {
			Storage.saveLevelProgress(
				this.gameState.playerName,
				this.currentLevel,
				this.score,
				true
			);
		}

		// Сохраняем результат в рейтинг
		const completedLevels = this.isSingleLevelMode ? 1 : this.currentLevel - 1;
		Storage.saveRating(this.gameState.playerName, this.score, completedLevels);
		Storage.clearGameState();

		document.getElementById('finalScore').textContent = this.score;
		document.getElementById('finalLevel').textContent = completedLevels;
		document.getElementById('finalModal').classList.add('show');
	}

	exitGame() {
		this.showConfirm(
			'Завершить игру?',
			'Вы уверены, что хотите завершить игру? Прогресс будет сохранён.',
			() => {
				this.stopTimer();

				// Сохраняем прогресс
				if (this.isSingleLevelMode && this.score > 0) {
					Storage.saveLevelProgress(
						this.gameState.playerName,
						this.currentLevel,
						this.score,
						false
					);
				}

				// Сохраняем результат
				Storage.saveRating(
					this.gameState.playerName,
					this.score,
					this.isSingleLevelMode ? 1 : this.currentLevel
				);
				Storage.clearGameState();

				// Возвращаемся на соответствующую страницу
				if (this.isSingleLevelMode) {
					window.location.href = 'levels.html';
				} else {
					window.location.href = 'index.html';
				}
			}
		);
	}

	restartGame() {
		Storage.clearGameState();
		window.location.href = 'index.html';
	}

	showModal(title, message, isFinal = false, isLevelComplete = false) {
		const modal = document.getElementById('resultModal');
		document.getElementById('resultTitle').textContent = title;
		document.getElementById('resultMessage').innerHTML = message;

		const nextBtn = document.getElementById('nextBtn');

		if (isLevelComplete) {
			nextBtn.textContent = 'Следующий уровень';
			nextBtn.onclick = () => this.nextLevel();
		} else {
			nextBtn.textContent = 'Продолжить';
			nextBtn.onclick = () => this.nextQuestion();
		}

		modal.classList.add('show');

		if (isFinal) {
			setTimeout(() => {
				modal.classList.remove('show');
				this.completeGame();
			}, 3000);
		}
	}

	showConfirm(title, message, onConfirm) {
		const modal = document.getElementById('confirmModal');
		document.getElementById('confirmTitle').textContent = title;
		document.getElementById('confirmMessage').textContent = message;

		const yesBtn = document.getElementById('confirmYesBtn');
		const noBtn = document.getElementById('confirmNoBtn');

		yesBtn.onclick = () => {
			modal.classList.remove('show');
			onConfirm();
		};

		noBtn.onclick = () => {
			modal.classList.remove('show');
		};

		modal.classList.add('show');
	}
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	new Game();
});
