// scripts/rollback-json-migration.ts
import payload from 'payload';
import { initPayload } from '../src/payload'; // Adjust path as necessary
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const BATCH_SIZE = 100;

/**
 * Main rollback function.
 */
async function rollback() {
  console.log('Starting JSON schema migration rollback...');

  try {
    // Initialize Payload
    console.log('Initializing Payload for rollback...');
    await initPayload({
      express: null,
      onInit: async () => {
        console.log('Payload initialized for rollback.');

        // --- Rollback Space Data ---
        console.log('\nRolling back Spaces.data...');
        await rollbackSpaceData();

        // --- Rollback Tenant Data ---
        console.log('\nRolling back Tenants.jsonData...');
        await rollbackTenantData();

        // --- Rollback User Data ---
        console.log('\nRolling back Users.preferences...');
        await rollbackUserData();

        console.log('\nRollback script completed successfully.');
      },
    });
  } catch (error) {
    console.error('Rollback script failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

/**
 * Rolls back data from Spaces.data JSON field to their original collections.
 */
async function rollbackSpaceData() {
  console.log('Starting Space data rollback. This is a complex operation and this script is a placeholder.');
  // This function would need to:
  // 1. Iterate through all spaces.
  // 2. For each space, read its `space.data` field.
  // 3. For each type of data in `space.data` (messages, products, etc.):
  //    a. Transform it back to the original collection's schema.
  //    b. Create or update records in the original collections (e.g., 'messages', 'products').
  //    c. This is highly dependent on how IDs were managed and if the original items were deleted or just archived.
  // 4. After successfully moving data out, potentially clear the `space.data` field.

  // Example: Rollback for messages (very simplified)
  let page = 1;
  let spacesResult;
  do {
    spacesResult = await payload.find({
      collection: 'spaces',
      limit: BATCH_SIZE,
      page,
      depth: 0, // We only need the 'data' field
      overrideAccess: true, // Ensure admin access for script
    });

    for (const space of spacesResult.docs) {
      if (space.data && space.data.messages && Array.isArray(space.data.messages)) {
        console.log(`Rolling back messages for Space ID: ${space.id}. Found ${space.data.messages.length} messages.`);
        for (const messageData of space.data.messages) {
          try {
            // This assumes 'messages' collection still exists and we can create items in it.
            // ID conflicts need to be handled if original items weren't deleted.
            // This is a naive recreation, real rollback might need to update existing or handle duplicates.
            // const originalMessageId = messageData.id; // Assuming 'id' was preserved.
            // delete messageData.id; // Don't try to set the ID if the collection auto-generates it.

            // await payload.create({
            //   collection: 'messages',
            //   data: {
            //     // Map fields from messageData back to original Messages schema
            //     // This is an approximation based on the migration transformation
            //     id: messageData.id, // Attempt to preserve ID, might cause issues if not handled by DB/Payload
            //     content: messageData.content, // This was transformed to LocalMessageContent, needs care if original was different
            //     sender: messageData.sender, // Should be User ID
            //     createdAt: messageData.timestamp, // Map back
            //     messageType: messageData.messageType,
            //     priority: messageData.priority,
            //     threadId: messageData.threadId,
            //     replyToId: messageData.replyToId, // Should be Message ID
            //     reactions: messageData.reactions, // This was transformed, might need to revert transformation
            //     readBy: messageData.readBy, // Array of User IDs
            //     isPinned: messageData.isPinned,
            //     attachments: messageData.attachments?.map((att: any) => ({
            //       // This depends on how attachments are stored in 'media' and linked in 'messages'
            //       // Might need to re-upload or re-link media if only URLs were stored
            //       filename: att.name,
            //       url: att.url,
            //       mimeType: att.type,
            //     })),
            //     space: space.id, // Link back to the space
            //     // Add any other fields required by the 'messages' collection schema
            //     // such as atProtocol, conversationContext, businessIntelligence if they were part of original and need restoration
            //   },
            //   overrideAccess: true,
            // });
            console.log(`Placeholder: Would attempt to re-create message ID ${messageData.id} from Space ${space.id} into 'messages' collection.`);
          } catch (error) {
            console.error(`Error rolling back message ${messageData.id} for Space ${space.id}:`, error);
          }
        }
        // After processing, you might want to clear space.data.messages
        // await payload.update({ collection: 'spaces', id: space.id, data: { data: { ...space.data, messages: [] } } });
      }
    }
    page += 1;
  } while (spacesResult.hasNextPage);

  console.log('Space data rollback step placeholder finished.');
}


/**
 * Rolls back data from Tenants.jsonData to their original group fields or collections.
 */
async function rollbackTenantData() {
  console.log('Starting Tenant jsonData rollback. This is a complex operation and this script is a placeholder.');
  // This function would need to:
  // 1. Iterate through all tenants.
  // 2. For each tenant, read its `tenant.jsonData` field.
  // 3. For each type of data in `tenant.jsonData` (memberships, revenue, etc.):
  //    a. If it came from a group field (e.g. revenueSharing), transform and write it back to that group field.
  //    b. If it came from a separate collection (e.g. tenantMemberships), transform and create/update records in that collection.
  // 4. After successfully moving data out, potentially clear `tenant.jsonData`.

  let page = 1;
  let tenantsResult;
  do {
    tenantsResult = await payload.find({
      collection: 'tenants',
      limit: BATCH_SIZE,
      page,
      depth: 0, // We only need the 'jsonData' field
      overrideAccess: true,
    });

    for (const tenant of tenantsResult.docs) {
      if (tenant.jsonData) {
        console.log(`Rolling back jsonData for Tenant ID: ${tenant.id}`);
        const updateData:any = {};

        // Example: Rollback for 'revenue' (originally from 'revenueSharing' group)
        if (tenant.jsonData.revenue) {
          // updateData.revenueSharing = tenant.jsonData.revenue; // Assign back to original group field
          console.log(`Placeholder: Would attempt to restore 'revenueSharing' group from jsonData.revenue for Tenant ID: ${tenant.id}`);
        }
        // Example: Rollback for 'memberships' (originally from 'tenantMemberships' collection)
        if (tenant.jsonData.memberships && Array.isArray(tenant.jsonData.memberships)) {
           console.log(`Placeholder: Would attempt to re-create records in 'tenantMemberships' collection from jsonData.memberships for Tenant ID: ${tenant.id}`);
          // for (const membershipData of tenant.jsonData.memberships) {
          //   try {
          //     // await payload.create({ collection: 'tenantMemberships', data: { ...membershipData, tenant: tenant.id } });
          //   } catch (error) { console.error(...) }
          // }
        }

        // If updateData has properties, update the tenant
        // if (Object.keys(updateData).length > 0) {
        //   await payload.update({ collection: 'tenants', id: tenant.id, data: updateData });
        // }
        // Then potentially clear tenant.jsonData
        // await payload.update({ collection: 'tenants', id: tenant.id, data: { jsonData: {} } });
      }
    }
    page += 1;
  } while (tenantsResult.hasNextPage);
  console.log('Tenant jsonData rollback step placeholder finished.');
}

/**
 * Rolls back data from Users.preferences JSON field to their original fields.
 */
async function rollbackUserData() {
  console.log('Starting User preferences rollback. This is a complex operation and this script is a placeholder.');
  // This function would need to:
  // 1. Iterate through all users.
  // 2. For each user, read their `user.preferences` field.
  // 3. For each key in `user.preferences` (theme, timezone, privacySettings, activityLog):
  //    a. Write the data back to the original fields in the User document (e.g. user.theme, user.timezone).
  //    b. For activityLog, if it were to be moved to a separate collection, this would be the place to recreate those records.
  // 4. After successfully moving data out, potentially clear `user.preferences`.

  let page = 1;
  let usersResult;
  do {
    usersResult = await payload.find({
      collection: 'users',
      limit: BATCH_SIZE,
      page,
      depth: 0, // We only need the 'preferences' field
      overrideAccess: true,
    });

    for (const user of usersResult.docs) {
      if (user.preferences) {
        console.log(`Rolling back preferences for User ID: ${user.id}`);
        const updateData: any = {};

        if (user.preferences.theme !== undefined) {
          // updateData.theme = user.preferences.theme;
           console.log(`Placeholder: Would attempt to restore 'theme' field from preferences.theme for User ID: ${user.id}`);
        }
        if (user.preferences.timezone !== undefined) {
          // updateData.timezone = user.preferences.timezone;
           console.log(`Placeholder: Would attempt to restore 'timezone' field from preferences.timezone for User ID: ${user.id}`);
        }
        if (user.preferences.privacySettings !== undefined) {
          // updateData.privacySettings = user.preferences.privacySettings;
           console.log(`Placeholder: Would attempt to restore 'privacySettings' group from preferences.privacySettings for User ID: ${user.id}`);
        }
        // activityLog rollback would be more complex if it was its own collection.
        // If it was just a JSON field, there's no original field to roll back to unless one was created.

        // if (Object.keys(updateData).length > 0) {
        //   await payload.update({ collection: 'users', id: user.id, data: updateData });
        // }
        // Then potentially clear user.preferences
        // await payload.update({ collection: 'users', id: user.id, data: { preferences: {} } });
      }
    }
    page += 1;
  } while (usersResult.hasNextPage);

  console.log('User preferences rollback step placeholder finished.');
}

// Execute the rollback
rollback();
