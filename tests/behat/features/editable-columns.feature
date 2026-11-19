Feature: Clicking rows of a GridField with editable columns
As a content editor
I want a click on a field of an editable row to keep me on the form
And a click elsewhere in the row to open the record

  Background:
    Given I add an extension "Symbiote\GridFieldExtensions\Tests\Stub\Extension\EditableColumnsExtension" to the "SilverStripe\FrameworkTest\Model\Company" class without dev-build
    And there are the following SilverStripe\FrameworkTest\Model\Employee records
    """
    employee1:
      Name: "Adam"
      Email: "adam@example.com"
    employee2:
      Name: "Jim"
      Email: "jim@example.com"
    """
    And there are the following SilverStripe\FrameworkTest\Model\Company records
    """
    company-1:
      Name: "Company One"
      Employees:
        - =>SilverStripe\FrameworkTest\Model\Employee.employee1
        - =>SilverStripe\FrameworkTest\Model\Employee.employee2
    """
    And the "group" "EDITOR" has permissions "Access to 'Pages' section" and "Access to 'GridField Test Navigation' section" and "TEST_DATAOBJECT_EDIT"
    And I am logged in as a member of "EDITOR" group
    And I go to "/admin/gridfield-test-navigation"
    And I click "Company One" in the "#Form_EditForm" element
    And I click the "Employees" CMS tab

  Scenario: Clicking an input or its label keeps the company form open
    When I click on the "#Form_ItemEditForm_Employees .ss-gridfield-item.first .col-Name input" element
    And I click on the "#Form_ItemEditForm_Employees .ss-gridfield-item.first .custom-markup-label" element
    And I wait for 2 seconds
    Then I should see "Company One" in the ".breadcrumbs-wrapper" element
    And I should not see "Adam" in the ".breadcrumbs-wrapper" element
    And I should see "Custom markup" in the "#Form_ItemEditForm_Employees" element

  Scenario: Clicking custom markup inside an editable cell keeps the company form open
    When I click on the "#Form_ItemEditForm_Employees .ss-gridfield-item.first .custom-markup-widget" element
    And I wait for 2 seconds
    Then I should not see "Adam" in the ".breadcrumbs-wrapper" element
    And I should see "Custom markup" in the "#Form_ItemEditForm_Employees" element

  Scenario: Clicking a table nested inside an editable cell keeps the company form open
    When I click on the "#Form_ItemEditForm_Employees .ss-gridfield-item.first .custom-markup-table-content" element
    And I wait for 2 seconds
    Then I should not see "Adam" in the ".breadcrumbs-wrapper" element
    And I should see "Custom markup" in the "#Form_ItemEditForm_Employees" element

  Scenario: Clicking the action menu keeps the company form open
    When I click on the "#Form_ItemEditForm_Employees .ss-gridfield-item.first button[aria-label='View actions']" element
    And I wait for 2 seconds
    Then I should not see "Adam" in the ".breadcrumbs-wrapper" element
    And I should see "Custom markup" in the "#Form_ItemEditForm_Employees" element

  Scenario: Clicking a cell without an editable field opens the employee
    When I click on the "#Form_ItemEditForm_Employees .ss-gridfield-item.first .col-ID" element
    Then I should see "Adam" in the ".breadcrumbs-wrapper" element
    And the "Name" field should contain "Adam"
