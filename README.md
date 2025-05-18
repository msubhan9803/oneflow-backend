TASK LIST:

[Frontend]
1. Disable lat and long fields when there’s a value in the street address field.
2. Remove in use filter from jobsite dropdown in "Schedule Test" screen
3. Now valid until date will be received from backend
4. Change text of valid until date to ‘Testing required’. Once they have passed their valid until date.
    1. E.g VALID UNTIL: TESTING REQUIRED. Testing required should be a link that takes them to the schedule test page.

5. Schedule Test Screen:
    Make disclaimer text more legible for:
    1. Rush emergency fee
    2. Terms and conditions subtext

6. Status Check Screen
    1. Change status checker message from ‘more texts required’  to ‘Repairs needed’

7. Hide "JOBSITES IN USE" from Jobsite list screen 
8. Update the description of Auto-renew in Jobsite Add view to "This option will auto-renew test scheduled with this jobsite"
10. Change STATUS to Actions in Jobsites list view


11. Add a customer (toast message)
    - Change create customer toast message from ‘something went wrong’ to something more specific. It should say, ‘Email already in use’.




[Backend]
[Jobsite auto-renew (ON)]
1. If valid until date is Sep 15, 2024, user gets an email on the 5th, then the card on file is charged on the 10th. Then the backflow team would services the jobsite on the 15th.
2. They get an email auto-reminder 5 day out with details about them getting charged for their back flow. Include the price details for the service and ask them if anything has changed. (Based on valid until date)
3. 5 days later charge them for the test. Then a week after the technician will test it.

Jobsite auto-renew (OFF)
1. Send them an email reminder 7 days before the valid until date expires. In the email, include a button that links to the schedule test screen within the app.

All jobsites view
1. Revise jobsite ‘In use’ functionality. You should be able to schedule requests multiple times/year so Remove ‘in use’ status. 
2. Add valid until date field in scheduled test which is 1 year after.
3. You should be able to schedule multiple tests for the same jobsite.

Pricing
1. Confirmed creating a base price, then defining the individual price for each backflow set. Eg, 2 backflows ($X), 3 backflows ($X), etc.
2. Pricing schema for each county in admin settings
3. Create API: getCostCalculation - county, numberOfBackflow test





[Bothends]
1. Confirming a request
    The dates don’t transfer to Teamup correctly. check timezone.