// scripts/migrate-to-json-schema.ts
import payload from 'payload';
import { initPayload } from '../src/payload'; // Adjust path as necessary
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../.env'), // Assuming .env file is in the project root
});

import { validateMigratedBatchDetails, validateOverallIntegrity } from '../src/utilities/migration-validation'; // Added import

const BATCH_SIZE = 100; // Process records in batches to manage memory

/**
 * Main migration function.
 */
async function migrate() {
  console.log('Starting JSON schema migration...');

  try {
    // Initialize Payload
    console.log('Initializing Payload...');
    await initPayload({
      express: null, // We don't need express app here
      onInit: async () => {
        console.log('Payload initialized.');

        // --- Migrate Space Data ---
        console.log('\nMigrating data to Spaces.data...');
        await migrateSpaceData();

        // --- Migrate Tenant Data ---
        console.log('\nMigrating data to Tenants.jsonData...');
        await migrateTenantData();

        // --- Migrate User Data ---
        console.log('\nMigrating data to Users.preferences...');
        await migrateUserData();

        console.log('\nMigration script completed successfully.');
      },
    });
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  } finally {
    // Ensure Payload client connection is closed if applicable, or script exits
    // Payload's default behavior might handle this, or add specific close logic if needed.
    // For long-running scripts, ensure process.exit() is called to terminate.
    process.exit(0);
  }
}

/**
 * Migrates data from various collections into the Spaces.data JSON field.
 */
async function migrateSpaceData() {
  // Collections to migrate into Spaces.data
  const collectionsToMigrate: {
    slug: string;
    targetField: keyof import('../src/types/space-data').SpaceData;
    relationField?: string; // Field in the source collection that links to a Space
  }[] = [
    { slug: 'messages', targetField: 'messages', relationField: 'space' },
    { slug: 'products', targetField: 'products', relationField: 'tenant' }, // Note: Products are related to Tenant, then Space. This needs careful handling.
                                                                            // For now, assuming we find spaces under the product's tenant.
    { slug: 'orders', targetField: 'orders', relationField: 'spaceId' }, // Assuming 'spaceId' or similar exists or can be derived.
    { slug: 'appointments', targetField: 'appointments', relationField: 'spaceId' }, // Assuming 'spaceId'
    // { slug: 'inventory', targetField: 'inventory', relationField: 'spaceId' }, // Original 'Inventory' collection not found yet.
    { slug: 'businessAgents', targetField: 'agents', relationField: 'spaceId' }, // Assuming 'BusinessAgents' collection exists and has 'spaceId'
    { slug: 'forms', targetField: 'forms', relationField: 'spaceId' }, // Assuming 'Forms' collection exists and has 'spaceId'
    { slug: 'subscriptions', targetField: 'subscriptions', relationField: 'spaceId' }, // Assuming 'Subscriptions' collection exists and has 'spaceId'
  ];

  // Iterate over all spaces
  let page = 1;
  let spacesResult;
  do {
    spacesResult = await payload.find({
      collection: 'spaces',
      limit: BATCH_SIZE,
      page,
      depth: 0, // We only need space IDs
    });

    for (const space of spacesResult.docs) {
      console.log(`Processing Space ID: ${space.id}`);
      const spaceDataUpdate: any = {}; // Using any for flexibility during migration build-up

      for (const colInfo of collectionsToMigrate) {
        try {
          if (!colInfo.relationField) {
            console.warn(`Skipping ${colInfo.slug} for Space ${space.id} due to missing relationField configuration.`);
            continue;
          }

          // Special handling for products: Products are linked to Tenants.
          // We need to find products for the tenant of the current space.
          // This is a simplified approach; real logic might be more complex if spaces don't directly own products.
          let relatedItems;
          if (colInfo.slug === 'products') {
            if (space.tenant) { // space.tenant might be an ID or an object
              const tenantId = typeof space.tenant === 'object' ? space.tenant.id : space.tenant;
              console.log(`Fetching ${colInfo.slug} for Tenant ID: ${tenantId}`);
              let relatedItemsPage = 1;
              let relatedItemsResult;
              const allRelatedItems = [];
              do {
                relatedItemsResult = await payload.find({
                  collection: colInfo.slug as any, // Cast needed as slug is string
                  where: { tenant: { equals: tenantId } },
                  limit: BATCH_SIZE, // Use BATCH_SIZE for related items as well
                  page: relatedItemsPage,
                  depth: 1, // Fetch related data if needed for transformation
                });
                allRelatedItems.push(...relatedItemsResult.docs);
                relatedItemsPage += 1;
              } while (relatedItemsResult.hasNextPage);
              relatedItems = { docs: allRelatedItems }; // Keep structure consistent
            } else {
              console.warn(`Space ${space.id} does not have a tenant. Skipping product migration for this space.`);
              relatedItems = { docs: [] };
            }
          } else {
            // Standard handling for other collections directly related to space
            console.log(`Fetching ${colInfo.slug} for Space ID: ${space.id}`);
            let relatedItemsPage = 1;
            let relatedItemsResult;
            const allRelatedItems = [];
            do {
              relatedItemsResult = await payload.find({
                collection: colInfo.slug as any,
                where: { [colInfo.relationField]: { equals: space.id } },
                limit: BATCH_SIZE, // Use BATCH_SIZE
                page: relatedItemsPage,
                depth: 1,
              });
              allRelatedItems.push(...relatedItemsResult.docs);
              relatedItemsPage += 1;
            } while (relatedItemsResult.hasNextPage);
            relatedItems = { docs: allRelatedItems }; // Keep structure consistent
          }

          if (relatedItems.docs.length > 0) {
            console.log(`Found ${relatedItems.docs.length} items in ${colInfo.slug} for Space ID: ${space.id} (across all pages)`);
            // TODO: Implement actual transformation logic from collection item to JSON structure
            // This is a placeholder transformation.
            let transformedItems: any[] = [];
            if (colInfo.slug === 'messages') {
              transformedItems = relatedItems.docs.map(msg => {
                // Basic MessageContent transformation - assumes msg.content is an object
                let newContent: any = { type: 'text', text: '' }; // Default
                if (typeof msg.content === 'object' && msg.content !== null) {
                  newContent.type = msg.content.type || 'text';
                  newContent.text = msg.content.text || msg.content.message || ''; // Example: try a few common source fields
                  newContent.widgetId = msg.content.widgetId;
                  newContent.systemEvent = msg.content.systemEvent;
                  newContent.actionName = msg.content.actionName;
                  newContent.mediaUrl = msg.content.mediaUrl;
                  newContent.caption = msg.content.caption;
                } else if (typeof msg.content === 'string') {
                  newContent.text = msg.content;
                }

                const reactionsTransformed: Record<string, string[]> = {};
                if (typeof msg.reactions === 'object' && msg.reactions !== null) {
                  // Assuming msg.reactions is already Record<string, string[]>
                  // or needs simple transformation. For example, if it's [{ emoji: "👍", users: ["id1"] }]
                  if (Array.isArray(msg.reactions)) {
                     msg.reactions.forEach((r: any) => {
                       if (r.emoji && Array.isArray(r.users)) {
                         reactionsTransformed[r.emoji] = r.users.map(u => typeof u === 'object' ? u.id : u);
                       }
                     });
                  } else { // Assuming it's already Record<string, UserID[]>
                    for (const emoji in msg.reactions) {
                      reactionsTransformed[emoji] = (msg.reactions[emoji] || []).map((u:any) => typeof u === 'object' ? u.id : u);
                    }
                  }
                }


                return {
                  id: msg.id,
                  content: newContent,
                  sender: typeof msg.sender === 'object' && msg.sender !== null ? msg.sender.id : msg.sender,
                  timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(), // Ensure ISO string
                  messageType: msg.messageType,
                  priority: msg.priority,
                  threadId: msg.threadId,
                  replyToId: typeof msg.replyToId === 'object' && msg.replyToId !== null ? msg.replyToId.id : msg.replyToId,
                  reactions: reactionsTransformed,
                  readBy: Array.isArray(msg.readBy) ? msg.readBy.map((user: any) => (typeof user === 'object' ? user.id : user)) : [],
                  isPinned: msg.isPinned || false,
                  attachments: Array.isArray(msg.attachments) ? msg.attachments.map((att: any) => ({
                    name: att.filename || 'attachment',
                    url: att.url,
                    type: att.mimeType || 'application/octet-stream',
                  })) : [],
                };
              });
            } else {
              // Fallback for other collections (placeholder)
              transformedItems = relatedItems.docs.map(item => ({
                id: item.id,
                ...item, // Spread existing fields, then refine based on target JSON structure
                // TODO: Actual transformation logic here based on SpaceData types for other collections
              }));
            }
            spaceDataUpdate[colInfo.targetField] = transformedItems;

            // Placeholder for progressive validation call
            console.log(`[Migration] Would call validateMigratedBatchDetails for Space ID ${space.id}, batch of ${colInfo.slug} (count: ${transformedItems.length}) here.`);
            // await validateMigratedBatchDetails('spaces', relatedItemsPage -1, relatedItems.docs, space, colInfo.targetField);
            // Note: validateMigratedBatchDetails expects the parent item (space) to already have the jsonData for comparison.
            // This means validation might be better suited *after* the update, or the validation function needs raw transformed data.
            // For now, this is a logging placeholder. The actual call to validateMigratedBatchDetails would need careful placement.

          } else {
            spaceDataUpdate[colInfo.targetField] = [];
          }
        } catch (error) {
          // Check if the error is due to the collection not existing
          if (error.message && error.message.includes(`Collection with slug '${colInfo.slug}' not found`)) {
            console.warn(`Collection ${colInfo.slug} not found. Skipping migration for this collection.`);
            spaceDataUpdate[colInfo.targetField] = [];
          } else {
            console.error(`Error fetching ${colInfo.slug} for Space ${space.id}:`, error);
          }
        }
      }

      if (Object.keys(spaceDataUpdate).length > 0) {
        try {
          console.log(`Updating Space ID: ${space.id} with new data...`);
          await payload.update({
            collection: 'spaces',
            id: space.id,
            data: {
              data: spaceDataUpdate, // Assuming 'data' is the JSON field in Spaces
            },
          });
          console.log(`Successfully updated Space ID: ${space.id}`);
        } catch (error) {
          console.error(`Error updating Space ${space.id}:`, error);
        }
      } else {
        console.log(`No data to migrate for Space ID: ${space.id}`);
      }
    }
    page += 1;
  } while (spacesResult.hasNextPage);

  console.log('Space data migration step finished.');
}


/**
 * Migrates data from various collections into the Tenants.jsonData JSON field.
 */
async function migrateTenantData() {
  // Collections/data to migrate into Tenants.jsonData
  const dataSources: {
    sourceCollection?: string; // Slug of the source collection
    targetField: keyof import('../src/types/tenant-configuration').TenantConfiguration;
    relationField?: string; // Field in the source collection that links to a Tenant
    isGroupField?: boolean; // True if the source is a group field within Tenants collection itself
    sourceFieldName?: string; // Name of the group field in Tenants collection
  }[] = [
    { sourceCollection: 'tenantMemberships', targetField: 'memberships', relationField: 'tenant' },
    // For 'RevenueSharing', 'Integrations' - these might be direct fields or groups within Tenant collection.
    // The plan indicates they are collections to be moved.
    // If they are existing collections:
    // { sourceCollection: 'revenueSharing', targetField: 'revenue', relationField: 'tenant' },
    // { sourceCollection: 'integrations', targetField: 'integrations', relationField: 'tenant' },
    // If they are existing group fields within Tenants collection:
    { isGroupField: true, sourceFieldName: 'revenueSharing', targetField: 'revenue' },
    { isGroupField: true, sourceFieldName: 'referralProgram', targetField: 'referralProgram' },
    { isGroupField: true, sourceFieldName: 'limits', targetField: 'limits' },
    { isGroupField: true, sourceFieldName: 'features', targetField: 'features' },
    { isGroupField: true, sourceFieldName: 'configuration', targetField: 'businessSettings' }, // Tenant.configuration group to TenantConfiguration.businessSettings
  ];

  let page = 1;
  let tenantsResult;
  do {
    tenantsResult = await payload.find({
      collection: 'tenants',
      limit: BATCH_SIZE,
      page,
      depth: 1, // Fetch related data if needed, and group fields
    });

    for (const tenant of tenantsResult.docs) {
      console.log(`Processing Tenant ID: ${tenant.id}`);
      const tenantJsonDataUpdate: any = {};

      for (const ds of dataSources) {
        if (ds.isGroupField && ds.sourceFieldName) {
          // Data is from a group field on the tenant document itself
          if (tenant[ds.sourceFieldName]) {
            console.log(`Migrating group field '${ds.sourceFieldName}' for Tenant ID: ${tenant.id}`);
            // TODO: Transform tenant[ds.sourceFieldName] if needed to match TenantConfiguration[ds.targetField] structure
            tenantJsonDataUpdate[ds.targetField] = tenant[ds.sourceFieldName];
          }
        } else if (ds.sourceCollection && ds.relationField) {
          // Data is from a related collection
          try {
            console.log(`Fetching ${ds.sourceCollection} for Tenant ID: ${tenant.id}`);
            let relatedItemsPage = 1;
            let relatedItemsResult;
            const allRelatedItems = [];
            do {
              relatedItemsResult = await payload.find({
                collection: ds.sourceCollection as any,
                where: { [ds.relationField]: { equals: tenant.id } },
                limit: BATCH_SIZE, // Use BATCH_SIZE
                page: relatedItemsPage,
                depth: 1,
              });
              allRelatedItems.push(...relatedItemsResult.docs);
              relatedItemsPage += 1;
            } while (relatedItemsResult.hasNextPage);

            const relatedItems = { docs: allRelatedItems }; // Keep structure consistent

            if (relatedItems.docs.length > 0) {
              console.log(`Found ${relatedItems.docs.length} items in ${ds.sourceCollection} for Tenant ID: ${tenant.id} (across all pages)`);
              const transformedItems = relatedItems.docs.map(item => ({
                id: item.id, // Or other relevant identifier
                ...item, // Spread existing fields, then refine
                // TODO: Actual transformation logic here based on TenantConfiguration types
              }));
              tenantJsonDataUpdate[ds.targetField] = transformedItems;

              // Placeholder for progressive validation call
              console.log(`[Migration] Would call validateMigratedBatchDetails for Tenant ID ${tenant.id}, batch of ${ds.sourceCollection} (count: ${transformedItems.length}) here.`);
              // await validateMigratedBatchDetails('tenants', relatedItemsPage -1, relatedItems.docs, tenant, ds.targetField);

            } else {
              tenantJsonDataUpdate[ds.targetField] = ds.targetField === 'memberships' || ds.targetField === 'integrations' ? [] : {};
            }
          } catch (error) {
            if (error.message && error.message.includes(`Collection with slug '${ds.sourceCollection}' not found`)) {
                console.warn(`Collection ${ds.sourceCollection} not found. Skipping migration for this source.`);
                tenantJsonDataUpdate[ds.targetField] = ds.targetField === 'memberships' || ds.targetField === 'integrations' ? [] : {};
            } else {
                console.error(`Error fetching ${ds.sourceCollection} for Tenant ${tenant.id}:`, error);
            }
          }
        }
      }

      if (Object.keys(tenantJsonDataUpdate).length > 0) {
        try {
          console.log(`Updating Tenant ID: ${tenant.id} with new jsonData...`);
          await payload.update({
            collection: 'tenants',
            id: tenant.id,
            data: {
              jsonData: tenantJsonDataUpdate, // 'jsonData' is the target field in Tenants
            },
          });
          console.log(`Successfully updated Tenant ID: ${tenant.id}`);
        } catch (error) {
          console.error(`Error updating Tenant ${tenant.id}:`, error);
        }
      } else {
        console.log(`No data to migrate into jsonData for Tenant ID: ${tenant.id}`);
      }
    }
    page += 1;
  } while (tenantsResult.hasNextPage);

  console.log('Tenant jsonData migration step finished.');
}

/**
 * Migrates data from Users collection fields into the Users.preferences JSON field.
 */
async function migrateUserData() {
  // Fields to migrate into Users.preferences
  // ActivityLogs collection was not found, so we will focus on existing fields in Users.
  const fieldsToMigrate: {
    sourceFieldName: keyof import('../src/payload-types').User; // Field name in the User document
    targetPath?: keyof import('../src/types/user-preferences').UserPreferences | string; // Path within UserPreferences JSON
  }[] = [
    { sourceFieldName: 'theme', targetPath: 'theme' },
    { sourceFieldName: 'timezone', targetPath: 'timezone' },
    { sourceFieldName: 'privacySettings', targetPath: 'privacySettings' }, // This is a group
    // Add 'activityLog' handling here if a source for it is identified (e.g. from an external system or another field)
    // For now, activityLog will be initialized as empty or based on some default if needed.
  ];

  let page = 1;
  let usersResult;
  do {
    usersResult = await payload.find({
      collection: 'users',
      limit: BATCH_SIZE,
      page,
      depth: 0, // We only need fields from the user doc itself
    });

    for (const user of usersResult.docs) {
      console.log(`Processing User ID: ${user.id}`);
      const userPreferencesUpdate: any = user.preferences || {}; // Start with existing preferences if any

      for (const fm of fieldsToMigrate) {
        if (user[fm.sourceFieldName] !== undefined) {
          console.log(`Migrating field '${String(fm.sourceFieldName)}' for User ID: ${user.id}`);
          if (fm.targetPath) {
             // Simple assignment, assumes structure matches or needs minimal transformation
            userPreferencesUpdate[fm.targetPath] = user[fm.sourceFieldName];
          }
          // If more complex transformation is needed, it would go here.
        }
      }

      // Ensure activityLog array exists if it's part of the plan, even if no source.
      if (!userPreferencesUpdate.activityLog) {
        userPreferencesUpdate.activityLog = [];
      }


      if (Object.keys(userPreferencesUpdate).length > 0) {
        try {
          console.log(`Updating User ID: ${user.id} with new preferences...`);
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              preferences: userPreferencesUpdate,
            },
          });
          console.log(`Successfully updated User ID: ${user.id}`);
          // Placeholder for progressive validation (though this migrates fields from the user doc itself)
          // Validation for user preferences would involve comparing userPreferencesUpdate against original user fields.
          console.log(`[Migration] User preferences for User ID ${user.id} updated. Validation would compare new 'preferences' field with original 'theme', 'timezone', 'privacySettings'.`);
        } catch (error) {
          console.error(`Error updating User ${user.id}:`, error);
        }
      } else {
        console.log(`No preference data to migrate for User ID: ${user.id}`);
      }
    }
    page += 1;
  } while (usersResult.hasNextPage);

  console.log('User preferences migration step finished.');
}


// Execute the migration
migrate();
