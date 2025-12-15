// Основная логика игры (game.html)

class Game {
	constructor() {
		this.gameState = Storage.getGameState();

		if (!this.gameState) {
			alert('Ошибка загрузки игры. Возврат на главную страницу.');
			window.location.href = 'index.html';
			return;
		}

		// Последовательность уровней: 1, 2, 3 (каждый уровень один раз)
		this.levelSequence = [1, 2, 3];
		this.levelIndex = this.gameState.levelIndex || 0;
		this.currentLevel = this.levelSequence[this.levelIndex];

		this.currentQuestion = 0;
		this.score = this.gameState.score || 0;
		this.timer = null;
		this.timeLeft = 150; // Общий таймер на всю игру
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
		this.updateUI();
		this.setupEventListeners();
		this.loadLevel();
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
		this.questionsAnswered = 0;
		// Запускаем таймер только один раз в начале игры
		if (!this.timerStarted) {
			this.startTimer();
			this.timerStarted = true;
		}

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
			default:
				this.completeGame();
		}
	}

	startTimer() {
		// Таймер уже установлен в конструкторе (150 секунд на всю игру)
		document.getElementById('timer').textContent = this.timeLeft;

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
		const gameArea = document.getElementById('gameArea');
		gameArea.innerHTML =
			'<h2>Уровень 1: Найдите пары слов</h2><p>Соедините связанные слова методом перетаскивания</p>';

		const settings = difficultySettings[this.currentLevel];
		document.getElementById('totalQuestions').textContent =
			settings.questionsPerLevel;

		this.generatePairsQuestion();
	}

	generatePairsQuestion() {
		const settings = difficultySettings[this.currentLevel];
		document.getElementById('currentQuestion').textContent =
			this.questionsAnswered + 1;

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

		// Визуально отмечаем правильные и неправильные пары
		correctPairs.forEach(pair => {
			const leftElement = Array.from(
				document.querySelectorAll('#leftColumn .word-item')
			).find(el => el.textContent === pair.left);
			const rightWord = userMatches[pair.left];

			if (rightWord === pair.right) {
				// Правильная пара - оставляем цветной
				correct++;
				if (leftElement) {
					leftElement.classList.add('correct-pair');
				}
				const rightElement = document.querySelector(
					`#rightColumn .word-item[data-word="${rightWord}"]`
				);
				if (rightElement) {
					rightElement.classList.add('correct-pair');
				}
			} else if (rightWord) {
				// Неправильная пара - красим красным
				incorrect++;
				if (leftElement) {
					leftElement.style.background = '#e74c3c';
					leftElement.style.color = 'white';
					leftElement.classList.add('incorrect-pair');
				}
				const rightElement = document.querySelector(
					`#rightColumn .word-item[data-word="${rightWord}"]`
				);
				if (rightElement) {
					rightElement.style.background = '#e74c3c';
					rightElement.style.color = 'white';
					rightElement.classList.add('incorrect-pair');
				}
			}
		});

		const settings = difficultySettings[this.currentLevel];
		const points =
			correct * settings.pointsPerCorrect + incorrect * settings.penalty;
		this.score += points;

		this.updateUI();

		const message = `
            Правильно: ${correct}<br>
            Неправильно: ${incorrect}<br>
            Получено очков: ${points > 0 ? '+' : ''}${points}
        `;

		this.questionsAnswered++;

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
	}

	// ========== УРОВЕНЬ 2: Кластеризация слов ==========
	loadPathLevel() {
		const gameArea = document.getElementById('gameArea');
		gameArea.innerHTML =
			'<h2>Уровень 2: Распределите слова по категориям</h2><p>Перетаскивайте слова в соответствующие секции</p>';

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

		// Подсчитываем результаты и визуально отмечаем
		Object.keys(correctClusters).forEach(word => {
			const correctCategory = correctClusters[word];
			const userCategory = userClusters[word];

			if (userCategory === correctCategory) {
				correct++;
				// Подсвечиваем правильно размещенные слова зеленым
				const placedWord = document.querySelector(
					`.category-box[data-category="${userCategory}"] .word-to-cluster.placed[data-word="${word}"]`
				);
				if (placedWord) {
					placedWord.style.background = '#2ecc71';
					placedWord.style.color = 'white';
				}
			} else if (userCategory) {
				incorrect++;
				// Подсвечиваем неправильно размещенные слова красным
				const placedWord = document.querySelector(
					`.category-box[data-category="${userCategory}"] .word-to-cluster.placed[data-word="${word}"]`
				);
				if (placedWord) {
					placedWord.style.background = '#e74c3c';
					placedWord.style.color = 'white';
				}
			} else {
				notPlaced++;
				// Подсвечиваем не размещенные слова оранжевым
				const unplacedWord = document.querySelector(
					`.words-pool .word-to-cluster[data-word="${word}"]`
				);
				if (unplacedWord) {
					unplacedWord.style.background = '#f39c12';
					unplacedWord.style.color = 'white';
				}
			}
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
		}, 2000);
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

		// Визуальная обратная связь
		document.querySelectorAll('.text-word').forEach(span => {
			const word = span.dataset.word;
			// Убираем знаки препинания для сравнения
			const cleanWord = word.replace(/[.,!?;:]/g, '');

			if (alienWords.includes(cleanWord) && selectedWords.includes(word)) {
				// Верно выбранные - зеленый
				span.classList.add('correct-found');
				correctFound++;
			} else if (
				alienWords.includes(cleanWord) &&
				!selectedWords.includes(word)
			) {
				// Пропущенные (должны были отметить, но не отметили) - синий
				span.classList.add('missed-word');
				notFound++;
			} else if (
				!alienWords.includes(cleanWord) &&
				selectedWords.includes(word)
			) {
				// Неверно выбранные - красный (исчезнет через 2 секунды)
				span.classList.add('wrong-selected');
				wrongSelected++;
				// Убираем красный цвет через 2 секунды
				setTimeout(() => {
					span.classList.remove('wrong-selected');
					span.classList.remove('selected');
				}, 2000);
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
		}, 5000);
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
		}
	}

	nextLevel() {
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

		// Сохраняем результат
		Storage.saveRating(
			this.gameState.playerName,
			this.score,
			this.currentLevel - 1
		);
		Storage.clearGameState();

		document.getElementById('finalScore').textContent = this.score;
		document.getElementById('finalLevel').textContent = this.currentLevel - 1;
		document.getElementById('finalModal').classList.add('show');
	}

	exitGame() {
		this.showConfirm(
			'Завершить игру?',
			'Вы уверены, что хотите завершить игру? Прогресс будет сохранён.',
			() => {
				this.stopTimer();

				// Сохраняем результат
				Storage.saveRating(
					this.gameState.playerName,
					this.score,
					this.currentLevel
				);
				Storage.clearGameState();

				window.location.href = 'index.html';
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
