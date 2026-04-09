<?php

namespace PhpOffice\PhpSpreadsheet\Writer\Ods;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Writer\Ods\WriterPart;

class Mimetype extends WriterPart
{
    /**
     * Write mimetype to plain text format.
     *
     * @return string XML Output
     */
    public function write(): string
    {
        return 'application/vnd.oasis.opendocument.spreadsheet';
    }
}
