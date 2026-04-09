<?php

namespace Psr\SimpleCache;

use Voucher_Yabrov_8\vendor\psr\simple/**
 * Exception interface for invalid cache arguments.
 *
 * When an invalid argument is passed it must throw an exception which implements
 * this interface
 */
interface InvalidArgumentException extends CacheException
{
}
