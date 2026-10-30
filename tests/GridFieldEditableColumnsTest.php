<?php

namespace Symbiote\GridFieldExtensions\Tests;

use Symbiote\GridFieldExtensions\Tests\Stub\TestController;
use Symbiote\GridFieldExtensions\Tests\Stub\StubMultiFields;
use Symbiote\GridFieldExtensions\Tests\Stub\StubUnorderable;
use Symbiote\GridFieldExtensions\GridFieldEditableColumns;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\FieldType\DBHTMLText;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FieldList;
use SilverStripe\Dev\SapphireTest;
use ReflectionMethod;

class GridFieldEditableColumnsTest extends SapphireTest
{
    /**
     * Allow access to GridFieldEditableColumns::normaliseValue
     */
    private function invokeNormaliseValue(GridFieldEditableColumns $component, mixed $value): mixed
    {
        $method = new ReflectionMethod(GridFieldEditableColumns::class, 'normaliseValue');
        $method->setAccessible(true);

        return $method->invoke($component, $value);
    }

    /**
     * Allow access to GridFieldEditableColumns::isChanged
     */
    private function invokeIsChanged(GridFieldEditableColumns $component, DataObject $item, array $fields): bool
    {
        $method = new ReflectionMethod(GridFieldEditableColumns::class, 'isChanged');
        $method->setAccessible(true);

        return $method->invoke($component, $item, $fields);
    }

    private function getMockGrid()
    {
        $controller = new TestController('Test');
        $form = new Form($controller, 'TestForm', new FieldList(
            $grid = new GridField('TestGridField')
        ), new FieldList());
        $grid->setModelClass(StubUnorderable::class);
        $grid->setList(StubUnorderable::get());
        return $grid;
    }

    private function getMockRecord($id, $title)
    {
        $record = new StubUnorderable();
        $record->ID = $id;
        $record->Title = $title;
        return $record;
    }

    public function testProvidesEditableFieldsInColumns()
    {
        $grid = $this->getMockGrid();
        $component = new GridFieldEditableColumns();
        $record = $this->getMockRecord(100, "foo");

        $this->assertEquals(
            [ 'Title' ],
            $component->getColumnsHandled($grid)
        );

        $record->setCanEdit(true);
        $column = $component->getColumnContent($grid, $record, 'Title');

        $this->assertMatchesRegularExpression(
            '/<input type="text" name="TestGridField\[GridFieldEditableColumns\]\[100\]\[Title\]" value="foo"[^>]*>/',
            $column
        );
    }

    public function testProvidesReadonlyColumnsForNoneditableRecords()
    {
        $grid = $this->getMockGrid();
        $component = new GridFieldEditableColumns();
        $record = $this->getMockRecord(100, "testval");

        $record->setCanEdit(false);
        $column = $component->getColumnContent($grid, $record, 'Title');

        $this->assertMatchesRegularExpression(
            '/<span[^>]*>\s*testval\s*<\/span>/',
            $column
        );
    }

    public function testProvidesReadonlyColumnsForReadonlyGrids()
    {
        $grid = $this->getMockGrid();
        $component = new GridFieldEditableColumns();
        $record = $this->getMockRecord(100, "testval");

        $record->setCanEdit(true);
        $grid = $grid->performReadonlyTransformation();

        if (!$grid instanceof GridField) {
            $this->markTestSkipped('silverstripe/framework <4.2.2 doesn\'t support readonly GridFields');
        }

        $column = $component->getColumnContent($grid, $record, 'Title');

        $this->assertMatchesRegularExpression(
            '/<span[^>]*>\s*testval\s*<\/span>/',
            $column
        );
    }

    public function testNormaliseValueCastsNumericStrings()
    {
        $component = new GridFieldEditableColumns();

        $this->assertSame(10, $this->invokeNormaliseValue($component, '10'));
        $this->assertSame(10.5, $this->invokeNormaliseValue($component, '10.5'));
    }

    public function testNormaliseValueConvertsBooleansToIntegers()
    {
        $component = new GridFieldEditableColumns();

        $this->assertSame(1, $this->invokeNormaliseValue($component, true));
        $this->assertSame(0, $this->invokeNormaliseValue($component, false));
    }

    public function testNormaliseValueRecursivelyNormalisesArrays()
    {
        $component = new GridFieldEditableColumns();

        $result = $this->invokeNormaliseValue($component, [
            '1',
            true,
            ['2', false, 'text'],
        ]);

        $this->assertSame([1, 1, [2, 0, 'text']], $result);
    }

    public function testIsChangedReturnsFalseForEquivalentNormalisedScalarValues()
    {
        $component = new GridFieldEditableColumns();
        $item = new StubUnorderable();
        $item->setField('Title', 'test');
        $item->setField('Sort', 3);

        $this->assertFalse($this->invokeIsChanged($component, $item, [
            'Title' => 'test',
            'Sort' => '3',
        ]));
    }

    public function testIsChangedReturnsFalseForEquivalentNormalisedArrayValues()
    {
        $component = new GridFieldEditableColumns();
        $item = new StubUnorderable();
        $item->setField('IDs', [1, 2, 3]);

        $this->assertFalse($this->invokeIsChanged($component, $item, [
            'IDs' => ['1', '2', '3'],
        ]));
    }

    public function testIsChangedReturnsTrueForDifferentValues()
    {
        $component = new GridFieldEditableColumns();
        $item = new StubUnorderable();
        $item->setField('Sort', 3);

        $this->assertTrue($this->invokeIsChanged($component, $item, [
            'Sort' => '4',
        ]));
    }

    // Helper function that does generate a regex matching a specific
    // <input> element with the `checked="checked"` property.
    private static function checkedRegex(int $id, string $field, string $option): string
    {
        return '/<input[^>]*name="[^]]*\[GridFieldEditableColumns\]\['
            . $id . '\]\[' . $field . '\]\[' . $option
            . '\][^>]*checked="checked"[^>]*>/s';
    }

    private function assertOptionNotChecked(int $id, string $field, string $option, $html)
    {
        return $this->assertDoesNotMatchRegularExpression(self::checkedRegex($id, $field, $option), $html);
    }

    private function assertOptionChecked(int $id, string $field, string $option, $html)
    {
        $this->assertMatchesRegularExpression(self::checkedRegex($id, $field, $option), $html);
    }

    public function testMultiSelectWorks()
    {
        $grid = $this->getMockGrid();
        // Change the DataObject this grid should handle
        $grid->setModelClass(StubMultiFields::class);
        $grid->setList(StubMultiFields::get());

        // The DataObject to use for testing
        $record = new StubMultiFields();
        $record->ID = 100;
        $record->Title = null;

        $component = new GridFieldEditableColumns();
        $this->assertEquals(
            [ 'Title' ],
            $component->getColumnsHandled($grid)
        );

        // Ensure different option combinations work as expected
        $column = $component->getColumnContent($grid, $record, 'Title');
        $this->assertOptionNotChecked(100, 'Title', 'A', $column);
        $this->assertOptionNotChecked(100, 'Title', 'B', $column);
        $this->assertOptionNotChecked(100, 'Title', 'C', $column);

        $record->Title = 'B';
        $column = $component->getColumnContent($grid, $record, 'Title');
        $this->assertOptionNotChecked(100, 'Title', 'A', $column);
        $this->assertOptionChecked(100, 'Title', 'B', $column);
        $this->assertOptionNotChecked(100, 'Title', 'C', $column);

        $record->Title = 'B,C';
        $column = $component->getColumnContent($grid, $record, 'Title');
        $this->assertOptionNotChecked(100, 'Title', 'A', $column);
        $this->assertOptionChecked(100, 'Title', 'B', $column);
        $this->assertOptionChecked(100, 'Title', 'C', $column);

        $record->Title = 'A,B,C';
        $column = $component->getColumnContent($grid, $record, 'Title');
        $this->assertOptionChecked(100, 'Title', 'A', $column);
        $this->assertOptionChecked(100, 'Title', 'B', $column);
        $this->assertOptionChecked(100, 'Title', 'C', $column);
    }
}
