<?php

namespace Matrix\Decomposition;

use Voucher_Yabrov_8\vendor\markbaker\matrix\classes\src\Decomposition\QR;
use Voucher_Yabrov_8\vendor\markbaker\matrix\classes\src\Exception;
use Voucher_Yabrov_8\vendor\markbaker\matrix\classes\src\Matrix;
use Voucher_Yabrov_8\vendor\markbaker\matrix\classes\src\Decomposition\LU;

class Decomposition
{
    const LU = 'LU';
    const QR = 'QR';

    /**
     * @throws Exception
     */
    public static function decomposition($type, Matrix $matrix)
    {
        switch (strtoupper($type)) {
            case self::LU:
                return new LU($matrix);
            case self::QR:
                return new QR($matrix);
            default:
                throw new Exception('Invalid Decomposition');
        }
    }
}
