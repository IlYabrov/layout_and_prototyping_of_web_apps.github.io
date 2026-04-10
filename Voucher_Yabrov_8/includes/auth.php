<?php

require_once __DIR__ . '/common.php';

if (!function_exists('isAdminLoggedIn')) {
    function isAdminLoggedIn() {
        if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === 'true') {
            return true;
        }

        if (isset($_COOKIE['admin_logged_in']) && $_COOKIE['admin_logged_in'] === 'true') {
            $_SESSION['admin_logged_in'] = 'true';
            return true;
        }

        return false;
    }
}

if (!function_exists('logoutAdmin')) {
    function logoutAdmin() {
        session_destroy();
        setcookie('admin_logged_in', '', time() - 3600, '/');
    }
}

if (!function_exists('requireAdmin')) {
    function requireAdmin($redirectPath) {
        if (!isAdminLoggedIn()) {
            header('Location: ' . $redirectPath);
            exit;
        }
    }
}

