<?php
// Значения по умолчанию для статического анализа IDE; контроллер их перезапишет.
$isLoggedIn = false;
$name = '';
$email = '';
$phone = '';
$type = 'прокат';
$salon = false;
$podogrev = false;
$luk = false;

require __DIR__ . '/../includes/controllers/order.php';
?>

<html lang="ru">
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

                <?php if ($isLoggedIn): ?>

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
                                                    <font class="title">Автосалон</font><br>

                                                    <div style="margin-left:200px">
                                                        <h4>Тип услуги</h4>

                                                        <select name="type">
                                                            <option value="прокат" <?php if ($type == "прокат") echo "selected"; ?>>
                                                                прокат
                                                            </option>
                                                            <option value="продажа" <?php if ($type == "продажа") echo "selected"; ?>>
                                                                продажа
                                                            </option>
                                                            <option value="лизинг" <?php if ($type == "лизинг") echo "selected"; ?>>
                                                                лизинг
                                                            </option>
                                                        </select>

                                                    </div>

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
                                                            <h4>Дополнительные опции</h4>

                                                            <p><input type="checkbox"
                                                                      name="salon" <?php if ($salon) echo "checked"; ?>>
                                                                кожаный салон</p>
                                                            <p><input type="checkbox"
                                                                      name="podogrev" <?php if ($podogrev) echo "checked"; ?>>
                                                                подогрев сидений</p>
                                                            <p><input type="checkbox"
                                                                      name="luk" <?php if ($luk) echo "checked"; ?>> люк
                                                            </p>

                                                        </div>

                                                    </td>

                                                    <td valign="top" height="215" width="1"
                                                        background="../images/tal.gif"
                                                        style="background-repeat:repeat-y"></td>

                                                    <td valign="top" height="215" width="243">

                                                        <div style="margin-left:22px; margin-top:2px;">
                                                            <img src="../images/hl.gif">
                                                        </div>

                                                        <div style="margin-left:22px; margin-top:7px;">
                                                            <img src="../images/1_w2.gif">
                                                        </div>

                                                        <div style="margin-left:22px; margin-top:13px;">
                                                            <h4>Контактные данные</h4>

                                                            Имя: <input type="text" name="name" style="width: 200px;"
                                                                        value="<?php echo $name ?>"><br><br>
                                                            Телефон: <input type="text" name="phone" style="width: 200px;"
                                                                            value="<?php echo $phone ?>"><br><br>
                                                            Почта: <input type="text" name="email" style="width: 200px;"
                                                                          value="<?php echo $email ?>"><br><br>

                                                        </div>

                                                        <div style="margin-left:22px; margin-top:16px;">
                                                            <img src="../images/hl.gif">
                                                        </div>

                                                        <div style="margin-left:22px; margin-top:7px;">
                                                            <img src="../images/1_w4.gif">
                                                        </div>

                                                        <div style="margin-left:22px; margin-top:9px;">
                                                            <input type="submit" value="Далее">
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

                <?php endif; ?>

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

</form>

</body>
</html>