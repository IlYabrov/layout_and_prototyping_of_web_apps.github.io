<?php

namespace PhpOffice\PhpSpreadsheet\Calculation;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Calculation\Exception;

class ExceptionHandler
{
    /**
     * Register errorhandler.
     */
    public function __construct()
    {
        /** @var callable $callable */
        $callable = [Exception::class, 'errorHandlerCallback'];
        set_error_handler($callable, E_ALL);
    }

    /**
     * Unregister errorhandler.
     */
    public function __destruct()
    {
        restore_error_handler();
    }
}
