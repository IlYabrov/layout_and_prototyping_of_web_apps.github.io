<?php

require_once __DIR__ . '/../common.php';
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../../vendor/autoload.php';

requireAdmin('../index.php');

if (!isset($_SESSION['order']) || !isset($_SESSION['bill'])) {
    header('Location: order.php');
    exit;
}

require_once __DIR__ . '/../basket/config.php';
require_once __DIR__ . '/../basket/calc.php';
require_once __DIR__ . '/../basket/spreadsheet.php';
require_once __DIR__ . '/../basket/mail.php';

$basketConfig = getBasketConfig();
$services = $basketConfig['services'];
$additionalOptions = $basketConfig['additionalOptions'];
$cars = $basketConfig['cars'];
$preparation = $basketConfig['preparation'];
$prep_keys = $basketConfig['prep_keys'];

$isLoggedIn = true;
$order = $_SESSION['order'] ?? [];
$bill = $_SESSION['bill'] ?? [];
$service_type = $order['service_type'] ?? '';

$totals = calculateOrderTotal(
    $service_type,
    $order,
    $bill,
    $services,
    $cars,
    $preparation,
    $additionalOptions,
    $prep_keys
);

$res = (int)$totals['total'];
$car_name = (string)$totals['car_name'];
$selectedPrepNames = $totals['selectedPrepNames'];

$result_msg = '';

if (isset($_POST['write'])) {
    $templatePath = __DIR__ . '/../../templates/template.xlsx';
    $storagePath = __DIR__ . '/../../storage';

    try {
        if (!is_dir($storagePath) && !mkdir($storagePath, 0777, true) && !is_dir($storagePath)) {
            throw new RuntimeException('Не удалось создать папку storage.');
        }

        $spreadsheet = buildSpreadsheet(
            $order,
            $bill,
            $service_type,
            $car_name,
            $res,
            $services,
            $cars,
            $preparation,
            $additionalOptions,
            $prep_keys,
            $templatePath
        );

        $filename = buildOutputFileName($order, $storagePath);
        $fullPath = $storagePath . '/' . $filename;

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($fullPath);

        $result_msg = 'Файл успешно записан: storage/' . $filename;
    } catch (Throwable $e) {
        $result_msg = 'Ошибка записи файла: ' . $e->getMessage();
    }
}

if (isset($_POST['mail'])) {
    $result_msg = sendOrderMail($order, $bill, $service_type, $car_name, $selectedPrepNames, $res);
}

