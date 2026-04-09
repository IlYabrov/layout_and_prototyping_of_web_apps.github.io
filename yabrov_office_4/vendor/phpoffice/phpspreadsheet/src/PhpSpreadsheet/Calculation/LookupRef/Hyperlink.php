<?php

namespace PhpOffice\PhpSpreadsheet\Calculation\LookupRef;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Calculation\Functions;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Calculation\Information\ExcelError;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Cell\Cell;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\StringHelper;

class Hyperlink
{
    /**
     * HYPERLINK.
     *
     * Excel Function:
     *        =HYPERLINK(linkURL, [displayName])
     *
     * @param mixed $linkURL Expect string. Value to check, is also the value returned when no error
     * @param mixed $displayName Expect string. Value to return when testValue is an error condition
     * @param ?Cell $cell The cell to set the hyperlink in
     *
     * @return string The value of $displayName (or $linkURL if $displayName was blank)
     */
    public static function set(mixed $linkURL = '', mixed $displayName = null, ?Cell $cell = null): string
    {
        $worksheet = null;
        $coordinate = '';
        if ($cell !== null) {
            $coordinate = $cell->getCoordinate();
            $worksheet = $cell->getWorksheetOrNull();
        }

        $linkURL = ($linkURL === null) ? '' : StringHelper::convertToString(Functions::flattenSingleValue($linkURL));
        $displayName = ($displayName === null) ? '' : Functions::flattenSingleValue($displayName);

        if ((!is_object($cell)) || (trim($linkURL) == '')) {
            return ExcelError::REF();
        }

        $displayName = StringHelper::convertToString($displayName, false);
        if (trim($displayName) === '') {
            $displayName = $linkURL;
        }

        $worksheet?->getCell($coordinate)
            ->getHyperlink()
            ->setUrl($linkURL)
            ->setTooltip($displayName)
            ->setDisplay('');

        return $displayName;
    }
}
