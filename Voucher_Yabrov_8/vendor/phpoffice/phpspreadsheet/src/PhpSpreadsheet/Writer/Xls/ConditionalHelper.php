<?php

namespace PhpOffice\PhpSpreadsheet\Writer\Xls;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Exception as PhpSpreadsheetException;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\StringHelper;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Writer\Xls\Parser;

class ConditionalHelper
{
    /**
     * Formula parser.
     */
    protected Parser $parser;

    protected mixed $condition;

    protected string $cellRange;

    protected ?string $tokens = null;

    protected int $size;

    public function __construct(Parser $parser)
    {
        $this->parser = $parser;
    }

    public function processCondition(mixed $condition, string $cellRange): void
    {
        $this->condition = $condition;
        $this->cellRange = $cellRange;

        if (is_int($condition) && $condition >= 0 && $condition <= 65535) {
            $this->size = 3;
            $this->tokens = pack('Cv', 0x1E, $condition);
        } else {
            try {
                $formula = \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\WizardAbstract::reverseAdjustCellRef(StringHelper::convertToString($condition), $cellRange);
                $this->parser->parse($formula);
                $this->tokens = $this->parser->toReversePolish();
                $this->size = strlen($this->tokens ?? '');
            } catch (PhpSpreadsheetException) {
                // In the event of a parser error with a formula value, we set the expression to ptgInt + 0
                $this->tokens = pack('Cv', 0x1E, 0);
                $this->size = 3;
            }
        }
    }

    public function tokens(): ?string
    {
        return $this->tokens;
    }

    public function size(): int
    {
        return $this->size;
    }
}
