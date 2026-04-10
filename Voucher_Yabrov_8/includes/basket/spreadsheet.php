<?php

if (!function_exists('buildSpreadsheet')) {
    function buildSpreadsheet(
        array $order,
        array $bill,
        $service_type,
        $car_name,
        $res,
        array $services,
        array $cars,
        array $preparation,
        array $additionalOptions,
        array $prep_keys,
        $templatePath
    ) {
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($templatePath);
        $sheet = $spreadsheet->getActiveSheet();

        $invoice_number = rand(1000, 9999);
        $service_codes = [
            'прокат' => 'A1',
            'продажа' => 'A2',
            'лизинг' => 'A3',
        ];

        $daysValue = ($service_type === 'продажа') ? '' : (int)($bill['days'] ?? 0);
        $leaseRentTotal = ($service_type === 'прокат' || $service_type === 'лизинг')
            ? ((int)($services[$service_type] ?? 0) * (int)($bill['days'] ?? 0))
            : 0;

        $sheet->setCellValue('A3', 'ООО "Смышленный перекуп"');
        $sheet->setCellValue('F6', $invoice_number);

        $sheet->setCellValue('C8', $order['name'] ?? '');
        $phone = (string)($order['phone'] ?? '');
        $sheet->setCellValueExplicit('C9', $phone, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
        $sheet->setCellValue('C10', $order['email'] ?? '');
        $sheet->setCellValue('C11', $service_type);
        $sheet->setCellValue('B31', date('d.m.Y'));

        $sheet->setCellValue('F31', '');
        $sheet->setCellValue('G31', '');
        $sheet->getStyle('F31:G31')->getBorders()->getBottom()->setBorderStyle(
            \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN
        );
        $sheet->mergeCells('F32:G32');
        $sheet->setCellValue('F32', '(подпись менеджера)');
        $sheet->getStyle('F32:G32')->getFont()->setSize(8);
        $sheet->getStyle('F32:G32')->getAlignment()->setHorizontal(
            \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER
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
    function buildOutputFileName(array $order, $storagePath)
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

