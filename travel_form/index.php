<?php
// Данные о городах
$cities = [
    'yaroslavl' => ['name' => 'Ярославль', 'image' => 'images/yaroslavl.png'],
    'arkhangelsk' => ['name' => 'Архангельск', 'image' => 'images/arkhangelsk.png'],
    'kaluga' => ['name' => 'Калуга', 'image' => 'images/kaluga.png'],
    'ryazan' => ['name' => 'Рязань', 'image' => 'images/ryazan.png']
];

// Способы оплаты
$paymentMethods = [
    'cash' => 'наличные',
    'card' => 'карта',
    'transfer' => 'перевод'
];

// Обработка формы
$result = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['city'])) {
    $name = htmlspecialchars($_POST['name'] ?? '');
    $city = $_POST['city'] ?? '';
    $dateFrom = $_POST['date_from'] ?? '';
    $dateTo = $_POST['date_to'] ?? '';
    $payment = $_POST['payment'] ?? 'card';
    $roundTrip = isset($_POST['round_trip']);
    $businessClass = isset($_POST['business_class']);

    if (isset($cities[$city])) {
        $result = [
            'name' => $name,
            'city' => $cities[$city]['name'],
            'image' => $cities[$city]['image'],
            'date_from' => $dateFrom ? date('d.m.y', strtotime($dateFrom)) : '',
            'date_to' => ($roundTrip && $dateTo) ? date('d.m.y', strtotime($dateTo)) : '',
            'payment' => $paymentMethods[$payment] ?? 'карта',
            'round_trip' => $roundTrip,
            'business_class' => $businessClass
        ];
    }
}

// Сохраняем значения полей для отображения после отправки
$savedName = $_POST['name'] ?? '';
$savedDateFrom = $_POST['date_from'] ?? '';
$savedDateTo = $_POST['date_to'] ?? '';
$savedPayment = $_POST['payment'] ?? 'card';
$savedRoundTrip = isset($_POST['round_trip']) || !isset($_POST['city']);
$savedBusinessClass = isset($_POST['business_class']);
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Форма бронирования билетов</title>
    <link rel="stylesheet" href="travel-form.css">
</head>
<body>
    <a href="index.php">Главная</a>
    <form method="POST" action="">
        <div class="container">
            <div class="form-section">
                <!-- Кнопки городов -->
                <div class="cities-section">
                    <?php foreach ($cities as $key => $city): ?>
                        <button type="submit" name="city" value="<?= $key ?>" class="city-btn">
                            <?= $city['name'] ?>
                        </button>
                    <?php endforeach; ?>
                </div>

                <!-- Поля даты и имени -->
                <div class="top-row">
                    <div class="date-inputs">
                        <label>
                            <span class="date-label">Туда</span>
                            <input type="date" name="date_from" value="<?= htmlspecialchars($savedDateFrom) ?>">
                        </label>
                        <label>
                            <span class="date-label">Обратно</span>
                            <input type="date" name="date_to" value="<?= htmlspecialchars($savedDateTo) ?>">
                        </label>
                    </div>

                    <div class="name-input">
                        <label for="name-input">Имя</label>
                        <input type="text" id="name-input" name="name" value="<?= htmlspecialchars($savedName) ?>" placeholder="Введите имя">
                    </div>
                </div>

                <!-- Радиокнопки и флажки -->
                <div class="options-row">
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="payment" value="cash" <?= $savedPayment === 'cash' ? 'checked' : '' ?>>
                            Наличные
                        </label>
                        <label>
                            <input type="radio" name="payment" value="card" <?= $savedPayment === 'card' ? 'checked' : '' ?>>
                            Карта
                        </label>
                        <label>
                            <input type="radio" name="payment" value="transfer" <?= $savedPayment === 'transfer' ? 'checked' : '' ?>>
                            Перевод
                        </label>
                    </div>

                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" name="round_trip" <?= $savedRoundTrip ? 'checked' : '' ?>>
                            Туда и обратно
                        </label>
                        <label>
                            <input type="checkbox" name="business_class" <?= $savedBusinessClass ? 'checked' : '' ?>>
                            Бизнес-класс
                        </label>
                    </div>
                </div>

                <!-- Блок результата -->
                <div class="result-section">
                    <div class="result-text">
                        <?php if ($result): ?>
                            <p class="result-line"><?= $result['name'] ?>, Вы отправляетесь</p>
                            <p class="result-line">в город <?= $result['city'] ?></p>
                            <p class="result-line">Билеты: туда <?= $result['date_from'] ?></p>
                            <?php if ($result['round_trip'] && $result['date_to']): ?>
                                <p class="result-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;обратно <?= $result['date_to'] ?></p>
                            <?php endif; ?>
                            <p class="result-line">Тип оплаты: <?= $result['payment'] ?></p>
                            <?php if ($result['business_class']): ?>
                                <p class="result-line">Уровень обслуживания: бизнес-класс</p>
                            <?php else: ?>
                                <p class="result-line">Уровень обслуживания: эконом-класс</p>
                            <?php endif; ?>
                        <?php else: ?>
                            <p class="result-placeholder">Выберите город для просмотра информации о бронировании</p>
                        <?php endif; ?>
                    </div>
                    <div class="result-image">
                        <?php if ($result): ?>
                            <img src="<?= $result['image'] ?>" alt="Герб <?= $result['city'] ?>">
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </form>
</body>
</html>


