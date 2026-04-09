<?php
session_start();

$formError = '';

$isLoggedIn = false;
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === 'true') {
    $isLoggedIn = true;
} elseif (isset($_COOKIE['admin_logged_in']) && $_COOKIE['admin_logged_in'] === 'true') {
    $isLoggedIn = true;
    $_SESSION['admin_logged_in'] = 'true';
}

if (!$isLoggedIn) {
    $type = "";
} else {

    if (!isset($_SESSION['order'])) {
        header('Location: order.php');
        exit;
    }
    
    $type = $_SESSION['order']['service_type'];
    
    $cars_data = [
        'прокат' => ['Peugeot (+200)', 'Lada Priora (+100)', 'Nissan (+300)'],
        'продажа' => ['Citroen (+500)', 'Skoda (+300)', 'Lexus (+800)'],
        'лизинг' => ['Kia (+50)', 'Honda (+100)', 'Mazda (+80)']
    ];
    
    $prep_data = [
        'прокат' => ['бензин(+50)', 'шины(+100)', 'омыватель(+200)'],
        'продажа' => ['полировка(+100)', 'чистка салона(+50)', 'ТО(+200)'],
        'лизинг' => ['бензин(+50)', 'чистка салона(+200)', 'чистка двигателя(+100)']
    ];
    
    $service_codes = ['прокат' => 'А1', 'продажа' => 'А2', 'лизинг' => 'А3'];
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit'])) {
        if (!isset($_POST['car']) || !in_array((string)$_POST['car'], ['0', '1', '2'], true)) {
            $formError = 'Выберите марку машины.';
        }

        $daysInput = isset($_POST['days']) ? trim($_POST['days']) : '';
        $days = 0;
        if ($type !== 'продажа') {
            if ($daysInput === '' || !ctype_digit($daysInput) || (int)$daysInput <= 0) {
                $formError = 'Введите корректное количество дней (целое число больше 0).';
            } else {
                $days = (int)$daysInput;
            }
        }

        if ($formError === '') {
            $_SESSION['bill'] = [
                'car' => $_POST['car'],
                'prep0' => isset($_POST['prep0']),
                'prep1' => isset($_POST['prep1']),
                'prep2' => isset($_POST['prep2']),
                'days' => $type === 'продажа' ? 0 : $days,
                'uskor' => isset($_POST['uskor'])
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
    $days = isset($_POST['days']) ? trim($_POST['days']) : (isset($_SESSION['bill']['days']) ? (string)$_SESSION['bill']['days'] : "");
    $selectedUskor = isset($_POST['submit']) ? isset($_POST['uskor']) : !empty($_SESSION['bill']['uskor']);
}
?>
<html>
<head>
    <title>Работа</title>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
    <link href="../css/style.css" rel="stylesheet" type="text/css">
</head>

<body topmargin="0" bottommargin="0" rightmargin="0" leftmargin="0" background="../images/back_main.gif">
<form method="POST">
    <table cellpadding="0" cellspacing="0" border="0" align="center" width="583" height="614">
        <tr>
            <td valign="top" width="583" height="208" background="../images/row1.gif">
                <div style="margin-left:88px; margin-top:57px "><img src="../images/w1.gif"></div>

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
                <div style="margin-left:400px; margin-top:10px "></div>
            </td>
        </tr>
        <tr>
            <td valign="top" width="583" height="338" bgcolor="#FFFFFF">
                <?php
                if ($isLoggedIn && isset($_SESSION['order'])) {
                    ?>
                    <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td valign="top" height="338" width="42"> </td>
                            <td valign="top" height="338" width="492">
                                <table cellpadding="0" cellspacing="0" border="0">
                                     <tr>
                                        <td width="492" valign="top" height="106">
                                            <div style="margin-left:1px; margin-top:2px; margin-right:10px "><br>
                                                <div style="margin-left:5px "><img src="../images/1_p1.gif" align="left"></div>
                                                <div style="margin-left:95px "><font class="title">Автосалон</font></div>
                                            </div>
                                            <div style=" margin-left:270px ">
                                                <h4>Марка машины</h4>
                                                <p><input name="car" type="radio" value="0" <?php if ($selectedCar === '0') echo 'checked'; ?> /> <?php echo $cars_data[$type][0]; ?></p>
                                                <p><input name="car" type="radio" value="1" <?php if ($selectedCar === '1') echo 'checked'; ?> /> <?php echo $cars_data[$type][1]; ?></p>
                                                <p><input name="car" type="radio" value="2" <?php if ($selectedCar === '2') echo 'checked'; ?> /> <?php echo $cars_data[$type][2]; ?></p>
                                            </div>
                                        </td>
                                     </tr>
                                     <tr>
                                        <td width="492" valign="top" height="232">
                                            <table cellpadding="0" cellspacing="0" border="0">
                                                 <tr>
                                                    <td valign="top" height="232" width="248">
                                                        <div style="margin-left:6px; margin-top:2px; "><img src="../images/hl.gif"></div>
                                                        <div style="margin-left:6px; margin-top:7px; "><img src="../images/1_w2.gif"></div>
                                                        <div style="margin-left:6px; margin-top:11px; margin-right:0px ">
                                                            <font class="title"></font>
                                                        </div>
                                                        <div style="margin-top:10px; margin-left:6px ">
                                                            <h4><?php echo $service_codes[$type]; ?></h4>
                                                            <p><input name="prep0" type="checkbox" value="0" <?php if ($selectedPrep0) echo 'checked'; ?>/> <?php echo $prep_data[$type][0]; ?></p>
                                                            <p><input name="prep1" type="checkbox" value="1" <?php if ($selectedPrep1) echo 'checked'; ?>/> <?php echo $prep_data[$type][1]; ?></p>
                                                            <p><input name="prep2" type="checkbox" value="2" <?php if ($selectedPrep2) echo 'checked'; ?>/> <?php echo $prep_data[$type][2]; ?></p>
                                                        </div>
                                                     </td>
                                                    <td valign="top" height="215" width="1" background="../images/tal.gif" style="background-repeat:repeat-y"> </td>
                                                    <td valign="top" height="215" width="243">
                                                        <div style="margin-left:22px; margin-top:2px; "><img src="../images/hl.gif"></div>
                                                        <div style="margin-left:22px; margin-top:7px; "><img src="../images/1_w2.gif"></div>
                                                        <div style="margin-left:22px; margin-top:13px; ">
                                                            <div>
                                                                <?php if ($type != 'продажа') { ?>
                                                                    Количество дней: <input type="text" name="days" value="<?php echo htmlspecialchars($days, ENT_QUOTES, 'UTF-8'); ?>">
                                                                <?php } else { ?>
                                                                    <input type="checkbox" name="uskor" <?php if ($selectedUskor) echo 'checked'; ?>> Ускоренное оформление
                                                                <?php } ?>
                                                            </div>
                                                            <?php if ($formError !== ''): ?>
                                                                <p style="color:#7C0000;"><?php echo htmlspecialchars($formError, ENT_QUOTES, 'UTF-8'); ?></p>
                                                            <?php endif; ?>
                                                        </div>
                                                        <div style="margin-left:22px; margin-top:16px; "><img src="../images/hl.gif"></div>
                                                        <div style="margin-left:22px; margin-top:7px; "><img src="../images/1_w4.gif"></div>
                                                        <div style="margin-left:22px; margin-top:9px; ">
                                                            <img src="../images/1_p3.gif" align="left">

                                                            <div style="margin-left:67px; margin-top:0px; margin-right:0px ">
                                                                <font class="title"></font><br>
                                                                <div style="margin-left:0px; margin-top:7px; margin-right:10px ">
                                                                    <img src="../images/pointer.gif"><a href="#"><img src="../images/read_more.gif" border="0"></a>
                                                                </div>
                                                            </div>
                                                            <div style="margin-top: 50px">
                                                                <input value="Вернуться назад" type="button" onclick="location.href='order.php'"/>
                                                                <input type="submit" name="submit" value="Далее"/>
                                                            </div>
                                                        </div>
                                                    </td>
                                                 </tr>
                                            </table>
                                        </td>
                                     </td>
                                 </table>
                             </td>
                            <td valign="top" height="338" width="49"> </td>
                         </tr>
                    </table>
                <?php } ?>
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
                        <a><input value="Выйти" type="button" onclick="location.href='../index.php?logout'"/></a>
                    <?php else: ?>
                        <a href="index-5.php"><img src="../images/copyright.gif" border="0"></a>
                    <?php endif; ?>
                </div>
            </td>
        </tr>
    </table>
</form>
</body>
</html>