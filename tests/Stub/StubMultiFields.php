<?php

namespace Symbiote\GridFieldExtensions\Tests\Stub;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;

class StubMultiFields extends DataObject implements TestOnly
{
    private static $db = [
        'Title' => "MultiEnum('A,B,C')",
    ];

    private static $table_name = 'StubMultiFields';

    public function canEdit($member = null)
    {
        return true;
    }
}
