<?php

if (!function_exists('buildMailText')) {
    function buildMailText(array $order, array $bill, $service_type, $car_name, array $selectedPrepNames, $res)
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

if (!function_exists('sendOrderMail')) {
    function sendOrderMail(array $order, array $bill, $service_type, $car_name, array $selectedPrepNames, $res)
    {
        $to = trim((string)($order['email'] ?? ''));
        if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            return 'Некорректный e-mail для отправки письма.';
        }

        $subject = 'Новый заказ: Автосалон';
        $message = buildMailText($order, $bill, $service_type, $car_name, $selectedPrepNames, $res);
        $headers = "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= 'From: no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n";

        $mailSent = @mail($to, $subject, $message, $headers);

        return $mailSent
            ? 'Письмо успешно отправлено.'
            : 'Ошибка отправки письма. Проверьте настройки почты на сервере/хостинге.';
    }
}

