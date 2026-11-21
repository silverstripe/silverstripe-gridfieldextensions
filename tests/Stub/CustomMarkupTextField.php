<?php

namespace Symbiote\GridFieldExtensions\Tests\Stub;

use SilverStripe\Dev\TestOnly;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\FieldType\DBField;
use SilverStripe\ORM\FieldType\DBHTMLText;

/**
 * Text field that renders extra markup next to its input, like a widget that draws its own UI:
 * a label, a custom element and a nested table. Used to test row clicks on editable columns.
 */
class CustomMarkupTextField extends TextField implements TestOnly
{
    public function Field($properties = []): DBHTMLText
    {
        $html = parent::Field($properties)->getValue()
            . sprintf('<label for="%s" class="custom-markup-label">Field label</label>', $this->ID())
            . '<span class="custom-markup-widget">Custom markup</span>'
            . '<table class="custom-markup-table"><tbody><tr>'
            . '<td class="custom-markup-table-cell"><span class="custom-markup-table-content">Nested table</span></td>'
            . '</tr></tbody></table>';
        return DBField::create_field('HTMLFragment', $html);
    }
}
