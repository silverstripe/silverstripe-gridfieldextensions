---
title: Configuration
summary: Configuration options including adding existing search, inline editing, multi-class adding, orderable rows, and configurable pagination
icon: cogs
---

# Configuration

## Add existing search

The [`GridFieldAddExistingSearchButton`](api:Symbiote\GridFieldExtensions\GridFieldAddExistingSearchButton) component provides a more complete solution for adding
existing records than a basic autocomplete. It uses the search context constructed by the model
class to provide the search form.

```php
use Symbiote\GridFieldExtensions\GridFieldAddExistingSearchButton;

$gridField->getConfig()->addComponent(GridFieldAddExistingSearchButton::create());
```

## Inline editing

This example replaces the default data columns component with an inline editable one, and the
default add new button with one that adds new records inline.

```php
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldButtonRow;
use SilverStripe\Forms\GridField\GridFieldConfig;
use SilverStripe\Forms\GridField\GridFieldDeleteAction;
use SilverStripe\Forms\GridField\GridFieldToolbarHeader;
use Symbiote\GridFieldExtensions\GridFieldAddNewInlineButton;
use Symbiote\GridFieldExtensions\GridFieldEditableColumns;
use Symbiote\GridFieldExtensions\GridFieldTitleHeader;

$gridField = GridField::create(
    'ExampleGrid',
    'Example GridField',
    $this->Items(),
    GridFieldConfig::create()
        ->addComponent(GridFieldButtonRow::create('before'))
        ->addComponent(GridFieldToolbarHeader::create())
        ->addComponent(GridFieldTitleHeader::create())
        ->addComponent(GridFieldEditableColumns::create())
        ->addComponent(GridFieldDeleteAction::create())
        ->addComponent(GridFieldAddNewInlineButton::create())
);
```

You can customise the form fields that are used in the GridField by calling `setDisplayFields()` on the
inline editing component. By default field scaffolding will be used.

> [!WARNING]
> Fields based on `MultiSelectField` ignore `fieldCasting()` and `formatValue()` manipulations.

```php
use SilverStripe\Forms\ReadonlyField;
use SilverStripe\Forms\TextField;
use Symbiote\GridFieldExtensions\GridFieldEditableColumns;

$gridField->getConfig()->getComponentByType(GridFieldEditableColumns::class)->setDisplayFields([
    'FirstField' => function ($record, $column, $grid) {
        return TextField::create($column);
    },
    'SecondField' => [
        'title' => 'Custom Title',
        'field' => ReadonlyField::class,
    ],
    'ThirdField' => [
        'title' => 'Custom Title Two',
        'callback' => function ($record, $column, $grid) {
            return TextField::create($column);
        },
    ],
]);
```

Editing data contained in `many_many_extraFields` is supported - just treat it as you would any other field.

## Multi class adding

The [`GridFieldAddNewMultiClass`](api:Symbiote\GridFieldExtensions\GridFieldAddNewMultiClass) allows the user to select the record type to create when creating
a new record. By default it allows them to select the model class for the GridField, or any
subclasses. You can control the createable classes using the `setClasses()` method.

```php
use SilverStripe\Forms\GridField\GridFieldAddNewButton;
use Symbiote\GridFieldExtensions\GridFieldAddNewMultiClass;

$gridField->getConfig()
     ->removeComponentsByType(GridFieldAddNewButton::class)
     ->addComponent(GridFieldAddNewMultiClass::create());
```

## Orderable rows

The [`GridFieldOrderableRows`](api:Symbiote\GridFieldExtensions\GridFieldOrderableRows) component allows drag-and-drop reordering of any list type. The field
used to store the sort is set by passing a constructor parameter to the component, or calling
`setSortField()`. For `many_many` relationships, the sort field should normally be an extra field on
the relationship.

```php
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;

// Basic usage, defaults to "Sort" for the sort field.
$gridField->getConfig()->addComponent(GridFieldOrderableRows::create());

// Specifying the sort field.
$gridField->getConfig()->addComponent(GridFieldOrderableRows::create('SortField'));
```

By default, when you create a new item, it is created with a sort order of "0" - that is, it is added
to the start of the list. The sort order is only set for the first time when the user reorders the items.
If you wish to append newly created items to the end of the list, use an `onBeforeWrite()` hook like:

```php
namespace App\Models;

use SilverStripe\ORM\DataObject;

class Item extends DataObject
{
    // ...
    private static $db = [
        'Sort' => 'Int',
    ];

    protected function onBeforeWrite()
    {
        if (!$this->Sort) {
            $this->Sort = Item::get()->max('Sort') + 1;
        }
        parent::onBeforeWrite();
    }
}
```

### Versioning

By default `GridFieldOrderableRows` will handle versioning but won't automatically publish any records. The user will need to go into each record and publish them manually which could get cumbersome for large lists.

You can configure the list to automatically publish a record if the record is the latest version and is already published. This won't publish any records which have draft changes.

```php
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;

$orderable = GridFieldOrderableRows::create()->setRepublishLiveRecords(true);
```

There are caveats with both approaches so consideration should be made for which approach best suits the requirements.

> [!NOTE]
> There is a limitation when using `GridFieldOrderableRows` on unsaved data objects; namely, that it doesn't work as without data being saved, the list of related objects has no context. Please check `$this->ID` before adding the `GridFieldOrderableRows` component to the GridField config (or even, before adding the GridField at all).

## Configurable paginator

The [`GridFieldConfigurablePaginator`](api:Symbiote\GridFieldExtensions\GridFieldConfigurablePaginator) component allows you to have a page size dropdown added to your GridField
pagination controls. The page sizes are configurable via the configuration system, or at call time using the public API.
To use this component you should remove the original paginator component first:

```php
use Symbiote\GridFieldExtensions\GridFieldConfigurablePaginator;

$gridField->getConfig()
    ->removeComponentsByType('GridFieldPaginator')
    ->addComponent(GridFieldConfigurablePaginator::create());
```

You can configure the page sizes with the configuration system. Note that merging is the default strategy, so to replace
the default sizes with your own you will need to unset the original first, for example:

```php
// app/_config.php
use SilverStripe\Core\Config\Config;

Config::inst()->remove('GridFieldConfigurablePaginator', 'default_page_sizes');
Config::inst()->update('GridFieldConfigurablePaginator', 'default_page_sizes', [100, 200, 500]);
```

You can also override these at call time:

```php
use Symbiote\GridFieldExtensions\GridFieldConfigurablePaginator;

$paginator = GridFieldConfigurablePaginator::create(100, [100, 200, 500]);
$paginator->setPageSizes([200, 500, 1000]);
$paginator->setItemsPerPage(500);
```
