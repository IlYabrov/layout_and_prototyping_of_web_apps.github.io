<?php

namespace PhpOffice\PhpSpreadsheet\Calculation\DateTimeExcel;

use DateTimeInterface;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Calculation\ArrayEnabled;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Calculation\Exception;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Calculation\Information\ExcelError;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Calculation\DateTimeExcel\Helpers;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Date as SharedDateHelper;

class Days
{
    use ArrayEnabled;

    /**
     * DAYS.
     *
     * Returns the number of days between two dates
     *
     * Excel Function:
     *        DAYS(endDate, startDate)
     *
     * @param array<mixed>|DateTimeInterface|float|int|string $endDate Excel date serial value (float),
     *           PHP date timestamp (integer), PHP DateTime object, or a standard date string
     *                         Or can be an array of date values
     * @param array<mixed>|DateTimeInterface|float|int|string $startDate Excel date serial value (float),
     *           PHP date timestamp (integer), PHP DateTime object, or a standard date string
     *                         Or can be an array of date values
     *
     * @return array<mixed>|int|string Number of days between start date and end date or an error
     *         If an array of values is passed for the $startDate or $endDays,arguments, then the returned result
     *            will also be an array with matching dimensions
     */
    public static function between(array|DateTimeInterface|float|int|string $endDate, array|DateTimeInterface|float|int|string $startDate): array|int|string
    {
        if (is_array($endDate) || is_array($startDate)) {
            return self::evaluateArrayArguments([self::class, __FUNCTION__], $endDate, $startDate);
        }

        try {
            $startDate = Helpers::getDateValue($startDate);
            $endDate = Helpers::getDateValue($endDate);
        } catch (Exception $e) {
            return $e->getMessage();
        }

        // Execute function
        $PHPStartDateObject = SharedDateHelper::excelToDateTimeObject($startDate);
        $PHPEndDateObject = SharedDateHelper::excelToDateTimeObject($endDate);

        $days = ExcelError::VALUE();
        $diff = $PHPStartDateObject->diff($PHPEndDateObject);
        if (!is_bool($diff->days)) {
            $days = $diff->days;
            if ($diff->invert) {
                $days = -$days;
            }
        }

        return $days;
    }
}
