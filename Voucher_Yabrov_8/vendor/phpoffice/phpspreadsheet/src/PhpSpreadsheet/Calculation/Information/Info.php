<?php

namespace PhpOffice\PhpSpreadsheet\Calculation\Information;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Calculation\Functions;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Calculation\Information\ExcelError;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Cell\Cell;

class Info
{
    /**
     * @internal
     */
    public static bool $infoSupported = true;

    /**
     * INFO.
     *
     * Excel Function:
     *        =INFO(type_text)
     *
     * @param mixed $typeText String specifying the type of information to be returned
     * @param ?Cell $cell Cell from which spreadsheet information is retrieved
     *
     * @return int|string The requested information about the current operating environment
     */
    public static function getInfo(mixed $typeText = '', ?Cell $cell = null): int|string
    {
        if (!self::$infoSupported) {
            return Functions::DUMMY();
        }

        return match (is_string($typeText) ? strtolower($typeText) : $typeText) {
            'directory' => '/',
            'numfile' => $cell?->getWorksheetOrNull()?->getParent()?->getSheetCount() ?? 1,
            'origin' => '$A:$A$1',
            'osversion' => 'PHP ' . PHP_VERSION,
            'recalc' => 'Automatic',
            'release' => PHP_VERSION,
            'system' => 'PHP',
            'memavail', 'memused', 'totmem' => ExcelError::NA(),
            default => ExcelError::VALUE(),
        };
    }
}
