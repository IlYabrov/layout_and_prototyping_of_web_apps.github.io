<?php

require_once __DIR__ . '/../auth.php';

$error = '';

if (isset($_GET['logout'])) {
    logoutAdmin();
    header('Location: index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_submit'])) {
    $login = trim($_POST['login'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($login === 'admin' && $password === '123') {
        setcookie('admin_logged_in', 'true', time() + 3600, '/');
        $_SESSION['admin_logged_in'] = 'true';
        header('Location: pages/order.php');
        exit;
    }

    $error = 'Неверный логин или пароль.';
}

$isLoggedIn = isAdminLoggedIn();

