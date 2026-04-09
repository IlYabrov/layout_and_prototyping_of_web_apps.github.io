<?php

declare(strict_types=1);

namespace ZipStream\Test\Zs;

use PHPUnit\Framework\TestCase;
use php\src\Zs\ExtendedInformationExtraField;

class ExtendedInformationExtraFieldTest extends TestCase
{
    public function testSerializesCorrectly(): void
    {
        $extraField = php\src\Zs\ExtendedInformationExtraField::generate();

        $this->assertSame(
            bin2hex((string) $extraField),
            '5356' . // 2 bytes; Tag for this "extra" block type
            '0000' // 2 bytes; TODO: Document
        );
    }
}
