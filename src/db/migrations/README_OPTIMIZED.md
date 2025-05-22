# Optimized Database Migration Scripts

This directory contains consolidated SQL scripts to set up and maintain the database schema for the Church CMS application. These scripts have been optimized and consolidated from the original migration files to reduce redundancy and improve maintainability.

## Consolidated Migration Files Overview

- `consolidated_core_tables.sql`: Creates all core tables (church_info, members, departments, etc.)
- `consolidated_messaging_tables.sql`: Creates all messaging-related tables and policies
- `consolidated_budget_expenditure.sql`: Sets up budget-expenditure integration
- `consolidated_indexes.sql`: Adds performance-enhancing indexes to all tables

## Setting Up the Database

To set up the database, follow these steps:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following scripts in order:

### 1. Create Core Tables

Run the `consolidated_core_tables.sql` script to create all the core tables and set up RLS policies.

### 2. Set Up Messaging Tables

Run the `consolidated_messaging_tables.sql` script to create all messaging-related tables and policies.

### 3. Set Up Budget-Expenditure Integration

Run the `consolidated_budget_expenditure.sql` script to set up the budget-expenditure integration.

### 4. Add Performance Indexes

Run the `consolidated_indexes.sql` script to add performance-enhancing indexes to all tables.

## Automated Migration

You can also use the automated migration script to apply all migrations in the correct order:

```bash
npm run migrate
```

## Migration Order and Dependencies

The consolidated migration files should be applied in the following order:

1. `consolidated_core_tables.sql` - Creates the base tables needed by other migrations
2. `consolidated_messaging_tables.sql` - Depends on members table from core tables
3. `consolidated_budget_expenditure.sql` - Depends on accounts table from core tables
4. `consolidated_indexes.sql` - Should be run last after all tables are created

## Troubleshooting

If you encounter any issues with the database functionality:

1. Check the browser console for specific error messages
2. Verify that all migration scripts have been applied successfully
3. Make sure your Supabase project has the necessary permissions

### Common Issues and Solutions

#### Missing Tables or Columns

If you're experiencing issues with missing tables or columns, run the appropriate consolidated migration script.

#### Row Level Security Issues

If you're experiencing permission issues, make sure the RLS policies have been properly applied. You can check this in the Supabase dashboard under Authentication > Policies.

#### Performance Issues

If you're experiencing performance issues, make sure the `consolidated_indexes.sql` script has been run to add performance-enhancing indexes to the database tables.

## Legacy Migration Files

The following legacy migration files have been consolidated and are kept for reference only:

- `create_settings_tables.sql` → Now part of `consolidated_core_tables.sql`
- `ensure_profiles_table.sql` → Now part of `consolidated_core_tables.sql`
- `add_profile_image_column.sql` → Now part of `consolidated_core_tables.sql`
- `create_events_tables.sql` → Now part of `consolidated_core_tables.sql`
- `create_messaging_tables.sql` → Now part of `consolidated_messaging_tables.sql`
- `create_messaging_config_tables.sql` → Now part of `consolidated_messaging_tables.sql`
- `setup_rls_policies.sql` → Now part of respective consolidated files
- `add_account_id_to_budget_items.sql` → Now part of `consolidated_budget_expenditure.sql`
- `add_budget_item_id_to_expenditures.sql` → Now part of `consolidated_budget_expenditure.sql`
- `direct_migration.sql` → Now part of `consolidated_budget_expenditure.sql`
- `direct_sql_editor_migration.sql` → Now part of `consolidated_budget_expenditure.sql`
- `optimized_indexes.sql` → Now part of `consolidated_indexes.sql`

## Future Migrations

When adding new migrations, consider whether they can be added to one of the existing consolidated files or if a new consolidated file should be created.
