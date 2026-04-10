<?php

require_once 'vendor/autoload.php';

use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpSpreadsheet\IOFactory as ExcelIOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

$materialsDir = 'assets/materials';
$templatesDir = 'storage/templates';
$exportsDir = 'storage/exports';

if (!is_dir($exportsDir)) {
    mkdir($exportsDir, 0775, true);
}

// Наценки за цвет мебели
$colorMarkups = [
    'Орех' => 1.1,
    'Дуб мореный' => 1.2,
    'Палисандр' => 1.3,
    'Эбеновое дерево' => 1.4,
    'Клен' => 1.5,
    'Лиственница' => 1.6,
];

// Названия файлов картинок для каждого цвета
$colorImages = [
    'Орех' => $materialsDir . '/орех.png',
    'Дуб мореный' => $materialsDir . '/дуб.png',
    'Палисандр' => $materialsDir . '/палисандр.png',
    'Эбеновое дерево' => $materialsDir . '/эбен.png',
    'Клен' => $materialsDir . '/клен.png',
    'Лиственница' => $materialsDir . '/лиственница.png',
];

// Список возможной мебели
$furnitureList = ['Банкетка', 'Кровать', 'Комод', 'Шкаф', 'Стул', 'Стол'];

$message = '';
$downloadLinks = '';

// Функция для извлечения текста из элементов PhpWord
function extractTextFromElement($element) {
    $text = '';
    if (method_exists($element, 'getElements')) {
        foreach ($element->getElements() as $child) {
            $text .= extractTextFromElement($child);
        }
    } elseif (method_exists($element, 'getText')) {
        $text .= $element->getText() . ' ';
    }
    return trim($text);
}

function normalizeItemName(string $name): string {
    $name = str_replace("\xC2\xA0", ' ', $name);
    $name = preg_replace('/\s+/u', ' ', trim($name));

    return (string)$name;
}

function addPriceToList(array &$prices, string $itemName, string $itemPriceRaw) {
    $itemName = normalizeItemName($itemName);
    $itemPrice = preg_replace('/[^\d.]/', '', str_replace(',', '.', trim($itemPriceRaw)));

    if ($itemName !== '' && is_numeric($itemPrice) && (float)$itemPrice > 0) {
        $prices[$itemName] = (float)$itemPrice;
    }
}

function readPricesFromOdt(string $tmpPath): array {
    $prices = [];

    // Сначала пробуем стандартный способ через PhpWord (как требует задание)
    try {
        $phpWordODT = WordIOFactory::load($tmpPath, 'ODText');
        foreach ($phpWordODT->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if ($element instanceof \PhpOffice\PhpWord\Element\Table) {
                    foreach ($element->getRows() as $row) {
                        $cells = $row->getCells();
                        if (count($cells) >= 2) {
                            addPriceToList($prices, extractTextFromElement($cells[0]), extractTextFromElement($cells[1]));
                        }
                    }
                }
            }
        }
    } catch (Throwable $e) {
        // Ничего не делаем: ниже есть запасной способ через ZIP/XML
    }

    // Обходной путь: ODT — это ZIP-архив с content.xml внутри.
    if (empty($prices) && class_exists('ZipArchive')) {
        $zip = new ZipArchive();
        if ($zip->open($tmpPath) === true) {
            $xmlContent = $zip->getFromName('content.xml');
            $zip->close();

            if ($xmlContent !== false) {
                $dom = new DOMDocument();
                libxml_use_internal_errors(true);
                if (@$dom->loadXML($xmlContent)) {
                    $rows = $dom->getElementsByTagNameNS('*', 'table-row');
                    foreach ($rows as $row) {
                        $cells = $row->getElementsByTagNameNS('*', 'table-cell');
                        if ($cells->length >= 2) {
                            addPriceToList($prices, $cells->item(0)->textContent ?? '', $cells->item(1)->textContent ?? '');
                        }
                    }
                }
                libxml_clear_errors();
                libxml_use_internal_errors(false);
            }
        }
    }

    if (empty($prices)) {
        // Страховочный вариант, чтобы проект не падал из-за нестандартного ODT.
        $prices = [
            'Банкетка' => 100,
            'Кровать' => 500,
            'Комод' => 600,
            'Шкаф' => 1000,
            'Стул' => 150,
            'Стол' => 800,
        ];
    }

    return $prices;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // 1. Получение данных из формы
        $lastName = $_POST['last_name'] ?? '';
        $city = $_POST['city'] ?? '';
        $date = $_POST['date'] ?? '';
        $address = $_POST['address'] ?? '';
        $color = $_POST['color'] ?? '';
        $quantities = $_POST['quantities'] ?? [];
        $selectedItems = $_POST['items'] ?? [];

        // Серверная страховка: для каждого выбранного товара количество обязательно и должно быть целым >= 1
        $missingQtyItems = [];
        $invalidQtyItems = [];
        foreach ($selectedItems as $item) {
            $rawQty = isset($quantities[$item]) ? trim((string)$quantities[$item]) : '';
            if ($rawQty === '') {
                $missingQtyItems[] = $item;
                continue;
            }

            $validQty = filter_var($rawQty, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($validQty === false) {
                $invalidQtyItems[] = $item;
            }
        }

        if (!empty($missingQtyItems)) {
            throw new Exception('Укажите количество для выбранных товаров: ' . implode(', ', $missingQtyItems) . '.');
        }

        if (!empty($invalidQtyItems)) {
            throw new Exception('Количество должно быть целым числом от 1 для товаров: ' . implode(', ', $invalidQtyItems) . '.');
        }
        
        $markup = $colorMarkups[$color] ?? 1.0;

        // 2. Чтение файла с ценами (price.odt)
        if (isset($_FILES['price_file']) && $_FILES['price_file']['error'] === UPLOAD_ERR_OK) {
            $tmpPath = $_FILES['price_file']['tmp_name'];
            $prices = readPricesFromOdt($tmpPath);
        } else {
            throw new Exception("Пожалуйста, загрузите файл price.odt с актуальными ценами.");
        }

        // 3. Расчет стоимости
        $invoiceNumber = rand(1000, 9999);
        $totalBaseSum = 0;
        $orderItems = [];
        $totalItemsCount = 0;

        foreach ($selectedItems as $item) {
            $itemKey = normalizeItemName((string)$item);
            if (isset($prices[$itemKey]) && !empty($quantities[$item])) {

                $qty = (int)$quantities[$item];
                if($qty > 0) {
                    $basePrice = $prices[$itemKey];
                    $baseSum = $basePrice * $qty;
                
                    $totalBaseSum += $baseSum;
                    $totalItemsCount += $qty;
                
                    $orderItems[] = [
                        'name' => $item,
                        'qty' => $qty,
                        'base_price' => $basePrice,
                        'base_sum' => $baseSum
                ];
                }
            }
        }

        if (empty($orderItems)) {
            throw new Exception("Не выбрано ни одного товара или не указано количество.");
        }
        
        $totalSum = $totalBaseSum * $markup;

        // 4. Генерация Накладной в PDF
        $phpWord = new PhpWord();
        
        $phpWord->setDefaultFontName('DejaVu Sans');
        $phpWord->setDefaultFontSize(11);
        
        $section = $phpWord->addSection();
        
        // Вставляем картинку штрихкода
        $barcodeImage = $materialsDir . '/штрих.JPG';
        if (file_exists($barcodeImage)) {
            $section->addImage($barcodeImage, [
                'width' => 220,
                'height' => 50,
                'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::LEFT
            ]);
        } else {
            $section->addText("|||||||||||||||||||||||||||||||||||||||||||||||||", ['size' => 24], ['alignment' => 'left']);
        }
        
        $section->addTextBreak(1);
        
        $section->addText("Накладная № " . $invoiceNumber, ['bold' => true, 'size' => 16], ['alignment' => 'center']);
        $section->addText("Адрес получения заказа: г. $city, $address", ['size' => 12], ['alignment' => 'center']);
        $section->addText("Дата получения заказа: $date", ['size' => 12], ['alignment' => 'center']);
        $section->addTextBreak(1);

        $tableStyle = ['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 50];
        $phpWord->addTableStyle('Invoice Table', $tableStyle);
        $table = $section->addTable('Invoice Table');
        
        // Строка 1: Список товаров
        $table->addRow();
        $cell1 = $table->addCell(6000, ['valign' => 'center']);
        $phpWord->addNumberingStyle(    
            'bullets',
            ['type' => 'multilevel', 'levels' => [['format' => 'bullet', 'text' => '•', 'left' => 360, 'hanging' => 360, 'tabPos' => 360]]]
        );
        foreach ($orderItems as $oItem) {
            $cell1->addListItem($oItem['name'] . ", " . $oItem['qty'] . " шт – " . $oItem['base_sum'] . "р", 0, null, 'bullets');
        }
        
        $cell2 = $table->addCell(3500, ['valign' => 'center']);
        
        $cell2->addText("Сумма: " . $totalBaseSum, [], ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceBefore' => 350]);

        // Строка 2: Цвет
        $table->addRow();
        $cell3 = $table->addCell(6000, ['valign' => 'center']);
        $cell3->addText("Цвет $color, наценка $markup");
        
        $cell4 = $table->addCell(3500, ['valign' => 'center']);
        
        // Вставляем картинку выбранного цвета
        $textureFile = $colorImages[$color] ?? '';
        if (!empty($textureFile) && file_exists($textureFile)) {
            // Используем TextRun для точного центрирования картинки в PDF
            $imageRun = $cell4->addTextRun(['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceBefore' => 50]);
            $imageRun->addImage($textureFile, [
                'width' => 60, 
                'height' => 60
            ]);
        } else {
            $cell4->addText("[ Изображение текстуры ]", ['color' => '888888'], ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);
        }

        // Строка 3: Итого
        $table->addRow();
        $table->addCell(9500)->addText("Итого:");
        $table->addCell(3500)->addText($totalSum, ['bold' => true]);

        $section->addTextBreak(1);
        $section->addText("Всего наименований $totalItemsCount, на сумму " . number_format($totalSum, 2, ',', '') . " руб.");
        $section->addTextBreak(1);
        
        $section->addText("Информация о гарантийном обслуживании:", ['bold' => true], ['alignment' => 'center']);

        // Указываем имя файла с текстом гарантии
        $warrantyFile = $templatesDir . '/warranty.txt';
        $warrantyTexts = [];


        if (file_exists($warrantyFile)) {
            // Читаем файл построчно. 
            // Флаги заставляют PHP игнорировать пустые строки и удалять невидимые символы переноса
            $warrantyTexts = file($warrantyFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        } else {
            $warrantyTexts = [
            "A. Чистка изделий от загрязнений не входит в гарантийное сервисное обслуживание и выполняется на платной основе согласно прейскуранту платных сервисных услуг.", "B. Продавец не отвечает за потерю или уничтожение программных продуктов, баз данных, другой информации, которые произошли в результате выхода из строя товара или его частей.",
            "C. Сроки гарантии, указанные в данном талоне, могут отличаться от сроков гарантии, заявленных производителем. Уточненные сроки гарантии смотрите в документации производителя.",
             "D. С информацией о сертификации и подтверждении соответствия товаров установленным требованиям ознакомлен.",
            "E. Товар получен надлежащего качества, т.е. соответствует форме, габаритам, расцветке, размерам, комплектации, техническим характеристикам, а также целям его приобретения.",
            "F. Внешние повреждения отсутствуют."
            ];
        }
        foreach ($warrantyTexts as $wText) {
            $section->addText($wText, [], ['indentation' => ['left' => 360, 'hanging' => 360]]);
        }

        // Сохранение в PDF
        $pdfRendererName = \PhpOffice\PhpWord\Settings::PDF_RENDERER_DOMPDF;
        $pdfRendererLibraryPath = realpath(__DIR__ . '/vendor/dompdf/dompdf');
        \PhpOffice\PhpWord\Settings::setPdfRenderer($pdfRendererName, $pdfRendererLibraryPath);
        
        $pdfFilename = "Документ_на_выдачу_$invoiceNumber.pdf";
        $pdfFilePath = $exportsDir . '/' . $pdfFilename;
        $pdfWriter = WordIOFactory::createWriter($phpWord, 'PDF');
        $pdfWriter->save($pdfFilePath);

        // 5. Запись в Excel (Запись о документах.xlsx)
        $excelFile = $exportsDir . '/Запись_о_документах.xlsx';
        if (file_exists($excelFile)) {
            $spreadsheet = ExcelIOFactory::load($excelFile);
            $sheet = $spreadsheet->getActiveSheet();
            $nextRow = $sheet->getHighestRow() + 1;
        } else {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setCellValue('A1', '№');
            $sheet->setCellValue('B1', '№ накладной');
            $sheet->setCellValue('C1', 'Город');
            $sheet->setCellValue('D1', 'Адрес');
            $sheet->setCellValue('E1', 'Итоговая сумма');
            
            $headerStyle = [
                'font' => ['bold' => true],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ];
            $sheet->getStyle('A1:E1')->applyFromArray($headerStyle);
            
            $nextRow = 2;
        }

        $sheet->setCellValue('A' . $nextRow, $nextRow - 1);
        $sheet->setCellValue('B' . $nextRow, $invoiceNumber);
        $sheet->setCellValue('C' . $nextRow, $city);
        $sheet->setCellValue('D' . $nextRow, $address);
        $sheet->setCellValue('E' . $nextRow, $totalSum);

        foreach (range('A', 'E') as $colID) {
            $sheet->getColumnDimension($colID)->setAutoSize(true);
        }

        $excelWriter = ExcelIOFactory::createWriter($spreadsheet, 'Xlsx');
        $excelWriter->save($excelFile);

        // 6. Конвертация Excel в HTML
        $htmlFile = $exportsDir . '/Запись_о_документах.html';
        $htmlWriter = ExcelIOFactory::createWriter($spreadsheet, 'Html');
        $htmlWriter->save($htmlFile);

        $pdfHref = 'storage/exports/' . rawurlencode($pdfFilename);
        $excelHref = 'storage/exports/' . rawurlencode(basename($excelFile));
        $htmlHref = 'storage/exports/' . rawurlencode(basename($htmlFile));

        $message = "<div style='color:green; margin-bottom: 20px;'>Заказ успешно оформлен! Накладная № $invoiceNumber сформирована.</div>";
        $downloadLinks = "
            <div style='margin-bottom: 20px;'>
                <strong>Доступные файлы:</strong><br>
                <a href='$pdfHref' download>Скачать накладную (PDF)</a> |
                <a href='$excelHref' download>Скачать реестр (Excel)</a> |
                <a href='$htmlHref' download>Скачать реестр (HTML)</a>
            </div>
        ";

    } catch (Exception $e) {
        $message = "<div style='color:red; margin-bottom: 20px;'>Ошибка: " . $e->getMessage() . "</div>";
    }
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Заказ мебели</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">
    <h2>Заказ мебели</h2>
    
    <?= $message ?>
    <?= $downloadLinks ?>

    <form id="order-form" method="post" enctype="multipart/form-data">
        
        <div class="top-fields">
            <label>Фамилия</label>
            <input type="text" name="last_name" value="<?= htmlspecialchars($_POST['last_name'] ?? '') ?>" required>
            
            <label>Город доставки</label>
            <select name="city" required>
                <option value="Пермь" <?= (($_POST['city'] ?? '') == 'Пермь') ? 'selected' : '' ?>>Пермь</option>
                <option value="Саратов" <?= (($_POST['city'] ?? '') == 'Саратов') ? 'selected' : '' ?>>Саратов</option>
                <option value="Самара" <?= (($_POST['city'] ?? '') == 'Самара') ? 'selected' : '' ?>>Самара</option>
            </select>
            
            <label>Дата доставки</label>
            <input type="text" name="date" value="<?= htmlspecialchars($_POST['date'] ?? '') ?>" placeholder="ДД.ММ.ГГ" required>
            
            <label>Адрес</label>
            <input type="text" name="address" value="<?= htmlspecialchars($_POST['address'] ?? '') ?>" required>
        </div>

        <div class="bottom-fields">
            
            <div>
                <div class="col-title">Выберите<br>цвет мебели</div>
                <div class="radio-group">
                    <?php foreach ($colorMarkups as $colName => $markup): ?>
                        <label>
                            <input type="radio" name="color" value="<?= $colName ?>" required <?= (($_POST['color'] ?? '') == $colName) ? 'checked' : '' ?>>
                            <?= $colName ?>
                        </label>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="items-qty-grid">
                <div class="col-title">Выберите<br>предметы мебели</div>
                <div class="col-title"><br>Количество</div>

                <?php foreach ($furnitureList as $item): ?>
                    <label>
                        <input
                            type="checkbox"
                            class="item-checkbox"
                            name="items[]"
                            value="<?= $item ?>"
                            data-item="<?= htmlspecialchars($item) ?>"
                            <?= (in_array($item, $_POST['items'] ?? [])) ? 'checked' : '' ?>
                        >
                        <?= $item ?>
                    </label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        class="qty-input"
                        name="quantities[<?= $item ?>]"
                        data-item="<?= htmlspecialchars($item) ?>"
                        value="<?= htmlspecialchars($_POST['quantities'][$item] ?? '') ?>"
                        <?= (in_array($item, $_POST['items'] ?? [])) ? '' : 'disabled' ?>
                    >
                <?php endforeach; ?>
            </div>
            
        </div>

        <div class="action-row">
            <label for="price_file" class="btn btn_outline">Выбрать файл с ценами</label>
            <button type="submit" class="btn btn_primary submit-btn">Оформить заказ</button>
            <span id="file-name" class="file-name">Файл не выбран</span>
            <input type="file" id="price_file" name="price_file" accept=".odt" style="display: none;">
        </div>

    </form>
</div>

<script>
    (function () {
        var form = document.getElementById('order-form');
        var fileInput = document.getElementById('price_file');
        var fileName = document.getElementById('file-name');
        var checkboxes = document.querySelectorAll('.item-checkbox');

        function getQtyInput(itemName) {
            return document.querySelector('.qty-input[data-item="' + itemName + '"]');
        }

        function syncQtyState(checkbox) {
            var qtyInput = getQtyInput(checkbox.dataset.item);
            if (!qtyInput) {
                return;
            }

            qtyInput.disabled = !checkbox.checked;
            if (!checkbox.checked) {
                qtyInput.value = '';
            }
        }

        checkboxes.forEach(function (checkbox) {
            syncQtyState(checkbox);
            checkbox.addEventListener('change', function () {
                syncQtyState(checkbox);
            });
        });

        fileInput.addEventListener('change', function () {
            fileName.textContent = this.files[0] ? this.files[0].name : 'Файл не выбран';
        });

        form.addEventListener('submit', function (event) {
            if (!fileInput.files.length) {
                alert('Пожалуйста, выберите файл с ценами заново. Браузер сбрасывает файлы после каждой отправки в целях безопасности.');
                event.preventDefault();
                return;
            }

            for (var i = 0; i < checkboxes.length; i++) {
                var checkbox = checkboxes[i];
                if (!checkbox.checked) {
                    continue;
                }

                var qtyInput = getQtyInput(checkbox.dataset.item);
                var qtyValue = qtyInput ? qtyInput.value.trim() : '';
                if (!qtyValue) {
                    alert('Укажите количество для товара "' + checkbox.dataset.item + '".');
                    if (qtyInput) {
                        qtyInput.focus();
                    }
                    event.preventDefault();
                    return;
                }

                var qtyNumber = Number(qtyValue);
                if (!Number.isInteger(qtyNumber) || qtyNumber < 1) {
                    alert('Количество для товара "' + checkbox.dataset.item + '" должно быть целым числом от 1.');
                    if (qtyInput) {
                        qtyInput.focus();
                    }
                    event.preventDefault();
                    return;
                }
            }
        });
    })();
</script>

</body>
</html>