<?php

namespace PhpOffice\PhpSpreadsheet\Style\NumberFormat\Wizard;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\NumberFormat\Wizard\CurrencyBase;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\NumberFormat\Wizard\CurrencyNegative;

class Currency extends CurrencyBase
{
    protected ?bool $overrideSpacing = false;

    protected ?CurrencyNegative $overrideNegative = null;
}
