<?php

namespace PhpOffice\PhpSpreadsheet\Reader\Ods;

use DOMElement;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Spreadsheet;

abstract class BaseLoader
{
    protected Spreadsheet $spreadsheet;

    protected string $tableNs;

    public function __construct(Spreadsheet $spreadsheet, string $tableNs)
    {
        $this->spreadsheet = $spreadsheet;
        $this->tableNs = $tableNs;
    }

    abstract public function read(DOMElement $workbookData): void;
}
