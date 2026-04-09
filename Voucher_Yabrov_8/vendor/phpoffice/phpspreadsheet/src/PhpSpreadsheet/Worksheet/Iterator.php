<?php

namespace Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Worksheet;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Spreadsheet;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * @implements \Iterator<int, Worksheet>
 */
class Iterator implements \Iterator
{
    /**
     * Spreadsheet to iterate.
     */
    private Spreadsheet $subject;

    /**
     * Current iterator position.
     */
    private int $position = 0;

    /**
     * Create a new worksheet iterator.
     */
    public function __construct(Spreadsheet $subject)
    {
        // Set subject
        $this->subject = $subject;
    }

    /**
     * Rewind iterator.
     */
    public function rewind(): void
    {
        $this->position = 0;
    }

    /**
     * Current Worksheet.
     */
    public function current(): Worksheet
    {
        return $this->subject->getSheet($this->position);
    }

    /**
     * Current key.
     */
    public function key(): int
    {
        return $this->position;
    }

    /**
     * Next value.
     */
    public function next(): void
    {
        ++$this->position;
    }

    /**
     * Are there more Worksheet instances available?
     */
    public function valid(): bool
    {
        return $this->position < $this->subject->getSheetCount() && $this->position >= 0;
    }
}
