<?php

namespace PhpOffice\PhpSpreadsheet\Writer\Ods\Cell;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Cell\Cell;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\XMLWriter;

/**
 * @author     Alexander Pervakov <frost-nzcr4@jagmort.com>
 */
class Comment
{
    public static function write(XMLWriter $objWriter, Cell $cell): void
    {
        $comments = $cell->getWorksheet()->getComments();
        if (!isset($comments[$cell->getCoordinate()])) {
            return;
        }
        $comment = $comments[$cell->getCoordinate()];

        $objWriter->startElement('office:annotation');
        $objWriter->writeAttribute('svg:width', $comment->getWidth());
        $objWriter->writeAttribute('svg:height', $comment->getHeight());
        $objWriter->writeAttribute('svg:x', $comment->getMarginLeft());
        $objWriter->writeAttribute('svg:y', $comment->getMarginTop());
        $objWriter->writeElement('dc:creator', $comment->getAuthor());

        $objWriter->startElement('text:p');
        $text = $comment->getText()->getPlainText();
        $textElements = explode("\n", $text);
        $newLineOwed = false;
        foreach ($textElements as $textSegment) {
            if ($newLineOwed) {
                $objWriter->writeElement('text:line-break');
            }
            $newLineOwed = true;
            if ($textSegment !== '') {
                $objWriter->writeElement('text:span', $textSegment);
            }
        }
        $objWriter->endElement(); // text:p

        $objWriter->endElement();
    }
}
