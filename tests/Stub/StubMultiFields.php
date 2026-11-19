<?php

namespace Symbiote\GridFieldExtensions\Tests\Stub;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;

class StubMultiFields extends DataObject implements TestOnly
{
    private static $db = [
        'Title' => "MultiEnum('A,B,C')",
        // MultiSelectField stores a non-relation, non-MultiEnum value as a JSON-encoded array
        'Tags' => 'Varchar(255)',
        'Name' => 'Varchar',
    ];

    private static $summary_fields = [
        'Title',
    ];

    private static $table_name = 'StubMultiFields';

    public function canEdit($member = null)
    {
        return true;
    }
}
