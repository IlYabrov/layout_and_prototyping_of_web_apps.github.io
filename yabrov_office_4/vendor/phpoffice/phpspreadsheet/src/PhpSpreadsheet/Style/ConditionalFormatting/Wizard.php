<?php

namespace PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Exception;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\Conditional;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\WizardInterface;

class Wizard
{
    public const CELL_VALUE = 'cellValue';
    public const TEXT_VALUE = 'textValue';
    public const BLANKS = Conditional::CONDITION_CONTAINSBLANKS;
    public const NOT_BLANKS = Conditional::CONDITION_NOTCONTAINSBLANKS;
    public const ERRORS = Conditional::CONDITION_CONTAINSERRORS;
    public const NOT_ERRORS = Conditional::CONDITION_NOTCONTAINSERRORS;
    public const EXPRESSION = Conditional::CONDITION_EXPRESSION;
    public const FORMULA = Conditional::CONDITION_EXPRESSION;
    public const DATES_OCCURRING = 'DateValue';
    public const DUPLICATES = Conditional::CONDITION_DUPLICATES;
    public const UNIQUE = Conditional::CONDITION_UNIQUE;

    public const VALUE_TYPE_LITERAL = 'value';
    public const VALUE_TYPE_CELL = 'cell';
    public const VALUE_TYPE_FORMULA = 'formula';

    protected string $cellRange;

    public function __construct(string $cellRange)
    {
        $this->cellRange = $cellRange;
    }

    public function newRule(string $ruleType): WizardInterface
    {
        return match ($ruleType) {
            self::CELL_VALUE => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\CellValue($this->cellRange),
            self::TEXT_VALUE => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\TextValue($this->cellRange),
            self::BLANKS => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Blanks($this->cellRange, true),
            self::NOT_BLANKS => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Blanks($this->cellRange, false),
            self::ERRORS => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Errors($this->cellRange, true),
            self::NOT_ERRORS => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Errors($this->cellRange, false),
            self::EXPRESSION, self::FORMULA => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Expression($this->cellRange),
            self::DATES_OCCURRING => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\DateValue($this->cellRange),
            self::DUPLICATES => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Duplicates($this->cellRange, false),
            self::UNIQUE => new \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Duplicates($this->cellRange, true),
            default => throw new Exception('No wizard exists for this CF rule type'),
        };
    }

    public static function fromConditional(Conditional $conditional, string $cellRange = 'A1'): WizardInterface
    {
        $conditionalType = $conditional->getConditionType();

        return match ($conditionalType) {
            Conditional::CONDITION_CELLIS => \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\CellValue::fromConditional($conditional, $cellRange),
            Conditional::CONDITION_CONTAINSTEXT, Conditional::CONDITION_NOTCONTAINSTEXT, Conditional::CONDITION_BEGINSWITH, Conditional::CONDITION_ENDSWITH => \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\TextValue::fromConditional($conditional, $cellRange),
            Conditional::CONDITION_CONTAINSBLANKS, Conditional::CONDITION_NOTCONTAINSBLANKS => \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Blanks::fromConditional($conditional, $cellRange),
            Conditional::CONDITION_CONTAINSERRORS, Conditional::CONDITION_NOTCONTAINSERRORS => \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Errors::fromConditional($conditional, $cellRange),
            Conditional::CONDITION_TIMEPERIOD => \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\DateValue::fromConditional($conditional, $cellRange),
            Conditional::CONDITION_EXPRESSION => \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Expression::fromConditional($conditional, $cellRange),
            Conditional::CONDITION_DUPLICATES, Conditional::CONDITION_UNIQUE => \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Style\ConditionalFormatting\Wizard\Duplicates::fromConditional($conditional, $cellRange),
            default => throw new Exception('No wizard exists for this CF rule type'),
        };
    }
}
