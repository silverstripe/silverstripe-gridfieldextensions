Feature: Using Nested GridField with non-hierarchical relational data
As a content editor
I want to see all children of non-hierarchical relational data in nested GridField

  Background:
    Given there are the following SilverStripe\FrameworkTest\Fields\NestedGridField\LeafNode records
    """
    leaf-node-1:
      Name: "Leaf Node One"
      Category: "A"
    leaf-node-2:
      Name: "Leaf Node Two"
      Category: "D"
    leaf-node-3:
      Name: "Leaf Node Three"
      Category: "C"
    leaf-node-4:
      Name: "Leaf Node Four"
      Category: "B"
    """
    Given there are the following SilverStripe\FrameworkTest\Fields\NestedGridField\BranchNode records
    """
    branch-node-1:
      Name: "Branch Node One"
      Category: "D"
      LeafNodes:
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\LeafNode.leaf-node-1
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\LeafNode.leaf-node-2
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\LeafNode.leaf-node-3
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\LeafNode.leaf-node-4
    branch-node-2:
      Name: "Branch Node Two"
      Category: "C"
    branch-node-3:
      Name: "Branch Node Three"
      Category: "B"
    branch-node-4:
      Name: "Branch Node Four"
      Category: "A"
    """
    And there are the following SilverStripe\FrameworkTest\Fields\NestedGridField\RootNode records
    """
    root-node-1:
      Name: "Root Node One"
      BranchNodes:
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\BranchNode.branch-node-1
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\BranchNode.branch-node-2
    root-node-2:
      Name: "Root Node Two"
      BranchNodes:
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\BranchNode.branch-node-3
        - =>SilverStripe\FrameworkTest\Fields\NestedGridField\BranchNode.branch-node-4
    """
    And there are the following SilverStripe\FrameworkTest\Fields\NestedGridField\NonRelationalData records
    """
    data-1:
      Name: "Data Set 1"
    """
    And I go to "/dev/build?flush"
    And the "group" "EDITOR" has permissions "Access to 'Pages' section" and "Access to 'Nested GridField Section' section" and "Access to 'Security' section"and "TEST_DATAOBJECT_EDIT"
    And I am logged in as a member of "EDITOR" group
    And I go to "/admin/nested-gridfield-section"

  Scenario: I want to see all items in nested GridField
    Given I should see "Root Node One" in the ".ss-gridfield-item.first.odd" element
      And I should see "Root Node Two" in the ".ss-gridfield-item.last.even" element
      When I click on the ".ss-gridfield-item.first.odd button" element
      And I wait until I see the ".nested-gridfield.odd .ss-gridfield-item" element
      And I should see "Branch Node One" in the ".nested-gridfield.odd" element
      And I should see "Branch Node Two" in the ".nested-gridfield.odd" element
      When I click on the ".nested-gridfield.odd .ss-gridfield-items button" element
      And I wait until I see the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:not(.loading)" element
      And I should see "Leaf Node One" in the ".nested-gridfield.odd" element
      And I should see "Leaf Node Two" in the ".nested-gridfield.odd" element
      And I should see "Leaf Node Three" in the ".nested-gridfield.odd" element
      And I should see "Leaf Node Four" in the ".nested-gridfield.odd" element

  Scenario: I want to edit and delete items in nested GridField
    Given I should see "Root Node Two" in the ".ss-gridfield-item.last.even" element
      When I click on the ".ss-gridfield-item.last.even button" element
      And I wait until I see the ".nested-gridfield.even .ss-gridfield-item" element
      And I should see "Branch Node Three" in the ".nested-gridfield.even .ss-gridfield-item.first.odd" element
      And I should see "Branch Node Four" in the ".nested-gridfield.even .ss-gridfield-item.last.even" element
      When I click on the ".nested-gridfield.even .ss-gridfield-item.first.odd" element
      And I fill in "Name" with "New Branch Node"
      And I press the "Save" button
      Then I click on the ".toolbar__back-button" element
      And I should see "New Branch Node" in the ".nested-gridfield.even .ss-gridfield-item.first.odd" element
      And I should see "Branch Node Four" in the ".nested-gridfield.even .ss-gridfield-item.last.even" element
      And I click on the ".nested-gridfield.even .ss-gridfield-item.last.even button[aria-label='View actions']" element
      And I click on the ".nested-gridfield.even .ss-gridfield-item.last.even button.action--delete" element, confirming the dialog
      And I should see "New Branch Node" in the ".nested-gridfield.even .ss-gridfield-item.first.odd" element
      And I should not see "Branch Node Four"

  Scenario: I can to sort items in nested GridField
    Given I should see "Root Node One" in the ".ss-gridfield-item.first.odd" element
      And I should see "Root Node Two" in the ".ss-gridfield-item.last.even" element
      When I click on the ".ss-gridfield-item.first.odd button" element
      And I wait until I see the ".nested-gridfield.odd .ss-gridfield-item" element
      And I should see "Branch Node One" in the ".nested-gridfield.odd .ss-gridfield-item.first.odd" element
      And I should see "Branch Node Two" in the ".nested-gridfield.odd .ss-gridfield-item.last.even" element
      Then I click on the ".nested-gridfield.odd button[value='Category']" element
      And I should see "Branch Node Two" in the ".nested-gridfield.odd .ss-gridfield-item.first.odd" element
      And I should see "Branch Node One" in the ".nested-gridfield.odd .ss-gridfield-item.last.even" element
      When I click on the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(2) button" element
      And I wait until I see the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:not(.loading)" element
      And I should see "Leaf Node One" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:nth-of-type(1)" element
      And I should see "Leaf Node Two" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:nth-of-type(2)" element
      And I should see "Leaf Node Three" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:nth-of-type(3)" element
      And I should see "Leaf Node Four" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:nth-of-type(4)" element
      ## Category: Leaf Node 1 -> A, Leaf Node 4 -> B, Leaf Node 3 -> C, Leaf Node 4 -> D
      ## First request returns ASC order   
      Then I click on the ".nested-gridfield.odd .nested-gridfield button[value='Category']" element
      And I should see "Leaf Node One" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item.first.odd" element
      And I should see "Leaf Node Four" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:nth-of-type(2)" element
      And I should see "Leaf Node Three" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:nth-of-type(3)" element
      And I should see "Leaf Node Two" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item.last.even" element
      ## Second request returns DESC order 
      And I click on the ".nested-gridfield.odd .nested-gridfield button[value='Category']" element
      And I should see "Leaf Node Two" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item.first.odd" element
      And I should see "Leaf Node Three" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:nth-of-type(2)" element
      And I should see "Leaf Node Four" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item:nth-of-type(3)" element
      And I should see "Leaf Node One" in the ".nested-gridfield.odd .nested-gridfield .ss-gridfield-item.last.even" element

  Scenario: I can to filter items in nested GridField
    Given I should see "Root Node One" in the ".ss-gridfield-item.first.odd" element
      When I click on the ".ss-gridfield-item.first.odd button" element
      And I wait until I see the ".nested-gridfield.odd .ss-gridfield-item" element
      And I should see "Branch Node One" in the ".nested-gridfield.odd .ss-gridfield-item.first.odd" element
      And I should see "Branch Node Two" in the ".nested-gridfield.odd .ss-gridfield-item.last.even" element
      Then I click on the ".nested-gridfield.odd button[title='Open search and filter']" element
      Then I click on the ".nested-gridfield.odd button[title='Advanced']" element
      And I fill in "Search__Name" with "One"
      And I press the "Search" button
      And I should see "Branch Node One" in the ".nested-gridfield.odd .ss-gridfield-item.first.odd" element
      And I should not see "Branch Node Two"

Scenario: I want to see all non-relational data in nested GridField
    Given I go to "/admin/nested-gridfield-section/non-relational-data"
      And I should see "Data Set 1" in the ".ss-gridfield-item.first.odd" element
      When I click on the ".ss-gridfield-item:nth-of-type(1) button" element
      And I wait until I see the ".nested-gridfield.odd .ss-gridfield-item" element
      Then I should see "Walmart" in the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(1)" element
      And I should see "ExxonMobil" in the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(2)" element
      And I should see "Royal Dutch Shell" in the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(3)" element
      And I should see "BP" in the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(4)" element
      And I should see "Sinopec" in the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(5)" element
      Then I click on the ".nested-gridfield.odd button[value='Name']" element
      Then I should see "BP" in the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(1)" element
      And I should see "Walmart" in the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(5)" element
