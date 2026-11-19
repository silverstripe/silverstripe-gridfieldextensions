Feature: Clicking rows of a nested GridField with editable columns
As a content editor
I want a click on a field of an editable nested row to keep me on the list
And a click elsewhere in the nested row to open the nested record

  Background:
    Given I add an extension "Symbiote\GridFieldExtensions\Tests\Stub\Extension\EditableColumnsExtension" to the "SilverStripe\FrameworkTest\Fields\NestedGridField\RootNode" class
    And there are the following SilverStripe\FrameworkTest\Fields\NestedGridField\BranchNode records
    """
    branch-node-1:
      Name: "Branch Node One"
      Category: "A"
    branch-node-2:
      Name: "Branch Node Two"
      Category: "B"
    """
    And there are the following SilverStripe\FrameworkTest\Fields\NestedGridField\RootNode records
    """
    root-node-1:
      Name: "Root Node One"
      BranchNodes:
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\BranchNode.branch-node-1
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\BranchNode.branch-node-2
    """
    And the "group" "EDITOR" has permissions "Access to 'Pages' section" and "Access to 'Nested GridField Section' section" and "TEST_DATAOBJECT_EDIT"
    And I am logged in as a member of "EDITOR" group
    And I go to "/admin/nested-gridfield-section"
    And I click on the ".ss-gridfield-item.first.odd button" element
    And I wait until I see the ".nested-gridfield.odd .ss-gridfield-item.first .col-Name input" element

  Scenario: Clicking an input in the nested GridField opens neither row
    When I click on the ".nested-gridfield.odd .ss-gridfield-item.first .col-Name input" element
    And I wait for 2 seconds
    Then I should not see "Root Node One" in the ".breadcrumbs-wrapper" element
    And I should see "Custom markup" in the ".nested-gridfield.odd" element

  Scenario: Clicking a table nested inside an editable cell of the nested GridField opens neither row
    When I click on the ".nested-gridfield.odd .ss-gridfield-item.first .custom-markup-table-content" element
    And I wait for 2 seconds
    Then I should not see "Root Node One" in the ".breadcrumbs-wrapper" element
    And I should see "Custom markup" in the ".nested-gridfield.odd" element

  Scenario: Clicking a cell without an editable field opens the nested record
    When I click on the ".nested-gridfield.odd .ss-gridfield-item.first .col-ID" element
    Then I should see "Branch Node One" in the ".breadcrumbs-wrapper" element
    And the "Name" field should contain "Branch Node One"
