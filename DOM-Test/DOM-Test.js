// Данные вопросов
const questionsData = [
	{
		question:
			'А голос у него был не такой, как у почтальона Печкина, дохленький. У Гаврюши голосище был, как у электрички. Он _____ _____ на ноги поднимал.',
		answers: [
			{ text: 'Пол деревни, за раз', correct: false },
			{ text: 'Полдеревни, зараз', correct: true },
			{ text: 'Пол-деревни, за раз', correct: false },
		],
		explanation:
			'Раздельно существительное будет писаться в случае наличия дополнительного слова между существительным и частицей. Правильный ответ: полдеревни пишется слитно. Зараз (ударение на второй слог) — это обстоятельственное наречие, пишется слитно. Означает быстро, одним махом.',
	},
	{
		question: 'А эти слова как пишутся?',
		answers: [
			{ text: 'Капуччино и эспрессо', correct: false },
			{ text: 'Каппуччино и экспресо', correct: false },
			{ text: 'Капучино и эспрессо', correct: true },
		],
		explanation:
			'По орфографическим нормам русского языка единственно верным написанием будут «капучино» и «эспрессо».',
	},
	{
		question: 'Как нужно писать?',
		answers: [
			{ text: 'Черезчур', correct: false },
			{ text: 'Черес-чур', correct: false },
			{ text: 'Чересчур', correct: true },
		],
		explanation:
			'Это слово появилось от соединения предлога «через» и древнего слова «чур», которое означает «граница», «край». Но слово претерпело изменения, так что правильное написание учим наизусть — «чересчур».',
	},
	{
		question: 'Где допущена ошибка?',
		answers: [
			{ text: 'Аккордеон', correct: false },
			{ text: 'Белиберда', correct: false },
			{ text: 'Эпелепсия', correct: true },
		],
		explanation: 'Это слово пишется так: «эпИлепсия».',
	},
];

class Quiz {
	constructor() {
		console.log('Quiz constructor called');

		this.questions = [];
		this.currentQuestionIndex = 0;
		this.correctAnswers = 0;
		this.answeredQuestions = new Set();

		// Получаем элементы DOM
		this.quizArea = document.getElementById('quiz-area');
		this.noQuestions = document.getElementById('no-questions');
		this.controls = document.getElementById('controls');
		this.results = document.getElementById('results');
		this.nextBtn = document.getElementById('next-btn');
		this.finishBtn = document.getElementById('finish-btn');
		this.restartBtn = document.getElementById('restart-btn');

		console.log('DOM elements:', {
			quizArea: this.quizArea,
			noQuestions: this.noQuestions,
			controls: this.controls,
			results: this.results,
		});

		this.init();
	}

	init() {
		console.log('Initializing quiz...');
		this.shuffleQuestions();
		console.log('Shuffled questions:', this.questions);
		this.displayQuestion();
		this.setupEventListeners();
	}

	shuffleQuestions() {
		// Перемешиваем вопросы
		this.questions = [...questionsData].sort(() => Math.random() - 0.5);

		// Перемешиваем ответы для каждого вопроса
		this.questions.forEach(question => {
			question.answers = [...question.answers].sort(() => Math.random() - 0.5);
		});
	}

	displayQuestion() {
		console.log('Displaying question:', this.currentQuestionIndex);

		if (this.currentQuestionIndex >= this.questions.length) {
			console.log('No more questions');
			this.showNoQuestions();
			return;
		}

		const question = this.questions[this.currentQuestionIndex];
		console.log('Current question:', question);

		if (!this.quizArea) {
			console.error('quiz-area element not found!');
			return;
		}

		this.quizArea.innerHTML = this.createQuestionHTML(
			question,
			this.currentQuestionIndex
		);
		this.setupAnswerListeners();

		// Спрячем контролы до ответа
		if (this.nextBtn) this.nextBtn.classList.add('hidden');
		if (this.finishBtn) this.finishBtn.classList.add('hidden');

		// убедимся, что пояснение скрыто и у ответов сняты анимации
		const explanation = this.quizArea.querySelector('.explanation');
		if (explanation) {
			explanation.classList.remove('show', 'correct', 'incorrect');
		}

		const answerBlocks = this.quizArea.querySelectorAll('.answer-block');
		answerBlocks.forEach(b => {
			b.classList.remove('selected', 'correct', 'incorrect', 'slide-down');
			b.style.pointerEvents = 'auto'; // включаем клики до выбора
		});

		console.log('Question displayed successfully');
	}

	createQuestionHTML(question, index) {
		return `
            <div class="question-block" data-index="${index}">
                <div class="question-header">
                    <div class="question-number">${index + 1}</div>
                    <div class="question-text">${question.question}</div>
                    <div class="question-marker"></div>
                </div>
                <div class="answers-container">
                    ${question.answers
											.map(
												(answer, i) => `
                        <div class="answer-block" data-index="${i}">
                            ${answer.text}
                        </div>
                    `
											)
											.join('')}
                </div>
                <div class="explanation">${question.explanation}</div>
            </div>
        `;
	}

	setupAnswerListeners() {
		const answerBlocks = this.quizArea.querySelectorAll('.answer-block');
		const questionBlock = this.quizArea.querySelector('.question-block');

		console.log(
			'Setting up listeners for',
			answerBlocks.length,
			'answer blocks'
		);

		answerBlocks.forEach(block => {
			block.addEventListener('click', () => {
				console.log('Answer clicked');
				if (this.answeredQuestions.has(this.currentQuestionIndex)) {
					console.log('Question already answered');
					return;
				}

				const answerIndex = parseInt(block.dataset.index);
				console.log('Selected answer index:', answerIndex);
				this.handleAnswer(answerIndex);
			});
		});

		// Обработчик клика по вопросу для просмотра правильного ответа
		if (questionBlock) {
			questionBlock.addEventListener('click', e => {
				if (e.target.classList.contains('answer-block')) return;

				if (this.answeredQuestions.has(this.currentQuestionIndex)) {
					console.log(
						'Showing correct answer for question',
						this.currentQuestionIndex
					);
					this.showCorrectAnswer();
				}
			});
		}
	}

	handleAnswer(selectedIndex) {
		console.log('Handling answer:', selectedIndex);

		const question = this.questions[this.currentQuestionIndex];
		const answerBlocks = Array.from(
			this.quizArea.querySelectorAll('.answer-block')
		);
		const explanation = this.quizArea.querySelector('.explanation');
		const marker = this.quizArea.querySelector('.question-marker');

		// безопасная проверка индекса
		if (!answerBlocks[selectedIndex]) return;

		// Блокируем повторные клики на текущих ответах
		answerBlocks.forEach(b => (b.style.pointerEvents = 'none'));

		const selectedAnswer = question.answers[selectedIndex];
		const correctIndex = question.answers.findIndex(answer => answer.correct);

		// Помечаем выбранный ответ визуально
		answerBlocks[selectedIndex].classList.add('selected');

		// Показываем маркер сразу и подготовим пояснение
		if (selectedAnswer.correct) {
			this.correctAnswers++;
			if (marker) {
				marker.innerHTML = '✓';
				marker.classList.remove('incorrect-marker');
				marker.classList.add('correct-marker');
			}

			// подсветка выбранного как правильного
			answerBlocks[selectedIndex].classList.add('correct');

			// пояснение с положительным префиксом
			if (explanation) {
				explanation.classList.add('show', 'correct');
				explanation.classList.remove('incorrect');
				explanation.innerHTML = `<strong>Да!</strong> ${question.explanation}`;
			}

			// остальные неправильные просто "уезжают" (последовательность)
			this._sequentialSlideOut(answerBlocks, idx => idx !== selectedIndex);
		} else {
			// Неправильный выбор
			if (marker) {
				marker.innerHTML = '✗';
				marker.classList.remove('correct-marker');
				marker.classList.add('incorrect-marker');
			}

			answerBlocks[selectedIndex].classList.add('incorrect');
			// подсвечиваем правильный вариант
			if (answerBlocks[correctIndex])
				answerBlocks[correctIndex].classList.add('correct');

			// пояснение с отрицательным префиксом
			if (explanation) {
				explanation.classList.add('show', 'incorrect');
				explanation.classList.remove('correct');
				explanation.innerHTML = `<strong>Нет.</strong> ${question.explanation}`;
			}

			// все ответы уезжают вниз (включая правильный)
			this._sequentialSlideOut(answerBlocks, () => true);
		}

		this.answeredQuestions.add(this.currentQuestionIndex);

		// Показать контролы без долгих задержек
		if (this.currentQuestionIndex < this.questions.length - 1) {
			if (this.nextBtn) this.nextBtn.classList.remove('hidden');
		} else {
			if (this.finishBtn) this.finishBtn.classList.remove('hidden');
		}
	}

	// Вспомогательная функция: поочередно добавляет класс slide-down.
	// predicate может быть функцией или маской (idx => boolean).
	_sequentialSlideOut(blocks, predicate) {
		// predicate может быть булевым или функцией
		const shouldSlide =
			typeof predicate === 'function' ? predicate : i => predicate;

		// небольшая последовательная задержка через requestAnimationFrame + setTimeout(,80)
		blocks.forEach((block, i) => {
			if (!shouldSlide(i)) return;
			// небольшой stagger, но очень короткий и надежный
			setTimeout(() => {
				block.classList.add('slide-down');
			}, i * 80);
		});
	}

	showCorrectAnswer() {
		const question = this.questions[this.currentQuestionIndex];
		const answerBlocks = this.quizArea.querySelectorAll('.answer-block');
		const explanation = this.quizArea.querySelector('.explanation');
		const correctIndex = question.answers.findIndex(answer => answer.correct);

		if (answerBlocks[correctIndex])
			answerBlocks[correctIndex].classList.add('correct');

		// Пояснение показываем при просмотре правильного ответа (если его нет — добавим)
		if (explanation) {
			// Если пояснение ещё не видно, показываем с корректной подсветкой
			if (!explanation.classList.contains('show')) {
				explanation.classList.add('show');
				// Определяем, был ли ответ правильным, исходя из класса в handleAnswer()
				// Если есть класс 'incorrect', значит ответ был неправильным
				if (explanation.classList.contains('incorrect')) {
					// Не меняем — уже установлено в handleAnswer()
				} else {
					// Если не установлен ни correct, ни incorrect, значит это первый показ
					explanation.classList.add('correct');
					explanation.innerHTML = `<strong>Да!</strong> ${question.explanation}`;
				}
			} else {
				// Пояснение уже видно — просто убеждаемся, что оно показано
				explanation.classList.add('show');
				// Сохраняем существующие классы correct/incorrect — не меняем!
			}
		}
	}

	showNoQuestions() {
		console.log('Showing no questions message');
		// скрываем область вопросов и показываем верхний блок "Вопросы закончились"
		if (this.quizArea) this.quizArea.classList.add('hidden');
		if (this.noQuestions) this.noQuestions.classList.remove('hidden');
		if (this.controls) this.controls.classList.add('hidden');
		// Немедленно показываем результаты без задержки
		this.showResults();
	}

	// Показ результатов — теперь без задержки
	showResults() {
		console.log('Showing results immediately');
		// Скрываем сообщение "Вопросы закончились", если нужно — оставляем по дизайну
		if (this.noQuestions) this.noQuestions.classList.add('hidden');
		// Показываем блок результатов
		if (this.results) this.results.classList.remove('hidden');

		const correctCount = document.getElementById('correct-count');
		const totalQuestions = document.getElementById('total-questions');

		if (correctCount) correctCount.textContent = this.correctAnswers;
		if (totalQuestions) totalQuestions.textContent = this.questions.length;

		// Убедимся, что контролы скрыты и кнопка перезапуска видна
		if (this.controls) this.controls.classList.add('hidden');
		if (this.restartBtn) this.restartBtn.style.display = ''; // видимый (полагаться на CSS)
	}

	restartQuiz() {
		console.log('Restarting quiz');
		this.questions = [];
		this.currentQuestionIndex = 0;
		this.correctAnswers = 0;
		this.answeredQuestions.clear();

		if (this.quizArea) this.quizArea.classList.remove('hidden');
		if (this.noQuestions) this.noQuestions.classList.add('hidden');
		if (this.results) this.results.classList.add('hidden');
		if (this.controls) this.controls.classList.remove('hidden');

		this.shuffleQuestions();
		this.displayQuestion();
	}

	nextQuestion() {
		console.log('Moving to next question');
		// Защита: если текущий вопрос ещё не отвечен — не позволяем листать
		if (!this.answeredQuestions.has(this.currentQuestionIndex)) {
			console.log('Cannot go to next question: current not answered');
			return;
		}
		this.currentQuestionIndex++;
		this.displayQuestion();
	}

	setupEventListeners() {
		console.log('Setting up event listeners');

		if (this.nextBtn) {
			this.nextBtn.addEventListener('click', () => this.nextQuestion());
		}

		if (this.finishBtn) {
			this.finishBtn.addEventListener('click', () => this.showNoQuestions());
		}

		if (this.restartBtn) {
			this.restartBtn.addEventListener('click', () => this.restartQuiz());
		}
	}
}

// Инициализация теста при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded, initializing quiz...');
	new Quiz();
});
