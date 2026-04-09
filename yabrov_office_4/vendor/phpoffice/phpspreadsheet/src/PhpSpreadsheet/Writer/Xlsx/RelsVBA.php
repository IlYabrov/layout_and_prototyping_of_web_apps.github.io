<?php

namespace PhpOffice\PhpSpreadsheet\Writer\Xlsx;

use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Reader\Xlsx\Namespaces;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Shared\XMLWriter;
use Voucher_Yabrov_8\vendor\phpoffice\phpspreadsheet\src\PhpSpreadsheet\Writer\Xlsx\WriterPart;

class RelsVBA extends WriterPart
{
    /**
     * Write relationships for a signed VBA Project.
     *
     * @return string XML Output
     */
    public function writeVBARelationships(): string
    {
        // Create XML writer
        $objWriter = null;
        if ($this->getParentWriter()->getUseDiskCaching()) {
            $objWriter = new XMLWriter(XMLWriter::STORAGE_DISK, $this->getParentWriter()->getDiskCachingDirectory());
        } else {
            $objWriter = new XMLWriter(XMLWriter::STORAGE_MEMORY);
        }

        // XML header
        $objWriter->startDocument('1.0', 'UTF-8', 'yes');

        // Relationships
        $objWriter->startElement('Relationships');
        $objWriter->writeAttribute('xmlns', Namespaces::RELATIONSHIPS);
        $objWriter->startElement('Relationship');
        $objWriter->writeAttribute('Id', 'rId1');
        $objWriter->writeAttribute('Type', Namespaces::VBA_SIGNATURE);
        $objWriter->writeAttribute('Target', 'vbaProjectSignature.bin');
        $objWriter->endElement();
        $objWriter->endElement();

        return $objWriter->getData();
    }
}
