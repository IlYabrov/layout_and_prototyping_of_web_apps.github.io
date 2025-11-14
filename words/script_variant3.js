const parseBtn = document.getElementById('parse-btn');
const inputText = document.getElementById('input-text');
const block1 = document.getElementById('block-1');
const block2 = document.getElementById('block-2');
const block3Info = document.getElementById('block-3-info');

let sortedItems = []; // Исходные отсортированные элементы
let draggedElement = null;

function getRandomColor() {
	const colors = [
		'#FF6B6B',
		'#4ECDC4',
		'#45B7D1',
		'#FFA07A',
		'#98D8C8',
		'#F7DC6F',
		'#BB8FCE',
		'#85C1E2',
		'#F8B88B',
		'#52C4A1',
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
		.split('-')
		.map(w => w.trim())
		.filter(w => w.length > 0);

	const lowercase = [];
	const uppercase = [];
	const numbers = [];

	words.forEach(word => {
		if (/^\d+$/.test(word)) {
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
	block1.innerHTML = '';
	block3Info.textContent = '';
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

	// Показываем в блоке 3 ключ и слово
	item.addEventListener('click', () => {
		block3Info.textContent = `${key} ${word}`;
	});

	return item;
}

function setupDropZones() {
	// Блок 1 (синий) - можно перетаскивать из блока 2 и переставлять местами
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

		const word = draggedElement.dataset.word;
		const key = draggedElement.dataset.key;
		const index =
			draggedElement.dataset.index !== undefined
				? Number(draggedElement.dataset.index)
				: null;

		// Из блока 2 в блок 1
		if (draggedElement.parentElement === block2) {
			const randomColor = getRandomColor();
			// помечаем в sortedItems как находящийся в block1
			if (index !== null) sortedItems[index].inBlock1 = true;

			const newItem = createItemBlock1(word, key, randomColor, index);

			const afterElement = getDragAfterElement(block1, e.clientY);
			if (afterElement === null) {
				block1.appendChild(newItem);
			} else {
				block1.insertBefore(newItem, afterElement);
			}

			// Удаляем оригинал из блока 2 чтобы не дублировалось
			draggedElement.remove();
			draggedElement = null;
		}
		// Перемещение внутри блока 1
		else if (draggedElement.parentElement === block1) {
			const afterElement = getDragAfterElement(block1, e.clientY);
			if (afterElement == null) {
				block1.appendChild(draggedElement);
			} else {
				block1.insertBefore(draggedElement, afterElement);
			}
			draggedElement = null;
		}
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

function getDragAfterElement(container, y) {
	const draggableElements = [
		...container.querySelectorAll('.item:not(.dragging)'),
	];

	return draggableElements.reduce(
		(closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;

			if (offset < 0 && offset > closest.offset) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
		},
		{ offset: Number.NEGATIVE_INFINITY }
	).element;
}

parseBtn.addEventListener('click', parseAndSort);
inputText.addEventListener('keypress', e => {
	if (e.key === 'Enter') parseAndSort();
});

setupDropZones();
