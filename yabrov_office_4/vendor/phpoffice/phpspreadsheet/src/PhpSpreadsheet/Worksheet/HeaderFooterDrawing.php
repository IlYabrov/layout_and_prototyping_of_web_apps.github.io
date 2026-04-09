<?php

namespace PhpOffice\PhpSpreadsheet\Worksheet;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Worksheet\Drawing;

class HeaderFooterDrawing extends Drawing
{
    /**
     * Get hash code.
     *
     * @return string Hash code
     */
    public function getHashCode(): string
    {
        return md5(
            $this->getPath()
            . $this->name
            . $this->offsetX
            . $this->offsetY
            . $this->width
            . $this->height
            . __CLASS__
        );
    }
}
