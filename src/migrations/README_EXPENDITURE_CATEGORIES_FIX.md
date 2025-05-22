# Expenditure Categories Fix

This document provides instructions for fixing issues with expenditure categories, specifically:

1. Consolidating budget-specific categories into a single "Budget Allocation" category
2. Ensuring the "Liability Payment" category exists and is used correctly
3. Installing the `make_liability_payment` database function

## Issue Description

The system was creating individual categories for each budget (e.g., "Budget allocation for Test budget") instead of using a single standard category. Additionally, the "Liability Payment" category was either missing or not being used correctly for liability payments.

## Solution Overview

The solution consists of three parts:

1. **SQL Script**: A comprehensive SQL script to fix the expenditure categories in the database
2. **Database Function**: A new `make_liability_payment` function to handle liability payments correctly
3. **Code Fix**: An update to the `use-liability-mutations.ts` file to use the correct category for liability payments

## Step 1: Run the SQL Script to Fix Categories

The `fix_expenditure_categories_manual.sql` script will:

- Ensure the standard "Budget Allocation" category exists
- Ensure the standard "Liability Payment" category exists
- Update all budget-related expenditure entries to use the standard "Budget Allocation" category
- Update all liability payment entries to use the standard "Liability Payment" category
- Remove redundant budget-specific categories that aren't in use
- Verify the changes

To run the script:

1. Go to the Supabase SQL Editor
2. Copy and paste the contents of `src/migrations/fix_expenditure_categories_manual.sql`
3. Run the script
4. Check the output for any errors or warnings

## Step 2: Install the Database Function

The `make_liability_payment` function handles liability payments correctly by:

- Updating the liability entry with the new payment amount
- Creating an expenditure entry for the payment using the standard "Liability Payment" category
- Updating the account balance if an account is specified
- Returning the updated liability entry

To install the function:

### Option 1: Using the Installation Script

1. Run the following command:
   ```
   node src/db/scripts/install_liability_functions.js
   ```

2. Check the output for any errors or warnings

### Option 2: Manual Installation

1. Go to the Supabase SQL Editor
2. Copy and paste the contents of `src/db/functions/make_liability_payment.sql`
3. Run the script
4. Verify the function was created by running:
   ```sql
   SELECT routine_name, routine_type 
   FROM information_schema.routines 
   WHERE routine_name = 'make_liability_payment' 
   AND routine_type = 'FUNCTION';
   ```

## Step 3: Verify the Fix

After applying the fixes, you should:

1. Check the Expense Categories settings page to verify:
   - The "Budget Allocation" category exists
   - The "Liability Payment" category exists
   - No budget-specific categories remain (e.g., "Budget allocation for Test budget")

2. Test creating a new liability payment to verify it uses the correct category

3. Test creating a new budget allocation to verify it uses the correct category

## Troubleshooting

If you encounter issues:

### Categories Still Appearing

If budget-specific categories are still appearing:

1. Check if they're still in use by running:
   ```sql
   SELECT ec.name, COUNT(ee.id) as usage_count
   FROM expenditure_categories ec
   LEFT JOIN expenditure_entries ee ON ec.id = ee.category_id
   WHERE ec.name LIKE 'Budget allocation for %'
   GROUP BY ec.name
   ORDER BY usage_count DESC;
   ```

2. If they're in use, update the entries to use the standard category:
   ```sql
   WITH budget_category AS (
     SELECT id FROM expenditure_categories WHERE name = 'Budget Allocation'
   )
   UPDATE expenditure_entries
   SET category_id = (SELECT id FROM budget_category)
   WHERE category_id IN (
     SELECT id FROM expenditure_categories WHERE name LIKE 'Budget allocation for %'
   );
   ```

3. Then delete the unused categories:
   ```sql
   DELETE FROM expenditure_categories
   WHERE name LIKE 'Budget allocation for %'
   AND id NOT IN (
     SELECT DISTINCT category_id 
     FROM expenditure_entries 
     WHERE category_id IS NOT NULL
   );
   ```

### Liability Payment Category Missing

If the "Liability Payment" category is missing:

1. Create it manually:
   ```sql
   INSERT INTO expenditure_categories (
     name, 
     description, 
     created_at, 
     updated_at
   ) VALUES (
     'Liability Payment',
     'System category for liability payments',
     NOW(),
     NOW()
   );
   ```

### Database Function Not Working

If the `make_liability_payment` function isn't working:

1. Check if it exists:
   ```sql
   SELECT routine_name, routine_type 
   FROM information_schema.routines 
   WHERE routine_name = 'make_liability_payment' 
   AND routine_type = 'FUNCTION';
   ```

2. If it doesn't exist, install it using the steps in "Step 2: Install the Database Function"

3. If it exists but isn't working, check for errors in the server logs

## Conclusion

These fixes should ensure that:

1. All budget-related expenditure entries use the standard "Budget Allocation" category
2. All liability payment entries use the standard "Liability Payment" category
3. The `make_liability_payment` function handles liability payments correctly

If you continue to experience issues, please check the server logs for more detailed error messages.
