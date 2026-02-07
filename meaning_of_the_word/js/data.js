// Данные для игры

// Уровень 1: Пары слов (мужской-женский род, родитель-детёныш)
const wordPairsData = [
	// Набор 1: Мужской-женский род
	{
		type: 'gender',
		pairs: [
			{ left: 'Барон', right: 'Баронесса' },
			{ left: 'Князь', right: 'Княгиня' },
			{ left: 'Граф', right: 'Графиня' },
			{ left: 'Король', right: 'Королева' },
			{ left: 'Актёр', right: 'Актриса' },
		],
	},
	// Набор 2: Родитель-детёныш
	{
		type: 'family',
		pairs: [
			{ left: 'Лошадь', right: 'Жеребёнок' },
			{ left: 'Собака', right: 'Щенок' },
			{ left: 'Кошка', right: 'Котёнок' },
			{ left: 'Корова', right: 'Телёнок' },
			{ left: 'Курица', right: 'Цыплёнок' },
		],
	},
	// Набор 3: Профессии-действия
	{
		type: 'profession',
		pairs: [
			{ left: 'Повар', right: 'Готовить' },
			{ left: 'Учитель', right: 'Обучать' },
			{ left: 'Врач', right: 'Лечить' },
			{ left: 'Художник', right: 'Рисовать' },
			{ left: 'Писатель', right: 'Писать' },
		],
	},
	// Набор 4: Профессии-материалы
	{
		type: 'profession-material',
		pairs: [
			{ left: 'Геолог', right: 'Минералы' },
			{ left: 'Горняк', right: 'Уголь' },
			{ left: 'Химик', right: 'Реактивы' },
			{ left: 'Металлург', right: 'Сталь' },
			{ left: 'Нефтяник', right: 'Нефть' },
		],
	},
	// Набор 5: Цвета-объекты
	{
		type: 'color-object',
		pairs: [
			{ left: 'Алый', right: 'Мак' },
			{ left: 'Лазурный', right: 'Небо' },
			{ left: 'Изумрудный', right: 'Трава' },
			{ left: 'Янтарный', right: 'Мёд' },
			{ left: 'Пурпурный', right: 'Закат' },
		],
	},
	// Набор 6: Профессии-инструменты
	{
		type: 'profession-tool',
		pairs: [
			{ left: 'Столяр', right: 'Рубанок' },
			{ left: 'Хирург', right: 'Скальпель' },
			{ left: 'Астроном', right: 'Телескоп' },
			{ left: 'Археолог', right: 'Кисть' },
			{ left: 'Скрипач', right: 'Смычок' },
		],
	},
	// Набор 7: Животные-места обитания
	{
		type: 'animal-habitat',
		pairs: [
			{ left: 'Белка', right: 'Дупло' },
			{ left: 'Бобёр', right: 'Плотина' },
			{ left: 'Медведь', right: 'Берлога' },
			{ left: 'Лиса', right: 'Нора' },
			{ left: 'Орёл', right: 'Гнездо' },
		],
	},
	// Набор 8: Растения-плоды
	{
		type: 'plant-fruit',
		pairs: [
			{ left: 'Дуб', right: 'Жёлудь' },
			{ left: 'Клён', right: 'Крылатка' },
			{ left: 'Каштан', right: 'Орех' },
			{ left: 'Рябина', right: 'Ягода' },
			{ left: 'Шиповник', right: 'Плод' },
		],
	},
	// Набор 9: Науки-объекты изучения
	{
		type: 'science-object',
		pairs: [
			{ left: 'Орнитология', right: 'Птицы' },
			{ left: 'Ихтиология', right: 'Рыбы' },
			{ left: 'Геология', right: 'Горные породы' },
			{ left: 'Ботаника', right: 'Растения' },
			{ left: 'Астрономия', right: 'Небесные тела' },
		],
	},
	// Набор 10: Спортсмены-снаряжение
	{
		type: 'sport-equipment',
		pairs: [
			{ left: 'Лыжник', right: 'Палки' },
			{ left: 'Хоккеист', right: 'Клюшка' },
			{ left: 'Теннисист', right: 'Ракетка' },
			{ left: 'Фехтовальщик', right: 'Рапира' },
			{ left: 'Стрелок', right: 'Лук' },
		],
	},
	// Набор 11: Профессии-результат
	{
		type: 'profession-result',
		pairs: [
			{ left: 'Гончар', right: 'Кувшин' },
			{ left: 'Кузнец', right: 'Подкова' },
			{ left: 'Портной', right: 'Одежда' },
			{ left: 'Пекарь', right: 'Хлеб' },
			{ left: 'Скульптор', right: 'Статуя' },
		],
	},
	// Набор 12: Учёные-открытия
	{
		type: 'scientist-discovery',
		pairs: [
			{ left: 'Ньютон', right: 'Гравитация' },
			{ left: 'Эйнштейн', right: 'Относительность' },
			{ left: 'Менделеев', right: 'Периодическая система' },
			{ left: 'Павлов', right: 'Рефлексы' },
			{ left: 'Кюри', right: 'Радиоактивность' },
		],
	},
	// Набор 13: Медицина-функции систем
	{
		type: 'medicine-function',
		pairs: [
			{ left: 'ЖКТ', right: 'Пищеварение' },
			{ left: 'ЦНС', right: 'Управление телом' },
			{ left: 'Сердечно-сосудистая', right: 'Кровообращение' },
			{ left: 'Дыхательная', right: 'Газообмен' },
			{ left: 'Эндокринная', right: 'Гормоны' },
		],
	},
	// Набор 14: Философы-направления
	{
		type: 'philosopher-movement',
		pairs: [
			{ left: 'Сартр', right: 'Экзистенциализм' },
			{ left: 'Кант', right: 'Трансцендентализм' },
			{ left: 'Ницше', right: 'Нигилизм' },
			{ left: 'Маркс', right: 'Материализм' },
			{ left: 'Платон', right: 'Идеализм' },
		],
	},
	// Набор 15: Компьютерные компоненты-функции
	{
		type: 'computer-function',
		pairs: [
			{ left: 'Процессор', right: 'Вычисления' },
			{ left: 'Оперативная память', right: 'Временное хранение' },
			{ left: 'Жёсткий диск', right: 'Постоянное хранение' },
			{ left: 'Видеокарта', right: 'Обработка графики' },
			{ left: 'Периферия', right: 'Ввод-вывод данных' },
		],
	},
];

// Уровень 2: Кластеризация слов по категориям
const clusterGameData = [
	{
		categories: ['Животные', 'Транспорт', 'Погода', 'Растения'],
		words: [
			{ word: 'Собака', category: 'Животные' },
			{ word: 'Корабль', category: 'Транспорт' },
			{ word: 'Дождь', category: 'Погода' },
			{ word: 'Роза', category: 'Растения' },
			{ word: 'Кошка', category: 'Животные' },
			{ word: 'Самолёт', category: 'Транспорт' },
			{ word: 'Снег', category: 'Погода' },
			{ word: 'Берёза', category: 'Растения' },
			{ word: 'Медведь', category: 'Животные' },
			{ word: 'Автобус', category: 'Транспорт' },
		],
	},
	{
		categories: ['Профессии', 'Инструменты', 'Еда', 'Одежда'],
		words: [
			{ word: 'Врач', category: 'Профессии' },
			{ word: 'Молоток', category: 'Инструменты' },
			{ word: 'Хлеб', category: 'Еда' },
			{ word: 'Куртка', category: 'Одежда' },
			{ word: 'Учитель', category: 'Профессии' },
			{ word: 'Отвёртка', category: 'Инструменты' },
			{ word: 'Сыр', category: 'Еда' },
			{ word: 'Рубашка', category: 'Одежда' },
			{ word: 'Повар', category: 'Профессии' },
			{ word: 'Пила', category: 'Инструменты' },
		],
	},
	{
		categories: ['Наука', 'Искусство', 'Спорт', 'Музыка'],
		words: [
			{ word: 'Химия', category: 'Наука' },
			{ word: 'Живопись', category: 'Искусство' },
			{ word: 'Футбол', category: 'Спорт' },
			{ word: 'Скрипка', category: 'Музыка' },
			{ word: 'Физика', category: 'Наука' },
			{ word: 'Скульптура', category: 'Искусство' },
			{ word: 'Теннис', category: 'Спорт' },
			{ word: 'Гитара', category: 'Музыка' },
			{ word: 'Биология', category: 'Наука' },
			{ word: 'Балет', category: 'Искусство' },
		],
	},
	{
		categories: ['Металлы', 'Газы', 'Жидкости', 'Минералы'],
		words: [
			{ word: 'Железо', category: 'Металлы' },
			{ word: 'Кислород', category: 'Газы' },
			{ word: 'Вода', category: 'Жидкости' },
			{ word: 'Алмаз', category: 'Минералы' },
			{ word: 'Медь', category: 'Металлы' },
			{ word: 'Азот', category: 'Газы' },
			{ word: 'Нефть', category: 'Жидкости' },
			{ word: 'Кварц', category: 'Минералы' },
			{ word: 'Золото', category: 'Металлы' },
			{ word: 'Гелий', category: 'Газы' },
		],
	},
];

// Уровень 3: Чужеродные фрагменты в тексте
const textGameData = [
	{
		story:
			'Однажды летом я отправился в лес за грибами. Погода была прекрасная, и спутник ярко светило на небе. Я шёл по тропинке и собирал белые грибы. В корзине у меня уже было много грибов и немного водорослей. Вдруг я услышал шорох в кустах около айсберга. Это был маленький ёжик с пропеллером. Он бежал по своим делам к вулкану.',
		alienWords: ['спутник', 'водорослей', 'айсберга', 'пропеллером', 'вулкану'],
	},
	{
		story:
			'Зимой дети любят играть в снежки и кататься на верблюдах. Они лепят снеговиков во дворе. Санки быстро едут с горки к экватору. Коньки скользят по льду катка. Лыжи помогают передвигаться по снегу вместе с акулами. После прогулки все пьют горячий бензин. Зима - это весёлое время года для космонавтов!',
		alienWords: ['верблюдах', 'экватору', 'акулами', 'бензин', 'космонавтов'],
	},
	{
		story:
			'В школе началась перемена после урока астрономии. Дети вышли в коридор с подводными лодками. Кто-то играет в мяч, а кто-то пилит доски. Другие разговаривают с друзьями о нефти. Все ждут следующего урока математики и рыбалки. Скоро прозвенит звонок, и начнётся извержение.',
		alienWords: [
			'подводными',
			'лодками',
			'пилит',
			'доски',
			'нефти',
			'рыбалки',
			'извержение',
		],
	},
	{
		story:
			'Библиотека всегда была моим любимым местом. Здесь царит особая атмосфера спокойствия и знаний. Между стеллажами бродят читатели, выбирая стэйки про космонавтов. Библиотекарь тихо печатает за стойкой около Эрмитажа. В читальном зале студенты готовятся к экзаменам с учебниками. Запах старых страниц смешивается с ароматом кофе и сортиров.',
		alienWords: ['стэйки', 'космонавтов', 'Эрмитажа', 'сортиров'],
	},
	{
		story:
			'Утро в деревне начинается рано. Петух будит всех своим ядерным криком. На кухне бабушка готовит блинчики с мхом и медом. Дедушка идёт проверить огород с лейкой и микроскопом. Корова мычит в хлеву рядом с крокодилами. В воздухе пахнет напалмом. За окном слышно, как соседи заводят свой трактор. На небе летит клин дронов-камикадзе',
		alienWords: [
			'ядерным',
			'мхом',
			'крокодилами',
			'напалмом',
			'дронов-камикадзе',
		],
	},
	{
		story:
			'Музей истории поражает своей коллекцией артефактов. В первом зале представлены древние нанотехнологии. Экскурсовод рассказывает о быте людей прошлых веков. Особое внимание привлекает коллекция оружия рядом с камасутрой. В следующем зале можно увидеть картины известных художников. Посетители фотографируют экспонаты стоя на Бурж-Халифе. В конце экскурсии все заходят в сувенирный магазин.',
		alienWords: ['нанотехнологии', 'камасутрой', 'Бурж-Халифе'],
	},
	{
		story:
			'Театральная премьера собрала полный зал зрителей. Актёры репетировали спектакль несколько месяцев под руководством режиссёра. Декорации изображали старинный замок с башнями и рейтузами. Костюмы были сшиты из калош портными. Музыкальное сопровождение создавалось оркестром и синтезаторами. Публика встретила представление аплодисментами под пиво.',
		alienWords: ['рейтузами', 'калош', 'под', 'пиво'],
	},
	{
		story:
			'Поход в горы требует тщательной подготовки. Необходимо взять палатку, спальный мешок и пять литров водки. Маршрут проложен через перевал к озеру. По дороге встречаются редкие растения около китобоен. Вечером у костра туристы готовят ужин в котелке. Ночное небо усыпано звёздами, дирижаблями.',
		alienWords: ['пять', 'литров', 'водки', 'китобоен', 'дирижаблями'],
	},
];

// Уровень 4: Падающие слова - категоризация (по аналогии с Level2 одногруппника)
const fallingWordsData = [
	{
		categories: [
			{ id: 'animals', name: 'Животные', target: 4 },
			{ id: 'food', name: 'Еда', target: 4 },
			{ id: 'transport', name: 'Транспорт', target: 4 },
		],
		words: [
			{ text: 'КОТ', category: 'animals' },
			{ text: 'СЛОН', category: 'animals' },
			{ text: 'ЛЕВ', category: 'animals' },
			{ text: 'ПИНГВИН', category: 'animals' },
			{ text: 'ЗЕБРА', category: 'animals' },
			{ text: 'ПИЦЦА', category: 'food' },
			{ text: 'ХЛЕБ', category: 'food' },
			{ text: 'СУП', category: 'food' },
			{ text: 'СЫР', category: 'food' },
			{ text: 'САЛАТ', category: 'food' },
			{ text: 'МАШИНА', category: 'transport' },
			{ text: 'ПОЕЗД', category: 'transport' },
			{ text: 'САМОЛЁТ', category: 'transport' },
			{ text: 'КОРАБЛЬ', category: 'transport' },
			{ text: 'ВЕЛОСИПЕД', category: 'transport' },
			// Слова "лишних" категорий (для бонусных очков при правом клике)
			{ text: 'РЕКА', category: 'nature' },
			{ text: 'ЛЕС', category: 'nature' },
			{ text: 'СМАРТФОН', category: 'technology' },
			{ text: 'РОБОТ', category: 'technology' },
		],
	},
	{
		categories: [
			{ id: 'professions', name: 'Профессии', target: 4 },
			{ id: 'colors', name: 'Цвета', target: 4 },
			{ id: 'emotions', name: 'Эмоции', target: 4 },
		],
		words: [
			{ text: 'ВРАЧ', category: 'professions' },
			{ text: 'УЧИТЕЛЬ', category: 'professions' },
			{ text: 'ПОВАР', category: 'professions' },
			{ text: 'ПИЛОТ', category: 'professions' },
			{ text: 'ХУДОЖНИК', category: 'professions' },
			{ text: 'КРАСНЫЙ', category: 'colors' },
			{ text: 'СИНИЙ', category: 'colors' },
			{ text: 'ЗЕЛЁНЫЙ', category: 'colors' },
			{ text: 'ЖЁЛТЫЙ', category: 'colors' },
			{ text: 'БЕЛЫЙ', category: 'colors' },
			{ text: 'РАДОСТЬ', category: 'emotions' },
			{ text: 'ГРУСТЬ', category: 'emotions' },
			{ text: 'СТРАХ', category: 'emotions' },
			{ text: 'ЗЛОСТЬ', category: 'emotions' },
			{ text: 'УДИВЛЕНИЕ', category: 'emotions' },
			// Лишние слова
			{ text: 'ЯБЛОКО', category: 'fruit' },
			{ text: 'СТОЛ', category: 'furniture' },
			{ text: 'ДОЖДЬ', category: 'weather' },
		],
	},
	{
		categories: [
			{ id: 'sports', name: 'Спорт', target: 4 },
			{ id: 'music', name: 'Музыка', target: 4 },
			{ id: 'science', name: 'Наука', target: 4 },
		],
		words: [
			{ text: 'ФУТБОЛ', category: 'sports' },
			{ text: 'ТЕННИС', category: 'sports' },
			{ text: 'ХОККЕЙ', category: 'sports' },
			{ text: 'ПЛАВАНИЕ', category: 'sports' },
			{ text: 'БОКС', category: 'sports' },
			{ text: 'ГИТАРА', category: 'music' },
			{ text: 'СКРИПКА', category: 'music' },
			{ text: 'БАРАБАН', category: 'music' },
			{ text: 'ПИАНИНО', category: 'music' },
			{ text: 'ФЛЕЙТА', category: 'music' },
			{ text: 'ФИЗИКА', category: 'science' },
			{ text: 'ХИМИЯ', category: 'science' },
			{ text: 'БИОЛОГИЯ', category: 'science' },
			{ text: 'МАТЕМАТИКА', category: 'science' },
			{ text: 'АСТРОНОМИЯ', category: 'science' },
			// Лишние слова
			{ text: 'СОБАКА', category: 'animals' },
			{ text: 'КНИГА', category: 'objects' },
			{ text: 'ЧАШКА', category: 'objects' },
		],
	},
	// НОВЫЕ НАБОРЫ
	{
		categories: [
			{ id: 'clothes', name: 'Одежда', target: 4 },
			{ id: 'furniture', name: 'Мебель', target: 4 },
			{ id: 'weather', name: 'Погода', target: 4 },
		],
		words: [
			{ text: 'КУРТКА', category: 'clothes' },
			{ text: 'ПЛАТЬЕ', category: 'clothes' },
			{ text: 'БРЮКИ', category: 'clothes' },
			{ text: 'ШАПКА', category: 'clothes' },
			{ text: 'КРОССОВКИ', category: 'clothes' },
			{ text: 'ДИВАН', category: 'furniture' },
			{ text: 'ШКАФ', category: 'furniture' },
			{ text: 'КРОВАТЬ', category: 'furniture' },
			{ text: 'СТУЛ', category: 'furniture' },
			{ text: 'КОМОД', category: 'furniture' },
			{ text: 'СОЛНЦЕ', category: 'weather' },
			{ text: 'ВЕТЕР', category: 'weather' },
			{ text: 'СНЕГ', category: 'weather' },
			{ text: 'ГРОЗА', category: 'weather' },
			{ text: 'ТУМАН', category: 'weather' },
			// Лишние слова
			{ text: 'КОФЕ', category: 'drinks' },
			{ text: 'КНИГА', category: 'objects' },
			{ text: 'МЕДВЕДЬ', category: 'animals' },
		],
	},
	{
		categories: [
			{ id: 'fruits', name: 'Фрукты', target: 4 },
			{ id: 'vegetables', name: 'Овощи', target: 4 },
			{ id: 'berries', name: 'Ягоды', target: 4 },
		],
		words: [
			{ text: 'ЯБЛОКО', category: 'fruits' },
			{ text: 'БАНАН', category: 'fruits' },
			{ text: 'АПЕЛЬСИН', category: 'fruits' },
			{ text: 'ГРУША', category: 'fruits' },
			{ text: 'МАНГО', category: 'fruits' },
			{ text: 'МОРКОВЬ', category: 'vegetables' },
			{ text: 'ОГУРЕЦ', category: 'vegetables' },
			{ text: 'ПОМИДОР', category: 'vegetables' },
			{ text: 'КАПУСТА', category: 'vegetables' },
			{ text: 'КАРТОФЕЛЬ', category: 'vegetables' },
			{ text: 'КЛУБНИКА', category: 'berries' },
			{ text: 'МАЛИНА', category: 'berries' },
			{ text: 'ЧЕРНИКА', category: 'berries' },
			{ text: 'ВИШНЯ', category: 'berries' },
			{ text: 'СМОРОДИНА', category: 'berries' },
			// Лишние слова
			{ text: 'ХЛЕБ', category: 'food' },
			{ text: 'МОЛОКО', category: 'drinks' },
			{ text: 'КАСТРЮЛЯ', category: 'kitchen' },
		],
	},
	{
		categories: [
			{ id: 'buildings', name: 'Здания', target: 4 },
			{ id: 'nature', name: 'Природа', target: 4 },
			{ id: 'tools', name: 'Инструменты', target: 4 },
		],
		words: [
			{ text: 'ДОМ', category: 'buildings' },
			{ text: 'ШКОЛА', category: 'buildings' },
			{ text: 'БОЛЬНИЦА', category: 'buildings' },
			{ text: 'МАГАЗИН', category: 'buildings' },
			{ text: 'ТЕАТР', category: 'buildings' },
			{ text: 'ГОРА', category: 'nature' },
			{ text: 'ОЗЕРО', category: 'nature' },
			{ text: 'ЛЕС', category: 'nature' },
			{ text: 'РЕКА', category: 'nature' },
			{ text: 'ПОЛЕ', category: 'nature' },
			{ text: 'МОЛОТОК', category: 'tools' },
			{ text: 'ПИЛА', category: 'tools' },
			{ text: 'ДРЕЛЬ', category: 'tools' },
			{ text: 'ОТВЁРТКА', category: 'tools' },
			{ text: 'КЛЮЧ', category: 'tools' },
			// Лишние слова
			{ text: 'КОШКА', category: 'animals' },
			{ text: 'КОМПЬЮТЕР', category: 'technology' },
			{ text: 'ГИТАРА', category: 'music' },
		],
	},
];

// Названия уровней
const levelNames = [
	'Найди пары',
	'Распредели слова',
	'Найди лишнее',
	'Лови слова',
];

// Настройки сложности для каждого уровня
const difficultySettings = {
	1: {
		timeLimit: 90, // секунды
		questionsPerLevel: 3,
		pointsPerCorrect: 10,
		penalty: -2,
	},
	2: {
		timeLimit: 150,
		questionsPerLevel: 2,
		pointsPerCorrect: 15,
		penalty: -3,
	},
	3: {
		timeLimit: 60,
		questionsPerLevel: 2,
		pointsPerCorrect: 20,
		penalty: -5,
	},
	4: {
		timeLimit: 90,
		questionsPerLevel: 1, // 1 раунд с падающими словами
		pointsPerCorrect: 15,
		penalty: -5,
		maxMissed: 5, // Максимум пропущенных слов
		spawnInterval: 2500, // Интервал появления слов (мс)
		targetFallSeconds: 10, // Время падения слова (сек)
		skipReward: 30, // Бонус за "лишние" слова
	},
};
