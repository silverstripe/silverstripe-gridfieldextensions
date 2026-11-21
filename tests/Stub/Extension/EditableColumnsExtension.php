<?php

namespace Symbiote\GridFieldExtensions\Tests\Stub\Extension;

use SilverStripe\Core\Extension;
use SilverStripe\Dev\TestOnly;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Forms\GridField\GridFieldEditButton;
use SilverStripe\Forms\ReadonlyField;
use SilverStripe\Forms\TextField;
use Symbiote\GridFieldExtensions\GridFieldEditableColumns;
use Symbiote\GridFieldExtensions\Tests\Stub\CustomMarkupTextField;

/**
 * Makes a GridField use editable columns: an "Employees" GridField in the CMS fields,
 * or the nested GridField of a GridFieldNestedForm.
 */
class EditableColumnsExtension extends Extension implements TestOnly
{
    protected function updateCMSFields(FieldList $fields): void
    {
        /** @var GridField|null $gridField */
        $gridField = $fields->dataFieldByName('Employees');
        if ($gridField) {
            $this->addEditableColumns($gridField->getConfig(), 'Email');
        }
    }

    protected function updateNestedConfig(GridFieldConfig $config): void
    {
        $this->addEditableColumns($config, 'Category');
    }

    private function addEditableColumns(GridFieldConfig $config, string $customMarkupColumn): void
    {
        $config->removeComponentsByType(GridFieldDataColumns::class);
        $editableColumns = new GridFieldEditableColumns();
        $editableColumns->setDisplayFields([
            // A read-only cell, which holds no editable field
            'ID' => [
                'title' => 'ID',
                'field' => ReadonlyField::class,
            ],
            'Name' => [
                'title' => 'Name',
                'field' => TextField::class,
            ],
            $customMarkupColumn => [
                'title' => $customMarkupColumn,
                'field' => CustomMarkupTextField::class,
            ],
        ]);
        $config->addComponent($editableColumns, GridFieldEditButton::class);
    }
}
