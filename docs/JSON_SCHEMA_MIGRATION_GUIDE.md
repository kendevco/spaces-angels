# JSON Schema Migration Guide

This document outlines the process for migrating data from multiple collections into JSON fields within the core `Spaces`, `Tenants`, and `Users` collections. This refactor aims to simplify the database schema, reduce migration complexities, and improve development agility.

## 1. Overview

The migration involves:
-   Consolidating data from specified collections (e.g., `Messages`, `Products`, `TenantMemberships`) into new JSON fields:
    -   `Spaces.data` (type `SpaceData`)
    -   `Tenants.jsonData` (type `TenantConfiguration`)
    -   `Users.preferences` (type `UserPreferences`)
-   Using scripts to perform the data transformation and migration.
-   Providing a rollback mechanism in case of issues.

**Core Collections Targeted:**
-   `Spaces`: Will store related business data like messages, products, orders, appointments, etc., in a `data` JSON field.
-   `Tenants`: Will store configurations like memberships, revenue settings, integrations, business settings, etc., in a `jsonData` JSON field.
-   `Users`: Will store user-specific preferences, activity logs, theme/timezone settings, etc., in a `preferences` JSON field.

## 2. Pre-Migration Steps

**CRITICAL: ALWAYS PERFORM THESE STEPS IN A STAGING/DEVELOPMENT ENVIRONMENT FIRST.**

1.  **Full Database Backup:**
    *   Before running any migration scripts, create a complete backup of your PostgreSQL database.
    *   Example command: `pg_dump -U your_username -h your_host -Fc your_database_name > backup_YYYYMMDD_before_json_migration.dump`
    *   Store this backup securely.

2.  **Code Deployment:**
    *   Ensure the latest code changes, including the new JSON field definitions in collections (`Spaces`, `Tenants`, `Users`) and the new TypeScript types (`SpaceData`, `TenantConfiguration`, `UserPreferences`), are deployed to the environment where the migration will run.
    *   The application should be stopped or in maintenance mode during the migration to prevent data inconsistencies.

3.  **Install Dependencies:**
    *   Make sure all project dependencies are installed: `pnpm install` (or your package manager's equivalent).

4.  **Environment Variables:**
    *   Verify that your `.env` file is correctly configured with the necessary database connection details (`DATABASE_URI`) and any other required variables for Payload to initialize.

5.  **Review Migration Scripts:**
    *   Thoroughly review the `scripts/migrate-to-json-schema.ts` and `scripts/rollback-json-migration.ts` scripts. Understand what data transformations they will perform.

## 3. Running the Migration Script

1.  **Navigate to Project Root:**
    *   Open your terminal and change to the root directory of the project.

2.  **Execute the Migration Script:**
    *   Run the script using ts-node (or after compiling to JavaScript):
        ```bash
        npx ts-node ./scripts/migrate-to-json-schema.ts
        ```
    *   Alternatively, if you have a script defined in `package.json` (e.g., `pnpm run migrate:json`), use that.

3.  **Monitor Output:**
    *   The script will log its progress, including which collections and documents it's processing.
    *   Watch for any errors or warnings. Address any critical errors immediately.

4.  **Duration:**
    *   The migration time will depend on the volume of data in your database. For large datasets, it might take a significant amount of time.

## 4. Post-Migration Verification

1.  **Check Script Logs:**
    *   Review the complete output from the migration script for any reported errors or summaries.

2.  **Inspect Data in Admin UI (if accessible):**
    *   Log in to the Payload Admin UI.
    *   Navigate to a few `Spaces`, `Tenants`, and `Users` documents.
    *   Check the new JSON fields (`data`, `jsonData`, `preferences`) to see if they are populated as expected.
    *   Compare the data in the JSON fields with data from the original collections to ensure accuracy.

3.  **Database Queries:**
    *   Connect to your PostgreSQL database.
    *   Run queries to inspect the new JSON fields directly.
        *   Example for Spaces: `SELECT id, "data" FROM spaces LIMIT 10;`
        *   Example for Tenants: `SELECT id, "jsonData" FROM tenants LIMIT 10;`
        *   Example for Users: `SELECT id, "preferences" FROM users LIMIT 10;`
    *   Verify that data from source collections now resides within these JSON structures.

4.  **Test Application Functionality:**
    *   If the application was stopped, restart it.
    *   Thoroughly test all parts of the application that rely on the migrated data. This includes:
        *   Displaying messages, products, orders within spaces.
        *   Tenant-specific configurations and user memberships.
        *   User preferences and any features using activity logs.
        *   API endpoints that now need to query JSON fields.

5.  **Query Performance:**
    *   Pay attention to the performance of queries involving the new JSON fields.
    *   Identify any slow queries and plan for optimization (e.g., using appropriate PostgreSQL JSON operators and indexes if necessary). The `src/utilities/json-query-helpers.ts` will be relevant here.

## 5. Running the Rollback Script (If Necessary)

**IMPORTANT: Only run the rollback script if major issues are found after migration that cannot be easily fixed, and you decide to revert to the previous schema.**

1.  **Stop the Application:**
    *   Ensure the application is stopped or in maintenance mode.

2.  **Execute the Rollback Script:**
    *   Run the script from the project root:
        ```bash
        npx ts-node ./scripts/rollback-json-migration.ts
        ```

3.  **Monitor Output:**
    *   The script will log its progress as it attempts to move data from JSON fields back to original collections or fields.

4.  **Post-Rollback Verification:**
    *   Verify that data has been restored to the original collections/fields.
    *   Check that the JSON fields (`data`, `jsonData`, `preferences`) are now empty or cleared.
    *   Test application functionality to ensure it works with the old schema.

5.  **Restore from Backup (Last Resort):**
    *   If the rollback script fails or causes further issues, restore the database from the backup created in the pre-migration steps.
    *   Example command: `pg_restore -U your_username -h your_host -d your_database_name -C your_backup_file.dump`

## 6. Next Steps (Post-Successful Migration)

Once the migration is successful and verified:

1.  **Update Application Code:**
    *   Refactor all API endpoints, services, and frontend components to read from and write to the new JSON fields.
    *   Implement efficient querying strategies for JSON data using `src/utilities/json-query-helpers.ts`.

2.  **Data Integrity Checks:**
    *   Perform more extensive data integrity checks.

3.  **Collection Cleanup (Phase 4 of original plan):**
    *   After a period of stability and ensuring all parts of the application use the new JSON fields, plan for the removal of the old, now obsolete, collections. This involves:
        *   Deleting collection definition files from `src/collections/`.
        *   Removing them from `payload.config.ts`.
        *   Creating a new database migration (Payload or manual) to drop the old tables from the database.
        *   Cleaning up any unused imports, types, and API routes related to the old collections.

4.  **Update Documentation:**
    *   Update all relevant developer documentation to reflect the new schema and data access patterns.

This guide provides the initial steps. The migration and rollback scripts are placeholders and will need detailed implementation of transformation logic specific to each collection and field being migrated.
