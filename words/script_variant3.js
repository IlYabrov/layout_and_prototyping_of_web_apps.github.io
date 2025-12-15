const parseBtn = document.getElementById('parse-btn');
const inputText = document.getElementById('input-text');
const block1 = document.getElementById('block-1');
const block2 = document.getElementById('block-2');
const block3Info = document.getElementById('block-3-info');

let sortedItems = []; // Исходные отсортированные элементы
let draggedElement = null;

function getRandomColor() {
	const colors = [
		'#FF6B6B', // Красный
		'#4ECDC4', // Бирюзовый
		'#45B7D1', // Голубой
		'#FFA07A', // Лососевый
		'#98D8C8', // Мятный
		'#F7DC6F', // Желтый
		'#BB8FCE', // Фиолетовый
		'#85C1E2', // Светло-синий
		'#F8B88B', // Персиковый
		'#52C4A1', // Зеленый
		'#FF85A1', // Розовый
		'#FFB347', // Оранжевый
		'#A8E6CF', // Светло-зеленый
		'#FFD700', // Золотой
		'#DDA0DD', // Сливовый
		'#87CEEB', // Небесно-голубой
		'#FFA500', // Апельсиновый
		'#9370DB', // Средний фиолетовый
		'#20B2AA', // Морская волна
		'#FA8072', // Лососево-красный
		'#FFB6C1', // Светло-розовый
		'#00CED1', // Темная бирюза
		'#FFDAB9', // Персиковый пудровый
		'#B0E0E6', // Пудрово-голубой
		'#DEB887', // Песочный
	];
	return colors[Math.floor(Math.random() * colors.length)];
}

function parseAndSort() {
	const text = inputText.value.trim();
	if (!text) {
		alert('Пожалуйста, введите текст');
		return;
	}

	const words = text
		.split('-') // Разделяем по дефисам
		.map(w => w.trim()) // Убираем лишние пробелы
		.filter(w => w.length > 0); // Убираем пустые строки

	const lowercase = [];
	const uppercase = [];
	const numbers = [];

	words.forEach(word => {
		if (/^\d+$/.test(word)) {
			// Проверяем, что слово состоит только из цифр
			numbers.push(word);
		} else if (
			word[0] === word[0].toUpperCase() &&
			word[0] !== word[0].toLowerCase()
		) {
			// Проверяем, что первая буква заглавная (и это не цифра)
			uppercase.push(word);
		} else {
			lowercase.push(word);
		}
	});

	lowercase.sort();
	uppercase.sort();
	numbers.sort((a, b) => Number(a) - Number(b));

	sortedItems = [];
	let aIndex = 1,
		bIndex = 1,
		nIndex = 1;

	lowercase.forEach(word => {
		sortedItems.push({
			word,
			key: `a${aIndex++}`,
			originalColor: '#90EE90',
			inBlock1: false,
		});
	});

	uppercase.forEach(word => {
		sortedItems.push({
			word,
			key: `b${bIndex++}`,
			originalColor: '#90EE90',
			inBlock1: false,
		});
	});

	numbers.forEach(word => {
		sortedItems.push({
			word,
			key: `n${nIndex++}`,
			originalColor: '#90EE90',
			inBlock1: false,
		});
	});

	renderBlock2();
	block1.innerHTML = ''; // Очищаем блок 1
	block3Info.textContent = ''; // Очищаем блок 3
}

function renderBlock2() {
	block2.innerHTML = '';
	sortedItems.forEach((item, index) => {
		// Отрисовываем только те элементы, которые не в блоке 1
		if (!item.inBlock1) {
			const el = createItemBlock2(
				item.word,
				item.key,
				item.originalColor,
				index
			);
			block2.appendChild(el);
		}
	});
}

function createItemBlock2(word, key, color, index) {
	const item = document.createElement('div');
	item.className = 'item';
	item.textContent = `${key} ${word}`;
	item.style.background = color;
	item.draggable = true;
	item.dataset.word = word;
	item.dataset.key = key;
	item.dataset.index = index;

	item.addEventListener('dragstart', e => {
		draggedElement = item;
		item.classList.add('dragging');
		e.dataTransfer.effectAllowed = 'move';
		item.style.opacity = '0.6';
	});

	item.addEventListener('dragend', e => {
		item.style.opacity = '1';
		item.classList.remove('dragging');
	});

	return item;
}

function createItemBlock1(word, key, color, index) {
	const item = document.createElement('div');
	item.className = 'item';
	item.textContent = `${key} ${word}`;
	item.style.background = color;
	item.draggable = true;
	item.dataset.word = word;
	item.dataset.key = key;
	item.dataset.color = color;
	// сохраняем индекс, чтобы знать, какой элемент вернуть в block2
	item.dataset.index = index;

	item.addEventListener('dragstart', e => {
		draggedElement = item;
		item.classList.add('dragging');
		e.dataTransfer.effectAllowed = 'move';
		item.style.opacity = '0.6';
	});

	item.addEventListener('dragend', e => {
		item.style.opacity = '1';
		item.classList.remove('dragging');
	});

	// Добавляем слово в блок 3 при клике
	item.addEventListener('click', () => {
		// Если в блоке 3 уже есть текст, добавляем пробел перед новым словом
		if (block3Info.textContent.trim() !== '') {
			block3Info.textContent += ' ';
		}
		block3Info.textContent += word;
		block3Info.style.color = color;
	});

	return item;
}

function setupDropZones() {
	block1.addEventListener('dragover', e => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		block1.style.backgroundColor = '#d0e8ff';
	});

	block1.addEventListener('dragleave', e => {
		if (e.target === block1) {
			block1.style.backgroundColor = '#ffffff';
		}
	});

	block1.addEventListener('drop', e => {
		e.preventDefault();
		block1.style.backgroundColor = '#ffffff';

		if (!draggedElement) return;

		let item;

		if (draggedElement.parentElement === block2) {
			const index = Number(draggedElement.dataset.index);
			if (sortedItems[index]) sortedItems[index].inBlock1 = true;

			item = createItemBlock1(
				draggedElement.dataset.word,
				draggedElement.dataset.key,
				getRandomColor(),
				index
			);
			block1.appendChild(item);
			draggedElement.remove();
		} else {
			item = draggedElement;
		}

		const rect = block1.getBoundingClientRect();
		const width = item.offsetWidth;
		const height = item.offsetHeight;

		let left = e.clientX - rect.left - width / 2;
		let top = e.clientY - rect.top - height / 2;

		left = Math.max(0, Math.min(left, block1.clientWidth - width));
		top = Math.max(0, Math.min(top, block1.clientHeight - height));

		item.style.position = 'absolute';
		item.style.left = `${left}px`;
		item.style.top = `${top}px`;

		draggedElement = null;
	});

	// Блок 2 (зеленый) - возврат элементов на исходное место
	block2.addEventListener('dragover', e => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		block2.style.backgroundColor = '#d0ffd0';
	});

	block2.addEventListener('dragleave', e => {
		if (e.target === block2) {
			block2.style.backgroundColor = '#ffffff';
		}
	});

	block2.addEventListener('drop', e => {
		e.preventDefault();
		block2.style.backgroundColor = '#ffffff';

		if (!draggedElement) return;

		// Только из блока 1 в блок 2
		if (draggedElement.parentElement === block1) {
			const idx =
				draggedElement.dataset.index !== undefined
					? Number(draggedElement.dataset.index)
					: null;
			// отмечаем, что элемент вернулся в block2
			if (idx !== null) sortedItems[idx].inBlock1 = false;

			// удаляем DOM-элемент из block1 и перерисовываем block2 (только не в block1 помеченные)
			draggedElement.remove();
			draggedElement = null;
			renderBlock2();
		}
	});
}

parseBtn.addEventListener('click', parseAndSort);
inputText.addEventListener('keypress', e => {
	if (e.key === 'Enter') parseAndSort();
});

setupDropZones();
