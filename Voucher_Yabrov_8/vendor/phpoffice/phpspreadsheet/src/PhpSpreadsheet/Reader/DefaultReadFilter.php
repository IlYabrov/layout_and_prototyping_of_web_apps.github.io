<?php

namespace PhpOffice\PhpSpreadsheet\Reader;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Reader\IReadFilter;

class DefaultReadFilter implements IReadFilter
{
    /**
     * Should this cell be read?
     *
     * @param string $columnAddress Column address (as a string value like "A", or "IV")
     * @param int $row Row number
     * @param string $worksheetName Optional worksheet name
     */
    public function readCell(string $columnAddress, int $row, string $worksheetName = ''): bool
    {
        return true;
    }
}
