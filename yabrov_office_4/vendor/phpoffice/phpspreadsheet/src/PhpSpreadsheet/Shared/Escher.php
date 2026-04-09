<?php

namespace PhpOffice\PhpSpreadsheet\Shared;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Exception as SpreadsheetException;

class Escher
{
    /**
     * Drawing Group Container.
     */
    private ?\Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DggContainer $dggContainer = null;

    /**
     * Drawing Container.
     */
    private ?\Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DgContainer $dgContainer = null;

    /**
     * Get Drawing Group Container.
     */
    public function getDggContainer(): ?\Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DggContainer
    {
        return $this->dggContainer;
    }

    /**
     * Get Drawing Group Container.
     */
    public function getDggContainerOrThrow(): \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DggContainer
    {
        return $this->dggContainer ?? throw new SpreadsheetException('dggContainer is unexpectedly null');
    }

    /**
     * Set Drawing Group Container.
     */
    public function setDggContainer(\Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DggContainer $dggContainer): \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DggContainer
    {
        return $this->dggContainer = $dggContainer;
    }

    /**
     * Get Drawing Container.
     */
    public function getDgContainer(): ?\Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DgContainer
    {
        return $this->dgContainer;
    }

    /**
     * Get Drawing Container.
     */
    public function getDgContainerOrThrow(): \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DgContainer
    {
        return $this->dgContainer ?? throw new SpreadsheetException('dgContainer is unexpectedly null');
    }

    /**
     * Set Drawing Container.
     */
    public function setDgContainer(\Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DgContainer $dgContainer): \Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\Escher\DgContainer
    {
        return $this->dgContainer = $dgContainer;
    }
}
