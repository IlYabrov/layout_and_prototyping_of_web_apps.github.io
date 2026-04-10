<?php

require_once __DIR__ . '/../auth.php';

$isLoggedIn = isAdminLoggedIn();

if ($isLoggedIn && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION['order'] = [
        'service_type' => $_POST['type'],
        'name' => $_POST['name'],
        'email' => $_POST['email'],
        'phone' => $_POST['phone'],
        'options' => array_filter([
            isset($_POST['salon']) ? 'кожаный салон' : null,
            isset($_POST['podogrev']) ? 'подогрев сидений' : null,
            isset($_POST['luk']) ? 'люк' : null,
        ]),
    ];

    header('Location: bill.php');
    exit;
}

$name = $_SESSION['order']['name'] ?? '';
$email = $_SESSION['order']['email'] ?? '';
$phone = $_SESSION['order']['phone'] ?? '';
$type = $_SESSION['order']['service_type'] ?? 'прокат';
$options = $_SESSION['order']['options'] ?? [];

$salon = in_array('кожаный салон', $options, true);
$podogrev = in_array('подогрев сидений', $options, true);
$luk = in_array('люк', $options, true);

