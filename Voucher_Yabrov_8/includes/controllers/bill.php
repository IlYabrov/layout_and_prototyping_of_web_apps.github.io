<?php

require_once __DIR__ . '/../auth.php';

$formError = '';
$isLoggedIn = isAdminLoggedIn();

$type = '';
$cars_data = [];
$prep_data = [];
$service_codes = [];
$selectedCar = '';
$selectedPrep0 = false;
$selectedPrep1 = false;
$selectedPrep2 = false;
$days = '';
$selectedUskor = false;

if ($isLoggedIn) {
    if (!isset($_SESSION['order'])) {
        header('Location: order.php');
        exit;
    }

    $type = $_SESSION['order']['service_type'];

    $cars_data = [
        'прокат' => ['Peugeot (+200)', 'Lada Priora (+100)', 'Nissan (+300)'],
        'продажа' => ['Citroen (+500)', 'Skoda (+300)', 'Lexus (+800)'],
        'лизинг' => ['Kia (+50)', 'Honda (+100)', 'Mazda (+80)'],
    ];

    $prep_data = [
        'прокат' => ['бензин(+50)', 'шины(+100)', 'омыватель(+200)'],
        'продажа' => ['полировка(+100)', 'чистка салона(+50)', 'ТО(+200)'],
        'лизинг' => ['бензин(+50)', 'чистка салона(+200)', 'чистка двигателя(+100)'],
    ];

    $service_codes = ['прокат' => 'А1', 'продажа' => 'А2', 'лизинг' => 'А3'];

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit'])) {
        if (!isset($_POST['car']) || !in_array((string)$_POST['car'], ['0', '1', '2'], true)) {
            $formError = 'Выберите марку машины.';
        }

        $daysInput = isset($_POST['days']) ? trim($_POST['days']) : '';
        $daysValue = 0;
        if ($type !== 'продажа') {
            if ($daysInput === '' || !ctype_digit($daysInput) || (int)$daysInput <= 0) {
                $formError = 'Введите корректное количество дней (целое число больше 0).';
            } else {
                $daysValue = (int)$daysInput;
            }
        }

        if ($formError === '') {
            $_SESSION['bill'] = [
                'car' => $_POST['car'],
                'prep0' => isset($_POST['prep0']),
                'prep1' => isset($_POST['prep1']),
                'prep2' => isset($_POST['prep2']),
                'days' => $type === 'продажа' ? 0 : $daysValue,
                'uskor' => isset($_POST['uskor']),
            ];
            header('Location: basket.php');
            exit;
        }
    }

    $selectedCar = isset($_POST['car'])
        ? (string)$_POST['car']
        : (isset($_SESSION['bill']['car']) ? (string)$_SESSION['bill']['car'] : '');
    $selectedPrep0 = isset($_POST['submit']) ? isset($_POST['prep0']) : !empty($_SESSION['bill']['prep0']);
    $selectedPrep1 = isset($_POST['submit']) ? isset($_POST['prep1']) : !empty($_SESSION['bill']['prep1']);
    $selectedPrep2 = isset($_POST['submit']) ? isset($_POST['prep2']) : !empty($_SESSION['bill']['prep2']);
    $days = isset($_POST['days']) ? trim($_POST['days']) : (isset($_SESSION['bill']['days']) ? (string)$_SESSION['bill']['days'] : '');
    $selectedUskor = isset($_POST['submit']) ? isset($_POST['uskor']) : !empty($_SESSION['bill']['uskor']);
}

