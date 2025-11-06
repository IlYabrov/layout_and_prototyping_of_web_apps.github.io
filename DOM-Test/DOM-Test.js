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
			'Правильно! Раздельно существительное будет писаться в случае наличия дополнительного слова между существительным и частицей. Правильный ответ: полдеревни пишется слитно. Зараз (ударение на второй слог) — это обстоятельственное наречие, пишется слитно. Означает быстро, одним махом.',
	},
	{
		question: 'А эти слова как пишутся?',
		answers: [
			{ text: 'Капуччино и эспрессо', correct: false },
			{ text: 'Каппуччино и экспресо', correct: false },
			{ text: 'Капучино и эспрессо', correct: true },
		],
		explanation:
			'Конечно! По орфографическим нормам русского языка единственно верным написанием будут «капучино» и «эспрессо».',
	},
	{
		question: 'Как нужно писать?',
		answers: [
			{ text: 'Черезчур', correct: false },
			{ text: 'Черес-чур', correct: false },
			{ text: 'Чересчур', correct: true },
		],
		explanation:
			'Да! Это слово появилось от соединения предлога «через» и древнего слова «чур», которое означает «граница», «край». Но слово претерпело изменения, так что правильное написание учим наизусть — «чересчур».',
	},
	{
		question: 'Где допущена ошибка?',
		answers: [
			{ text: 'Аккордеон', correct: false },
			{ text: 'Белиберда', correct: false },
			{ text: 'Эпелепсия', correct: true },
		],
		explanation: 'Верно! Это слово пишется так: «эпИлепсия».',
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

		// Показываем/скрываем кнопки управления
		if (this.nextBtn) this.nextBtn.classList.add('hidden');
		if (this.finishBtn) this.finishBtn.classList.add('hidden');

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
		const answerBlocks = this.quizArea.querySelectorAll('.answer-block');
		const explanation = this.quizArea.querySelector('.explanation');
		const marker = this.quizArea.querySelector('.question-marker');

		const selectedAnswer = question.answers[selectedIndex];
		const correctIndex = question.answers.findIndex(answer => answer.correct);

		console.log('Selected answer:', selectedAnswer);
		console.log('Correct index:', correctIndex);

		// Помечаем выбранный ответ
		answerBlocks[selectedIndex].classList.add('selected');

		if (selectedAnswer.correct) {
			console.log('Correct answer!');
			this.correctAnswers++;
			if (marker) {
				marker.innerHTML = '✓';
				marker.classList.add('correct-marker');
			}

			answerBlocks[selectedIndex].classList.add('correct');

			// ПОЯСНЕНИЕ ПОКАЗЫВАЕМ ТОЛЬКО ПРИ ПРАВИЛЬНОМ ОТВЕТЕ
			if (explanation) explanation.classList.add('show');

			// Анимация для неправильных ответов (уезжают ВНИЗ)
			answerBlocks.forEach((block, index) => {
				if (index !== selectedIndex && index !== correctIndex) {
					setTimeout(() => {
						block.classList.add('slide-down');
					}, 500);
				}
			});

			// Через 2 секунды правильный ответ тоже уезжает ВНИЗ
			setTimeout(() => {
				answerBlocks[correctIndex].classList.add('slide-down');
			}, 2000);
		} else {
			console.log('Incorrect answer!');
			if (marker) {
				marker.innerHTML = '✗';
				marker.classList.add('incorrect-marker');
			}

			answerBlocks[selectedIndex].classList.add('incorrect');
			answerBlocks[correctIndex].classList.add('correct');

			// Все ответы уезжают ВНИЗ
			setTimeout(() => {
				answerBlocks.forEach(block => {
					block.classList.add('slide-down');
				});
			}, 500);
		}

		this.answeredQuestions.add(this.currentQuestionIndex);

		// Показываем кнопку управления
		setTimeout(() => {
			if (this.currentQuestionIndex < this.questions.length - 1) {
				if (this.nextBtn) this.nextBtn.classList.remove('hidden');
			} else {
				if (this.finishBtn) this.finishBtn.classList.remove('hidden');
			}
		}, 1000);
	}

	showCorrectAnswer() {
		const question = this.questions[this.currentQuestionIndex];
		const answerBlocks = this.quizArea.querySelectorAll('.answer-block');
		const explanation = this.quizArea.querySelector('.explanation');
		const correctIndex = question.answers.findIndex(answer => answer.correct);

		answerBlocks[correctIndex].classList.add('correct');
		// Пояснение показываем при просмотре правильного ответа
		if (explanation) explanation.classList.add('show');
	}

	nextQuestion() {
		console.log('Moving to next question');
		this.currentQuestionIndex++;
		this.displayQuestion();
	}

	showNoQuestions() {
		console.log('Showing no questions message');
		if (this.quizArea) this.quizArea.classList.add('hidden');
		if (this.noQuestions) this.noQuestions.classList.remove('hidden');
		if (this.controls) this.controls.classList.add('hidden');
		this.showResults();
	}

	showResults() {
		console.log('Showing results');
		setTimeout(() => {
			if (this.noQuestions) this.noQuestions.classList.add('hidden');
			if (this.results) this.results.classList.remove('hidden');

			const correctCount = document.getElementById('correct-count');
			const totalQuestions = document.getElementById('total-questions');

			if (correctCount) correctCount.textContent = this.correctAnswers;
			if (totalQuestions) totalQuestions.textContent = this.questions.length;
		}, 2000);
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
