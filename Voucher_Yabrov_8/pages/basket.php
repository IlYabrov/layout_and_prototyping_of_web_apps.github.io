<?php
session_start();

require __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

$isLoggedIn = false;
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === 'true') {
    $isLoggedIn = true;
} elseif (isset($_COOKIE['admin_logged_in']) && $_COOKIE['admin_logged_in'] === 'true') {
    $isLoggedIn = true;
    $_SESSION['admin_logged_in'] = 'true';
}

if (!$isLoggedIn) {
    header('Location: ../index.php');
    exit;
}

if (!isset($_SESSION['order']) || !isset($_SESSION['bill'])) {
    header('Location: order.php');
    exit;
}

if (!function_exists('h')) {
    function h($value)
    {
        return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('buildMailText')) {
    function buildMailText(array $order, array $bill, string $service_type, string $car_name, array $selectedPrepNames, int $res): string
    {
        $lines = [];
        $lines[] = 'Новый заказ (Автосалон)';
        $lines[] = 'Имя: ' . ($order['name'] ?? '');
        $lines[] = 'Телефон: ' . ($order['phone'] ?? '');
        $lines[] = 'Почта: ' . ($order['email'] ?? '');
        $lines[] = 'Тип услуги: ' . $service_type;
        $lines[] = 'Марка машины: ' . $car_name;
        if ($service_type === 'прокат' || $service_type === 'лизинг') {
            $lines[] = 'Количество дней: ' . (int)($bill['days'] ?? 0);
        } else {
            $lines[] = 'Ускоренное оформление: ' . (!empty($bill['uskor']) ? 'да' : 'нет');
        }
        $lines[] = 'Доп. опции: ' . (!empty($order['options']) ? implode(', ', $order['options']) : 'нет');
        $lines[] = 'Предварительная подготовка: ' . (!empty($selectedPrepNames) ? implode(', ', $selectedPrepNames) : 'нет');
        $lines[] = 'Итоговая сумма: ' . $res . ' руб.';

        return implode("\r\n", $lines);
    }
}

if (!function_exists('buildSpreadsheet')) {
    function buildSpreadsheet(
        array $order,
        array $bill,
        string $service_type,
        string $car_name,
        int $res,
        array $services,
        array $cars,
        array $preparation,
        array $additionalOptions,
        array $prep_keys,
        string $templatePath
    ) {
        $spreadsheet = IOFactory::load($templatePath);
        $sheet = $spreadsheet->getActiveSheet();

        $invoice_number = rand(1000, 9999);
        $service_codes = [
            'прокат' => 'A1',
            'продажа' => 'A2',
            'лизинг' => 'A3'
        ];

        $daysValue = ($service_type === 'продажа') ? '' : (int)($bill['days'] ?? 0);
        $leaseRentTotal = ($service_type === 'прокат' || $service_type === 'лизинг')
            ? ((int)($services[$service_type] ?? 0) * (int)($bill['days'] ?? 0))
            : 0;

        $sheet->setCellValue('A3', 'ООО "Смышленный перекуп"');
        $sheet->setCellValue('F6', $invoice_number);

        $sheet->setCellValue('C8', $order['name'] ?? '');
        $phone = (string)($order['phone'] ?? '');
        $sheet->setCellValueExplicit('C9', $phone, DataType::TYPE_STRING);
        $sheet->setCellValue('C10', $order['email'] ?? '');
        $sheet->setCellValue('C11', $service_type);
        $sheet->setCellValue('B31', date('d.m.Y'));

        // Линия для подписи менеджера и подпись под ней
        $sheet->setCellValue('F31', '');
        $sheet->setCellValue('G31', '');
        $sheet->getStyle('F31:G31')->getBorders()->getBottom()->setBorderStyle(
            Border::BORDER_THIN
        );
        $sheet->mergeCells('F32:G32');
        $sheet->setCellValue('F32', '(подпись менеджера)');
        $sheet->getStyle('F32:G32')->getFont()->setSize(8);
        $sheet->getStyle('F32:G32')->getAlignment()->setHorizontal(
            Alignment::HORIZONTAL_CENTER
        );

        $sheet->setCellValue('H8', $services[$service_type]);
        $sheet->setCellValue('H9', $car_name);
        $sheet->setCellValue('H10', $daysValue);
        $sheet->setCellValue('G13', $leaseRentTotal);

        $sheet->setCellValue('D14', $cars[$service_type][$car_name]);
        $sheet->setCellValue('D15', $service_codes[$service_type]);

        $prep_list = array_keys($preparation[$service_type]);
        for ($i = 0; $i < 3; $i++) {
            $name = $prep_list[$i];
            $price = !empty($bill[$prep_keys[$i]]) ? $preparation[$service_type][$name] : 0;
            $row = 16 + $i;
            $sheet->setCellValue('B' . $row, $name);
            $sheet->setCellValue('D' . $row, $price);
        }

        $all_options = array_keys($additionalOptions);
        $selectedOptions = $order['options'] ?? [];
        for ($i = 0; $i < 3; $i++) {
            $name = $all_options[$i];
            $price = in_array($name, $selectedOptions, true) ? $additionalOptions[$name] : 0;
            $row = 21 + $i;
            $sheet->setCellValue('B' . $row, $name);
            $sheet->setCellValue('D' . $row, $price);
        }

        $sheet->setCellValue('D27', $res);

        return $spreadsheet;
    }
}

if (!function_exists('buildOutputFileName')) {
    function buildOutputFileName(array $order, string $storagePath): string
    {
        $name = trim((string)($order['name'] ?? ''));
        $parts = preg_split('/\s+/u', $name);
        $surname = $parts[0] ?? 'client';
        $safeSurname = preg_replace('/[^a-zA-Zа-яА-Я0-9]/u', '_', $surname);
        $baseName = $safeSurname . '_' . date('d-m-Y');
        $filename = $baseName . '.xlsx';
        $counter = 1;

        while (file_exists($storagePath . '/' . $filename)) {
            $filename = $baseName . '_' . $counter . '.xlsx';
            $counter++;
        }

        return $filename;
    }
}

if (!function_exists('calculateOrderTotal')) {
    function calculateOrderTotal(
        string $service_type,
        array $order,
        array $bill,
        array $services,
        array $cars,
        array $preparation,
        array $additionalOptions,
        array $prep_keys
    ): array {
        $result = [
            'car_name' => '',
            'selectedPrepNames' => [],
            'total' => 0,
            'days' => 0,
            'leaseRentTotal' => 0,
        ];

        if ($service_type === '' || !isset($services[$service_type], $cars[$service_type], $preparation[$service_type])) {
            return $result;
        }

        $basePrice = (int)$services[$service_type];
        $carKeys = array_keys($cars[$service_type]);
        $carIndex = isset($bill['car']) ? (int)$bill['car'] : 0;
        if (!isset($carKeys[$carIndex])) {
            $carIndex = 0;
        }

        $carName = $carKeys[$carIndex];
        $carPrice = (int)$cars[$service_type][$carName];

        $optionsTotal = 0;
        foreach (($order['options'] ?? []) as $opt) {
            if (isset($additionalOptions[$opt])) {
                $optionsTotal += (int)$additionalOptions[$opt];
            }
        }

        $prepTotal = 0;
        $selectedPrepNames = [];
        $prepList = array_keys($preparation[$service_type]);
        for ($i = 0; $i < 3; $i++) {
            if (!empty($bill[$prep_keys[$i]]) && isset($prepList[$i])) {
                $name = $prepList[$i];
                $selectedPrepNames[] = $name;
                $prepTotal += (int)$preparation[$service_type][$name];
            }
        }

        $days = ($service_type === 'продажа') ? 0 : (int)($bill['days'] ?? 0);
        $leaseRentTotal = ($service_type === 'прокат' || $service_type === 'лизинг') ? $basePrice * $days : 0;

        $total = ($service_type === 'продажа')
            ? ($basePrice + $carPrice + $optionsTotal + $prepTotal)
            : ($leaseRentTotal + $carPrice + $optionsTotal + $prepTotal);

        $result['car_name'] = $carName;
        $result['selectedPrepNames'] = $selectedPrepNames;
        $result['total'] = $total;
        $result['days'] = $days;
        $result['leaseRentTotal'] = $leaseRentTotal;

        return $result;
    }
}

$order = $_SESSION['order'] ?? [];
$bill = $_SESSION['bill'] ?? [];
$service_type = $order['service_type'] ?? '';

$services = ['прокат' => 100, 'продажа' => 500, 'лизинг' => 2100];
$additionalOptions = ['кожаный салон' => 50, 'подогрев сидений' => 30, 'люк' => 100];

$cars = [
    'прокат' => ['Peugeot' => 200, 'Lada Priora' => 100, 'Nissan' => 300],
    'продажа' => ['Citroen' => 500, 'Skoda' => 300, 'Lexus' => 800],
    'лизинг' => ['Kia' => 50, 'Honda' => 100, 'Mazda' => 80]
];

$preparation = [
    'прокат' => ['бензин' => 50, 'шины' => 100, 'омыватель' => 200],
    'продажа' => ['полировка' => 100, 'чистка салона' => 50, 'ТО' => 200],
    'лизинг' => ['бензин' => 50, 'чистка салона' => 200, 'чистка двигателя' => 100]
];

$prep_keys = ['prep0', 'prep1', 'prep2'];

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

$result_msg = "";


if (isset($_POST['write'])) {
    $templatePath = __DIR__ . '/../templates/template.xlsx';
    $storagePath = __DIR__ . '/../storage';

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

        $writer = new Xlsx($spreadsheet);
        $writer->save($fullPath);

        $result_msg = 'Файл успешно записан: storage/' . $filename;
    } catch (Throwable $e) {
        $result_msg = 'Ошибка записи файла: ' . $e->getMessage();
    }
}

if (isset($_POST['mail'])) {
    $to = trim((string)($order['email'] ?? ''));
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        $result_msg = 'Некорректный e-mail для отправки письма.';
    } else {
        $subject = 'Новый заказ: Автосалон';
        $message = buildMailText($order, $bill, $service_type, $car_name, $selectedPrepNames, $res);
        $headers = "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "From: no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n";

        $mailSent = @mail($to, $subject, $message, $headers);
        $result_msg = $mailSent
            ? 'Письмо успешно отправлено.'
            : 'Ошибка отправки письма. Проверьте настройки почты на сервере/хостинге.';
    }
}
?>
<html>
<head>
<title>Работа</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<link href="../css/style.css" rel="stylesheet" type="text/css">
</head>

<body topmargin="0" bottommargin="0" rightmargin="0" leftmargin="0" background="../images/back_main.gif">

<table cellpadding="0" cellspacing="0" border="0" align="center" width="583" height="614">

<tr>
<td valign="top" width="583" height="208" background="../images/row1.gif">

<div style="margin-left:88px; margin-top:57px ">
<img src="../images/w1.gif">
</div>

<div style="margin-left:50px; margin-top:69px ">
<a href="../index.php">Главная<img src="../images/m1.gif" border="0"></a>
<img src="../images/spacer.gif" width="20" height="10">
<a href="order.php">Заказ<img src="../images/m2.gif" border="0"></a>
<img src="../images/spacer.gif" width="5" height="10">
<a href="basket.php">Корзина<img src="../images/m3.gif" border="0"></a>
<img src="../images/spacer.gif" width="5" height="10">
<a href="index-3.php">О компании<img src="../images/m4.gif" border="0"></a>
<img src="../images/spacer.gif" width="5" height="10">
<a href="index-4.php">Контакты<img src="../images/m5.gif" border="0"></a>
</div>

<div style="margin-left:400px; margin-top:10px ">
<?php if ($isLoggedIn) echo "Вы зашли как admin"; ?>
</div>

</td>
</tr>

<tr>
<td valign="top" width="583" height="338" bgcolor="#FFFFFF">

<table cellpadding="0" cellspacing="0" border="0">
<tr>

<td valign="top" height="338" width="42"></td>

<td valign="top" height="338" width="492">

<table cellpadding="0" cellspacing="0" border="0">

<tr>
<td width="492" valign="top" height="106">

<div style="margin-left:1px; margin-top:2px; margin-right:10px "><br>

<div style="margin-left:5px ">
<img src="../images/1_p1.gif" align="left">
</div>

<div style="margin-left:95px ">
<font class="title">Корзина</font><br>
</div>

</div>

</td>
</tr>

<tr>
<td width="492" valign="top" height="232">

<table cellpadding="0" cellspacing="0" border="0">
<tr>

<td valign="top" height="232" width="248">

<div style="margin-left:6px; margin-top:2px;">
<img src="../images/hl.gif">
</div>

<div style="margin-left:6px; margin-top:7px;">
<img src="../images/1_w2.gif">
</div>

<div style="margin-top:10px; margin-left:6px">

<h4>Информация о заказе</h4>
<?php
$img = '';

if ($service_type == 'прокат') {
    $img = '../images/rental.jpg';
} elseif ($service_type == 'продажа') {
    $img = '../images/sale.jpg';
} elseif ($service_type == 'лизинг') {
    $img = '../images/leasing.jpg';
}
?>

<?php if ($img): ?>
<div style="margin-bottom:10px;">
    <img src="<?php echo $img; ?>" width="150">
</div>
<?php endif; ?>

<p><strong>Имя:</strong> <?php echo h($order['name'] ?? ''); ?></p>
<p><strong>Телефон:</strong> <?php echo h($order['phone'] ?? ''); ?></p>
<p><strong>E-mail:</strong> <?php echo h($order['email'] ?? ''); ?></p>
<p><strong>Тип услуги:</strong> <?php echo h($service_type); ?></p>
<?php if ($service_type == 'прокат' || $service_type == 'лизинг'): ?>
<p><strong>Количество дней:</strong> <?php echo (int)($bill['days'] ?? 0); ?></p>
<?php endif; ?>
<p><strong>Марка машины:</strong> <?php echo h($car_name); ?></p>
<p><strong>Дополнительные опции:</strong> <?php echo h(!empty($order['options']) ? implode(', ', $order['options']) : 'нет'); ?></p>

</div>

</td>

<td valign="top" height="215" width="1" background="../images/tal.gif" style="background-repeat:repeat-y"></td>

<td valign="top" height="215" width="243">

<div style="margin-left:22px; margin-top:2px;">
<img src="../images/hl.gif">
</div>

<div style="margin-left:22px; margin-top:7px;">
<img src="../images/1_w2.gif">
</div>

<div style="margin-left:22px; margin-top:13px;">

<h4>Итоговая сумма</h4>
<?php echo $res; ?> руб.

</div>

<div style="margin-left:22px; margin-top:16px;">
<img src="../images/hl.gif">
</div>

<div style="margin-left:22px; margin-top:7px;">
<img src="../images/1_w4.gif">
</div>

<div style="margin-left:22px; margin-top:9px;">

<form method="POST">
<input type="submit" name="mail" value="Отправить на почту"/><br><br>
<input type="submit" name="write" value="Записать в файл"/>
</form>

<?php if ($result_msg !== ''): ?>
<p><?php echo h($result_msg); ?></p>
<?php endif; ?>

</div>

</td>

</tr>
</table>

</td>
</tr>

</table>

</td>

<td valign="top" height="338" width="49"></td>

</tr>
</table>

</td>
</tr>

<tr>
<td valign="top" width="583" height="68" background="../images/row3.gif">

<div style="margin-left:51px; margin-top:31px ">

<a href="#"><img src="../images/p1.gif" border="0"></a>
<img src="../images/spacer.gif" width="26" height="9">
<a href="#"><img src="../images/p2.gif" border="0"></a>
<img src="../images/spacer.gif" width="30" height="9">
<a href="#"><img src="../images/p3.gif" border="0"></a>
<img src="../images/spacer.gif" width="149" height="9">

<?php if ($isLoggedIn): ?>
<input value="Выйти" type="button" onclick="location.href='../index.php?logout'"/>
<?php endif; ?>

</div>

</td>
</tr>

</table>

</body>
</html>