Feature: Using Nested GridField with hierarchical relational data
As a content editor
I want to see all children of hierarchical relational data in nested GridField

  Background:
    Given I add an extension "SilverStripe\FrameworkTest\Fields\NestedGridField\SecurityAdminExtension" to the "SilverStripe\Admin\SecurityAdmin" class
    And I add an extension "SilverStripe\BehatExtension\Extensions\ActivateSudoModeServiceExtension" to the "SilverStripe\Security\SudoMode\SudoModeService" class
    And there are the following SilverStripe\Security\Member records
    """
    Adam:
      Name: "Smith"
    Jim:
      Name: "Morrison"
    Tom:
      Name: "Ford"
    James:
      Name: "Dean"
    """
    Given there are the following SilverStripe\Security\Group records
    """
    group-1:
      Title: "Group One"
      Members:
        - =>SilverStripe\Security\Member.Adam
        - =>SilverStripe\Security\Member.Jim
        - =>SilverStripe\Security\Member.Tom
        - =>SilverStripe\Security\Member.James
    group-2:
      Title: "Group Two"
    """
    And I go to "/dev/build?flush"
    And the "group" "EDITOR" has permissions "Access to 'Pages' section" and "Access to 'Security' section"
    And I am logged in as a member of "EDITOR" group
    And I go to "/admin/security/groups"

  Scenario: I want to see all items in nested GridField
    Given I should see "Group One" in the ".ss-gridfield-item:nth-of-type(1)" element
      And I should see "Group Two" in the ".ss-gridfield-item:nth-of-type(2)" element
      When I click on the ".ss-gridfield-item.first.odd button" element
      And I wait until I see the ".nested-gridfield.odd .ss-gridfield-item" element
      And I should see "Adam" in the ".nested-gridfield.odd" element
      And I should see "Jim" in the ".nested-gridfield.odd" element
      And I should see "Tom" in the ".nested-gridfield.odd" element
      And I should see "James" in the ".nested-gridfield.odd" element

  Scenario: I want to edit and delete items in nested GridField
    Given I should see "Group One" in the ".ss-gridfield-item:nth-of-type(1)" element
      When I click on the ".ss-gridfield-item:nth-of-type(1) button" element
      And I wait until I see the ".nested-gridfield.odd .ss-gridfield-item" element
      Then I click on the ".nested-gridfield.odd button[value='First Name']" element
      And I should see "Adam" in the ".nested-gridfield.odd .ss-gridfield-item.first.odd" element
      And I should see "James" in the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(2)" element
      And I should see "Jim" in the ".nested-gridfield.odd .ss-gridfield-item:nth-of-type(3)" element
      And I should see "Tom" in the ".nested-gridfield.odd .ss-gridfield-item.last.even" element
      When I click on the ".nested-gridfield.odd .ss-gridfield-item.first.odd" element
      And I fill in "Name" with "John"
      And I fill in "Email" with "john@example.com"
      And I press the "Save" button
      Then I click on the ".toolbar__back-button" element
      Then I click on the ".nested-gridfield.odd button[value='Surname']" element
      And I should see "James" in the ".nested-gridfield.odd .ss-gridfield-item.first.odd" element
      And I should see "John" in the ".nested-gridfield.odd .ss-gridfield-item.last.even" element
      And I click on the ".nested-gridfield.odd .ss-gridfield-item.last.even button[aria-label='View actions']" element
      And I click on the ".nested-gridfield.odd .ss-gridfield-item.last.even button.action--delete" element, confirming the dialog
      And I wait for 2 seconds
      And I should not see "John"
