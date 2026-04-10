<?php
// Значения по умолчанию нужны для статического анализа IDE; контроллер их перезапишет.
$isLoggedIn = false;
$service_type = '';
$car_name = '';
$res = 0;
$result_msg = '';
$order = [];
$bill = [];

require __DIR__ . '/../includes/controllers/basket.php';
?>
<html lang="ru">
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
                                                    <p><strong>Телефон:</strong> <?php echo h($order['phone'] ?? ''); ?>
                                                    </p>
                                                    <p><strong>E-mail:</strong> <?php echo h($order['email'] ?? ''); ?>
                                                    </p>
                                                    <p><strong>Тип услуги:</strong> <?php echo h($service_type); ?></p>
                                                    <?php if ($service_type == 'прокат' || $service_type == 'лизинг'): ?>
                                                        <p><strong>Количество
                                                                дней:</strong> <?php echo (int)($bill['days'] ?? 0); ?>
                                                        </p>
                                                    <?php endif; ?>
                                                    <p><strong>Марка машины:</strong> <?php echo h($car_name); ?></p>
                                                    <p><strong>Дополнительные
                                                            опции:</strong> <?php echo h(!empty($order['options']) ? implode(', ', $order['options']) : 'нет'); ?>
                                                    </p>

                                                </div>

                                            </td>

                                            <td valign="top" height="215" width="1" background="../images/tal.gif"
                                                style="background-repeat:repeat-y"></td>

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
                                                        <input type="submit" name="mail"
                                                               value="Отправить на почту"/><br><br>
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