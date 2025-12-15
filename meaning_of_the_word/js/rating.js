// Логика страницы рейтинга (rating.html)

document.addEventListener('DOMContentLoaded', () => {
	const ratingTableBody = document.getElementById('ratingTableBody');
	const clearRatingBtn = document.getElementById('clearRatingBtn');
	const backToMenuBtn = document.getElementById('backToMenuBtn');
	const filterBtns = document.querySelectorAll('.filter-btn');

	let currentFilter = 'all';

	// Загружаем рейтинг
	loadRatings();

	// Обработчики фильтров
	filterBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			filterBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			currentFilter = btn.dataset.filter;
			loadRatings();
		});
	});

	// Очистка рейтинга
	clearRatingBtn.addEventListener('click', () => {
		if (
			confirm(
				'Вы уверены, что хотите очистить весь рейтинг? Это действие нельзя отменить.'
			)
		) {
			Storage.clearRatings();
			loadRatings();
			showNotification('Рейтинг успешно очищен', 'success');
		}
	});

	// Возврат на главную
	backToMenuBtn.addEventListener('click', () => {
		window.location.href = 'index.html';
	});

	// Клавиатурные события
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape') {
			window.location.href = 'index.html';
		}
	});

	function loadRatings() {
		let ratings = Storage.getRatings();

		if (currentFilter === 'top10') {
			ratings = ratings.slice(0, 10);
		}

		ratingTableBody.innerHTML = '';

		if (ratings.length === 0) {
			ratingTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        <p style="font-size: 1.2em; color: #7f8c8d;">
                            😔 Рейтинг пуст<br>
                            <small>Сыграйте в игру, чтобы попасть в таблицу лидеров!</small>
                        </p>
                    </td>
                </tr>
            `;
			return;
		}

		ratings.forEach((rating, index) => {
			const row = document.createElement('tr');

			// Анимация появления строк
			row.style.animation = `slideIn 0.3s ease ${index * 0.05}s both`;

			// Подсветка топ-3
			if (index < 3) {
				row.style.background =
					'linear-gradient(to right, rgba(255, 215, 0, 0.1), transparent)';
			}

			const medal = getMedal(index);
			const date = new Date(rating.date);
			const formattedDate = date.toLocaleDateString('ru-RU', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
			});

			row.innerHTML = `
                <td>
                    <span class="medal">${medal}</span>
                    ${index + 1}
                </td>
                <td><strong>${escapeHtml(rating.playerName)}</strong></td>
                <td><strong>${rating.score}</strong></td>
                <td>Уровень ${rating.level}</td>
                <td>${formattedDate}</td>
            `;

			// Подсветка текущего игрока
			const currentPlayer = Storage.getCurrentPlayer();
			if (currentPlayer && rating.playerName === currentPlayer) {
				row.style.background = 'rgba(74, 144, 226, 0.1)';
				row.style.fontWeight = 'bold';
			}

			// Анимация при наведении
			row.addEventListener('mouseenter', () => {
				row.style.transform = 'scale(1.02)';
				row.style.transition = 'all 0.3s ease';
			});

			row.addEventListener('mouseleave', () => {
				row.style.transform = '';
			});

			ratingTableBody.appendChild(row);
		});

		// Показываем статистику
		showStatistics(ratings);
	}

	function getMedal(index) {
		switch (index) {
			case 0:
				return '🥇';
			case 1:
				return '🥈';
			case 2:
				return '🥉';
			default:
				return '';
		}
	}

	function escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	function showStatistics(ratings) {
		if (ratings.length === 0) return;

		const avgScore = Math.round(
			ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
		);
		const maxScore = Math.max(...ratings.map(r => r.score));
		const totalGames = ratings.length;

		// Создаём блок статистики, если его нет
		let statsBlock = document.querySelector('.stats-block');
		if (!statsBlock) {
			statsBlock = document.createElement('div');
			statsBlock.className = 'stats-block';
			statsBlock.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-around;
                flex-wrap: wrap;
                gap: 20px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            `;

			const container = document.querySelector('.rating-table-container');
			container.before(statsBlock);
		}

		statsBlock.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2em; font-weight: bold;">${totalGames}</div>
                <div style="opacity: 0.9;">Всего игр</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2em; font-weight: bold;">${maxScore}</div>
                <div style="opacity: 0.9;">Рекорд</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2em; font-weight: bold;">${avgScore}</div>
                <div style="opacity: 0.9;">Средний счёт</div>
            </div>
        `;
	}

	function showNotification(message, type = 'info') {
		const notification = document.createElement('div');
		notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#4a90e2'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInRight 0.5s ease;
        `;
		notification.textContent = message;

		document.body.appendChild(notification);

		setTimeout(() => {
			notification.style.animation = 'slideOutRight 0.5s ease';
			setTimeout(() => notification.remove(), 500);
		}, 3000);
	}

	// Добавляем стили для анимаций
	const style = document.createElement('style');
	style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
	document.head.appendChild(style);

	// Эффект конфетти для топ-1
	const topPlayer = Storage.getRatings()[0];
	if (topPlayer && Storage.getCurrentPlayer() === topPlayer.playerName) {
		createConfetti();
	}

	function createConfetti() {
		const colors = [
			'#ff0000',
			'#00ff00',
			'#0000ff',
			'#ffff00',
			'#ff00ff',
			'#00ffff',
		];

		for (let i = 0; i < 50; i++) {
			setTimeout(() => {
				const confetti = document.createElement('div');
				confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${
											colors[Math.floor(Math.random() * colors.length)]
										};
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 999;
                    animation: fall ${2 + Math.random() * 3}s linear;
                `;

				document.body.appendChild(confetti);

				setTimeout(() => confetti.remove(), 5000);
			}, i * 50);
		}

		const fallStyle = document.createElement('style');
		fallStyle.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
		document.head.appendChild(fallStyle);
	}
});
