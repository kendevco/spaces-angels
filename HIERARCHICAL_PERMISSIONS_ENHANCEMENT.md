# Hierarchical Permissions & Member Management Enhancement

## Overview

This document outlines the implementation of a sophisticated hierarchical permission system for Payload CMS spaces, integrating Discord-like role management with enterprise-grade access control and member invitation workflows.

## Core Permission Hierarchy

### 1. Global Roles (System Level)
```typescript
enum GlobalRole {
  SUPER_ADMIN = 'super_admin',      // Full system access
  TENANT_ADMIN = 'tenant_admin',    // Tenant-wide administration
  SITE_HOST = 'site_host',          // Multi-tenant site management
  USER = 'user',                    // Standard authenticated user
  GUEST = 'guest'                   // Limited access user
}
```

### 2. Space Roles (Space Level)
```typescript
enum SpaceRole {
  SPACE_OWNER = 'space_owner',      // Full space control
  SPACE_ADMIN = 'space_admin',      // Administrative privileges
  SPACE_MODERATOR = 'space_moderator', // Moderation capabilities
  SPACE_MEMBER = 'space_member',    // Standard member access
  SPACE_CLIENT = 'space_client',    // Client/customer access
  SPACE_GUEST = 'space_guest'       // Limited guest access
}
```

### 3. Channel Permissions (Channel Level)
```typescript
interface ChannelPermissions {
  // Basic permissions
  viewChannel: boolean
  sendMessages: boolean
  embedLinks: boolean
  attachFiles: boolean
  readMessageHistory: boolean

  // Advanced permissions
  manageMessages: boolean          // Edit/delete others' messages
  manageChannel: boolean           // Edit channel settings
  mentionEveryone: boolean         // @everyone mentions
  useVoiceActivity: boolean        // Voice activation in voice channels

  // Moderation permissions
  kickMembers: boolean             // Remove members from channel
  banMembers: boolean              // Ban members from channel
  manageRoles: boolean             // Assign/remove channel roles

  // Administrative permissions
  manageWebhooks: boolean          // Create/edit webhooks
  managePermissions: boolean       // Override permissions
}
```

## Enhanced Collections Architecture

### 1. Enhanced Members Collection with Hierarchical Roles

```typescript
// src/collections/Members.ts
import { CollectionConfig } from 'payload'
import { SpaceRole, GlobalRole } from '../types/roles'
import { authenticated } from '../access/authenticated'
import { hasSpacePermission } from '../access/permissions'

const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    group: 'Spaces',
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'globalRole', 'spaceRole', 'space', 'status'],
    description: 'Hierarchical member management with role-based permissions',
  },
  access: {
    create: authenticated,
    read: hasSpacePermission('viewMembers'),
    update: hasSpacePermission('manageMembers'),
    delete: hasSpacePermission('manageMembers'),
  },
  fields: [
    // Core relationships
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User account for this membership',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'Space this membership belongs to',
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who invited this member',
        readOnly: true,
      },
    },

    // Hierarchical role system
    {
      name: 'globalRole',
      type: 'select',
      options: [
        { label: 'Super Admin', value: GlobalRole.SUPER_ADMIN },
        { label: 'Tenant Admin', value: GlobalRole.TENANT_ADMIN },
        { label: 'Site Host', value: GlobalRole.SITE_HOST },
        { label: 'User', value: GlobalRole.USER },
        { label: 'Guest', value: GlobalRole.GUEST },
      ],
      defaultValue: GlobalRole.USER,
      admin: {
        description: 'Global system role (inherited from user)',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            // Inherit from user's global role
            if (data?.user && req?.payload) {
              const user = await req.payload.findByID({
                collection: 'users',
                id: data.user,
              })
              return user.globalRole || GlobalRole.USER
            }
            return data?.globalRole
          },
        ],
      },
    },
    {
      name: 'spaceRole',
      type: 'select',
      options: [
        { label: 'Space Owner', value: SpaceRole.SPACE_OWNER },
        { label: 'Space Admin', value: SpaceRole.SPACE_ADMIN },
        { label: 'Space Moderator', value: SpaceRole.SPACE_MODERATOR },
        { label: 'Space Member', value: SpaceRole.SPACE_MEMBER },
        { label: 'Space Client', value: SpaceRole.SPACE_CLIENT },
        { label: 'Space Guest', value: SpaceRole.SPACE_GUEST },
      ],
      defaultValue: SpaceRole.SPACE_MEMBER,
      required: true,
      admin: {
        description: 'Role within this specific space',
      },
    },

    // Member information
    {
      name: 'displayName',
      type: 'text',
      admin: {
        description: 'Display name override for this space',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Email for invitations and notifications',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Invited', value: 'invited' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Left', value: 'left' },
      ],
      defaultValue: 'invited',
      admin: {
        description: 'Membership status',
      },
    },

    // Permission overrides
    {
      name: 'permissionOverrides',
      type: 'group',
      label: 'Permission Overrides',
      fields: [
        {
          name: 'canInviteMembers',
          type: 'select',
          options: [
            { label: 'Inherit from Role', value: 'inherit' },
            { label: 'Allow', value: 'allow' },
            { label: 'Deny', value: 'deny' },
          ],
          defaultValue: 'inherit',
        },
        {
          name: 'canManageChannels',
          type: 'select',
          options: [
            { label: 'Inherit from Role', value: 'inherit' },
            { label: 'Allow', value: 'allow' },
            { label: 'Deny', value: 'deny' },
          ],
          defaultValue: 'inherit',
        },
        {
          name: 'canDeleteMessages',
          type: 'select',
          options: [
            { label: 'Inherit from Role', value: 'inherit' },
            { label: 'Allow', value: 'allow' },
            { label: 'Deny', value: 'deny' },
          ],
          defaultValue: 'inherit',
        },
        {
          name: 'canMentionEveryone',
          type: 'select',
          options: [
            { label: 'Inherit from Role', value: 'inherit' },
            { label: 'Allow', value: 'allow' },
            { label: 'Deny', value: 'deny' },
          ],
          defaultValue: 'inherit',
        },
      ],
      admin: {
        description: 'Override default role permissions for this member',
      },
    },

    // Channel-specific permissions
    {
      name: 'channelPermissions',
      type: 'array',
      label: 'Channel-Specific Permissions',
      fields: [
        {
          name: 'channel',
          type: 'relationship',
          relationTo: 'channels',
          required: true,
        },
        {
          name: 'permissions',
          type: 'group',
          fields: [
            {
              name: 'viewChannel',
              type: 'select',
              options: [
                { label: 'Inherit', value: 'inherit' },
                { label: 'Allow', value: 'allow' },
                { label: 'Deny', value: 'deny' },
              ],
              defaultValue: 'inherit',
            },
            {
              name: 'sendMessages',
              type: 'select',
              options: [
                { label: 'Inherit', value: 'inherit' },
                { label: 'Allow', value: 'allow' },
                { label: 'Deny', value: 'deny' },
              ],
              defaultValue: 'inherit',
            },
            {
              name: 'manageMessages',
              type: 'select',
              options: [
                { label: 'Inherit', value: 'inherit' },
                { label: 'Allow', value: 'allow' },
                { label: 'Deny', value: 'deny' },
              ],
              defaultValue: 'inherit',
            },
          ],
        },
      ],
      admin: {
        description: 'Override permissions for specific channels',
      },
    },

    // Metadata
    {
      name: 'joinedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            if (operation === 'create' && data?.status === 'active') {
              return new Date()
            }
            return data?.joinedAt
          },
        ],
      },
    },
    {
      name: 'invitedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            if (operation === 'create') {
              return new Date()
            }
            return data?.invitedAt
          },
        ],
      },
    },
  ],

  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        // Validate role hierarchy
        if (operation === 'create' || operation === 'update') {
          const { user, payload } = req

          // Only higher roles can assign equal or lower roles
          if (data?.spaceRole && user?.id) {
            const assignerMembership = await payload.find({
              collection: 'members',
              where: {
                and: [
                  { user: { equals: user.id } },
                  { space: { equals: data.space } },
                ],
              },
              limit: 1,
            })

            if (assignerMembership.docs.length > 0) {
              const assignerRole = assignerMembership.docs[0].spaceRole
              const canAssignRole = validateRoleAssignment(assignerRole, data.spaceRole)

              if (!canAssignRole && user.globalRole !== GlobalRole.SUPER_ADMIN) {
                throw new Error('Insufficient permissions to assign this role')
              }
            }
          }
        }
      },
    ],
  },

  indexes: [
    {
      fields: [
        { name: 'user', direction: 'asc' },
        { name: 'space', direction: 'asc' },
      ],
      unique: true,
    },
    {
      fields: [
        { name: 'space', direction: 'asc' },
        { name: 'spaceRole', direction: 'asc' },
      ],
    },
  ],
}

export default Members
```

### 2. Channel Permissions Collection

```typescript
// src/collections/ChannelPermissions.ts
import { CollectionConfig } from 'payload'

const ChannelPermissions: CollectionConfig = {
  slug: 'channel-permissions',
  admin: {
    group: 'Spaces',
    useAsTitle: 'name',
    description: 'Granular channel permission templates',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Permission template name (e.g., "Moderator", "Read-Only")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this permission set allows',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'Space this permission template belongs to',
      },
    },
    {
      name: 'permissions',
      type: 'group',
      fields: [
        // Basic permissions
        {
          name: 'viewChannel',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Can view the channel' },
        },
        {
          name: 'sendMessages',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Can send messages' },
        },
        {
          name: 'embedLinks',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Can embed links in messages' },
        },
        {
          name: 'attachFiles',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Can attach files to messages' },
        },
        {
          name: 'readMessageHistory',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Can read message history' },
        },

        // Advanced permissions
        {
          name: 'manageMessages',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Can edit/delete others\' messages' },
        },
        {
          name: 'manageChannel',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Can edit channel settings' },
        },
        {
          name: 'mentionEveryone',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Can use @everyone mentions' },
        },
        {
          name: 'useVoiceActivity',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Can use voice activation' },
        },

        // Moderation permissions
        {
          name: 'kickMembers',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Can remove members from channel' },
        },
        {
          name: 'banMembers',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Can ban members from channel' },
        },
        {
          name: 'manageRoles',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Can assign/remove channel roles' },
        },

        // Administrative permissions
        {
          name: 'manageWebhooks',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Can create/edit webhooks' },
        },
        {
          name: 'managePermissions',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Can override permissions' },
        },
      ],
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Default permission set for new members',
      },
    },
  ],
}

export default ChannelPermissions
```

## Permission Evaluation System

### 1. Permission Resolution Logic

```typescript
// src/utils/permissions.ts
import { GlobalRole, SpaceRole } from '../types/roles'

interface PermissionContext {
  globalRole: GlobalRole
  spaceRole: SpaceRole
  permissionOverrides?: Record<string, 'inherit' | 'allow' | 'deny'>
  channelPermissions?: Record<string, 'inherit' | 'allow' | 'deny'>
}

export class PermissionEvaluator {
  private static roleHierarchy = {
    [GlobalRole.SUPER_ADMIN]: 1000,
    [GlobalRole.TENANT_ADMIN]: 900,
    [GlobalRole.SITE_HOST]: 800,
    [GlobalRole.USER]: 100,
    [GlobalRole.GUEST]: 10,
  }

  private static spaceRoleHierarchy = {
    [SpaceRole.SPACE_OWNER]: 1000,
    [SpaceRole.SPACE_ADMIN]: 900,
    [SpaceRole.SPACE_MODERATOR]: 800,
    [SpaceRole.SPACE_MEMBER]: 100,
    [SpaceRole.SPACE_CLIENT]: 50,
    [SpaceRole.SPACE_GUEST]: 10,
  }

  private static defaultPermissions = {
    [SpaceRole.SPACE_OWNER]: {
      viewChannel: true,
      sendMessages: true,
      embedLinks: true,
      attachFiles: true,
      readMessageHistory: true,
      manageMessages: true,
      manageChannel: true,
      mentionEveryone: true,
      useVoiceActivity: true,
      kickMembers: true,
      banMembers: true,
      manageRoles: true,
      manageWebhooks: true,
      managePermissions: true,
    },
    [SpaceRole.SPACE_ADMIN]: {
      viewChannel: true,
      sendMessages: true,
      embedLinks: true,
      attachFiles: true,
      readMessageHistory: true,
      manageMessages: true,
      manageChannel: true,
      mentionEveryone: true,
      useVoiceActivity: true,
      kickMembers: true,
      banMembers: false,
      manageRoles: true,
      manageWebhooks: false,
      managePermissions: false,
    },
    [SpaceRole.SPACE_MODERATOR]: {
      viewChannel: true,
      sendMessages: true,
      embedLinks: true,
      attachFiles: true,
      readMessageHistory: true,
      manageMessages: true,
      manageChannel: false,
      mentionEveryone: false,
      useVoiceActivity: true,
      kickMembers: true,
      banMembers: false,
      manageRoles: false,
      manageWebhooks: false,
      managePermissions: false,
    },
    [SpaceRole.SPACE_MEMBER]: {
      viewChannel: true,
      sendMessages: true,
      embedLinks: true,
      attachFiles: true,
      readMessageHistory: true,
      manageMessages: false,
      manageChannel: false,
      mentionEveryone: false,
      useVoiceActivity: true,
      kickMembers: false,
      banMembers: false,
      manageRoles: false,
      manageWebhooks: false,
      managePermissions: false,
    },
    [SpaceRole.SPACE_CLIENT]: {
      viewChannel: true,
      sendMessages: true,
      embedLinks: false,
      attachFiles: true,
      readMessageHistory: true,
      manageMessages: false,
      manageChannel: false,
      mentionEveryone: false,
      useVoiceActivity: false,
      kickMembers: false,
      banMembers: false,
      manageRoles: false,
      manageWebhooks: false,
      managePermissions: false,
    },
    [SpaceRole.SPACE_GUEST]: {
      viewChannel: true,
      sendMessages: false,
      embedLinks: false,
      attachFiles: false,
      readMessageHistory: true,
      manageMessages: false,
      manageChannel: false,
      mentionEveryone: false,
      useVoiceActivity: false,
      kickMembers: false,
      banMembers: false,
      manageRoles: false,
      manageWebhooks: false,
      managePermissions: false,
    },
  }

  static hasPermission(
    permission: string,
    context: PermissionContext,
    channelId?: string
  ): boolean {
    // 1. Check global admin override
    if (context.globalRole === GlobalRole.SUPER_ADMIN) {
      return true
    }

    // 2. Check explicit deny at channel level
    if (channelId && context.channelPermissions?.[permission] === 'deny') {
      return false
    }

    // 3. Check explicit allow at channel level
    if (channelId && context.channelPermissions?.[permission] === 'allow') {
      return true
    }

    // 4. Check permission overrides
    if (context.permissionOverrides?.[permission] === 'deny') {
      return false
    }
    if (context.permissionOverrides?.[permission] === 'allow') {
      return true
    }

    // 5. Check default role permissions
    const rolePermissions = this.defaultPermissions[context.spaceRole]
    return rolePermissions?.[permission] || false
  }

  static canAssignRole(assignerRole: SpaceRole, targetRole: SpaceRole): boolean {
    const assignerLevel = this.spaceRoleHierarchy[assignerRole]
    const targetLevel = this.spaceRoleHierarchy[targetRole]
    return assignerLevel > targetLevel
  }

  static getEffectivePermissions(context: PermissionContext, channelId?: string) {
    const permissions = {}
    const rolePermissions = this.defaultPermissions[context.spaceRole] || {}

    Object.keys(rolePermissions).forEach(permission => {
      permissions[permission] = this.hasPermission(permission, context, channelId)
    })

    return permissions
  }
}

export function validateRoleAssignment(assignerRole: SpaceRole, targetRole: SpaceRole): boolean {
  return PermissionEvaluator.canAssignRole(assignerRole, targetRole)
}
```

### 2. Access Control Functions

```typescript
// src/access/permissions.ts
import { Access, Where } from 'payload'
import { PermissionEvaluator } from '../utils/permissions'

export const hasSpacePermission = (permission: string): Access => {
  return async ({ req: { user, payload }, id, data }) => {
    if (!user) return false

    // Super admin bypass
    if (user.globalRole === 'super_admin') return true

    // Get space context
    let spaceId: string | undefined

    if (id) {
      // For existing documents, get space from the document
      const doc = await payload.findByID({
        collection: req.collection?.config?.slug || '',
        id,
        depth: 1,
      })
      spaceId = doc?.space?.id || doc?.space
    } else if (data?.space) {
      // For new documents, get space from data
      spaceId = typeof data.space === 'string' ? data.space : data.space?.id
    }

    if (!spaceId) return false

    // Get user's membership in this space
    const membership = await payload.find({
      collection: 'members',
      where: {
        and: [
          { user: { equals: user.id } },
          { space: { equals: spaceId } },
          { status: { equals: 'active' } },
        ],
      },
      limit: 1,
    })

    if (membership.docs.length === 0) return false

    const member = membership.docs[0]
    const context = {
      globalRole: user.globalRole || 'user',
      spaceRole: member.spaceRole,
      permissionOverrides: member.permissionOverrides,
    }

    return PermissionEvaluator.hasPermission(permission, context)
  }
}

export const hasChannelPermission = (permission: string): Access => {
  return async ({ req: { user, payload }, id, data }) => {
    if (!user) return false

    // Super admin bypass
    if (user.globalRole === 'super_admin') return true

    // Get channel context
    let channelId: string | undefined
    let spaceId: string | undefined

    if (id) {
      const doc = await payload.findByID({
        collection: req.collection?.config?.slug || '',
        id,
        depth: 2,
      })
      channelId = doc?.channel?.id || doc?.channel
      spaceId = doc?.channel?.space?.id || doc?.space?.id
    } else if (data?.channel) {
      channelId = typeof data.channel === 'string' ? data.channel : data.channel?.id

      if (channelId) {
        const channel = await payload.findByID({
          collection: 'channels',
          id: channelId,
          depth: 1,
        })
        spaceId = channel?.space?.id || channel?.space
      }
    }

    if (!spaceId || !channelId) return false

    // Get user's membership
    const membership = await payload.find({
      collection: 'members',
      where: {
        and: [
          { user: { equals: user.id } },
          { space: { equals: spaceId } },
          { status: { equals: 'active' } },
        ],
      },
      limit: 1,
    })

    if (membership.docs.length === 0) return false

    const member = membership.docs[0]

    // Get channel-specific permissions
    const channelPermissions = member.channelPermissions?.find(
      cp => cp.channel === channelId
    )?.permissions

    const context = {
      globalRole: user.globalRole || 'user',
      spaceRole: member.spaceRole,
      permissionOverrides: member.permissionOverrides,
      channelPermissions,
    }

    return PermissionEvaluator.hasPermission(permission, context, channelId)
  }
}
```

## Member Invitation System

### 1. Invitations Collection

```typescript
// src/collections/Invitations.ts
import { CollectionConfig } from 'payload'

const Invitations: CollectionConfig = {
  slug: 'invitations',
  admin: {
    group: 'Spaces',
    useAsTitle: 'email',
    defaultColumns: ['email', 'space', 'role', 'status', 'expiresAt'],
    description: 'Member invitation management',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Email address to invite',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'Space to invite member to',
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who sent the invitation',
        readOnly: true,
      },
    },
    {
      name: 'proposedRole',
      type: 'select',
      options: [
        { label: 'Space Admin', value: 'space_admin' },
        { label: 'Space Moderator', value: 'space_moderator' },
        { label: 'Space Member', value: 'space_member' },
        { label: 'Space Client', value: 'space_client' },
        { label: 'Space Guest', value: 'space_guest' },
      ],
      defaultValue: 'space_member',
      required: true,
      admin: {
        description: 'Proposed role for the invited member',
      },
    },
    {
      name: 'customPermissions',
      type: 'group',
      label: 'Custom Permission Overrides',
      fields: [
        {
          name: 'canInviteMembers',
          type: 'select',
          options: [
            { label: 'Inherit from Role', value: 'inherit' },
            { label: 'Allow', value: 'allow' },
            { label: 'Deny', value: 'deny' },
          ],
          defaultValue: 'inherit',
        },
        {
          name: 'canManageChannels',
          type: 'select',
          options: [
            { label: 'Inherit from Role', value: 'inherit' },
            { label: 'Allow', value: 'allow' },
            { label: 'Deny', value: 'deny' },
          ],
          defaultValue: 'inherit',
        },
      ],
      admin: {
        description: 'Override default role permissions for this invitation',
      },
    },
    {
      name: 'channelAccess',
      type: 'array',
      label: 'Channel Access',
      fields: [
        {
          name: 'channel',
          type: 'relationship',
          relationTo: 'channels',
          required: true,
        },
        {
          name: 'access',
          type: 'select',
          options: [
            { label: 'Full Access', value: 'full' },
            { label: 'Read Only', value: 'read' },
            { label: 'No Access', value: 'none' },
          ],
          defaultValue: 'full',
        },
      ],
      admin: {
        description: 'Specific channel access permissions',
      },
    },
    {
      name: 'inviteToken',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Unique token for invitation link',
      },
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            if (operation === 'create') {
              return crypto.randomUUID()
            }
            return data?.inviteToken
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
        { label: 'Expired', value: 'expired' },
        { label: 'Revoked', value: 'revoked' },
      ],
      defaultValue: 'pending',
      admin: {
        description: 'Current status of the invitation',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      admin: {
        description: 'Optional personal message with the invitation',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When this invitation expires',
      },
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            if (operation === 'create') {
              // Default to 7 days from now
              const expiryDate = new Date()
              expiryDate.setDate(expiryDate.getDate() + 7)
              return expiryDate
            }
            return data?.expiresAt
          },
        ],
      },
    },
    {
      name: 'acceptedAt',
      type: 'date',
      admin: {
        readOnly: true,
        condition: (data) => data?.status === 'accepted',
      },
    },
  ],

  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && data?.invitedBy && data?.space && data?.proposedRole) {
          // Validate that inviter has permission to invite with this role
          const inviterMembership = await req.payload.find({
            collection: 'members',
            where: {
              and: [
                { user: { equals: data.invitedBy } },
                { space: { equals: data.space } },
                { status: { equals: 'active' } },
              ],
            },
            limit: 1,
          })

          if (inviterMembership.docs.length === 0) {
            throw new Error('You are not a member of this space')
          }

          const inviterRole = inviterMembership.docs[0].spaceRole
          const canInvite = validateRoleAssignment(inviterRole, data.proposedRole)

          if (!canInvite && req.user?.globalRole !== 'super_admin') {
            throw new Error('Insufficient permissions to invite with this role')
          }
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          // Send invitation email
          await sendInvitationEmail({
            email: doc.email,
            spaceName: doc.space.name,
            inviterName: doc.invitedBy.name,
            inviteToken: doc.inviteToken,
            message: doc.message,
          })
        }
      },
    ],
  },
}

export default Invitations
```

### 2. Member Chooser Component

```typescript
// src/components/MemberChooser.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface MemberChooserProps {
  spaceId: string
  isOpen: boolean
  onClose: () => void
  onInvite: (invitations: InvitationData[]) => void
  currentUserRole: string
}

interface InvitationData {
  email: string
  role: string
  customPermissions?: Record<string, string>
  channelAccess?: Array<{ channelId: string; access: string }>
  message?: string
}

export function MemberChooser({
  spaceId,
  isOpen,
  onClose,
  onInvite,
  currentUserRole,
}: MemberChooserProps) {
  const [invitations, setInvitations] = useState<InvitationData[]>([
    { email: '', role: 'space_member' }
  ])
  const [channels, setChannels] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    if (isOpen) {
      fetchChannels()
      setAvailableRoles(getAvailableRoles(currentUserRole))
    }
  }, [isOpen, spaceId, currentUserRole])

  const fetchChannels = async () => {
    try {
      const response = await fetch(`/api/channels?space=${spaceId}`)
      const data = await response.json()
      setChannels(data.docs || [])
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    }
  }

  const getAvailableRoles = (userRole: string) => {
    const roleHierarchy = {
      'space_owner': ['space_admin', 'space_moderator', 'space_member', 'space_client', 'space_guest'],
      'space_admin': ['space_moderator', 'space_member', 'space_client', 'space_guest'],
      'space_moderator': ['space_member', 'space_client', 'space_guest'],
      'space_member': ['space_guest'],
    }

    return roleHierarchy[userRole] || []
  }

  const addInvitation = () => {
    setInvitations([...invitations, { email: '', role: 'space_member' }])
  }

  const removeInvitation = (index: number) => {
    setInvitations(invitations.filter((_, i) => i !== index))
  }

  const updateInvitation = (index: number, field: string, value: any) => {
    const updated = [...invitations]
    updated[index] = { ...updated[index], [field]: value }
    setInvitations(updated)
  }

  const handleInviteSubmit = () => {
    const validInvitations = invitations.filter(inv => inv.email && inv.role)
    if (validInvitations.length > 0) {
      onInvite(validInvitations)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Members to Space</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {invitations.map((invitation, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Invitation {index + 1}</h4>
                {invitations.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeInvitation(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={invitation.email}
                    onChange={(e) => updateInvitation(index, 'email', e.target.value)}
                    placeholder="member@example.com"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role *
                  </label>
                  <Select
                    value={invitation.role}
                    onValueChange={(value) => updateInvitation(index, 'role', value)}
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {role.replace('space_', '').replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Custom Permissions */}
              <div>
                <h5 className="font-medium mb-2">Permission Overrides</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'canInviteMembers', label: 'Can Invite Members' },
                    { key: 'canManageChannels', label: 'Can Manage Channels' },
                    { key: 'canDeleteMessages', label: 'Can Delete Messages' },
                    { key: 'canMentionEveryone', label: 'Can Mention Everyone' },
                  ].map(perm => (
                    <div key={perm.key}>
                      <label className="block text-sm font-medium mb-1">
                        {perm.label}
                      </label>
                      <Select
                        value={invitation.customPermissions?.[perm.key] || 'inherit'}
                        onValueChange={(value) => {
                          const updated = { ...invitation.customPermissions, [perm.key]: value }
                          updateInvitation(index, 'customPermissions', updated)
                        }}
                      >
                        <option value="inherit">Inherit from Role</option>
                        <option value="allow">Allow</option>
                        <option value="deny">Deny</option>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Access */}
              <div>
                <h5 className="font-medium mb-2">Channel Access</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {channels.map(channel => (
                    <div key={channel.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">#{channel.name}</span>
                      <Select
                        value={
                          invitation.channelAccess?.find(ca => ca.channelId === channel.id)?.access || 'full'
                        }
                        onValueChange={(value) => {
                          const currentAccess = invitation.channelAccess || []
                          const existingIndex = currentAccess.findIndex(ca => ca.channelId === channel.id)

                          let updatedAccess
                          if (existingIndex >= 0) {
                            updatedAccess = [...currentAccess]
                            updatedAccess[existingIndex] = { channelId: channel.id, access: value }
                          } else {
                            updatedAccess = [...currentAccess, { channelId: channel.id, access: value }]
                          }

                          updateInvitation(index, 'channelAccess', updatedAccess)
                        }}
                      >
                        <option value="full">Full Access</option>
                        <option value="read">Read Only</option>
                        <option value="none">No Access</option>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Message */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={invitation.message || ''}
                  onChange={(e) => updateInvitation(index, 'message', e.target.value)}
                  placeholder="Add a personal message to the invitation..."
                />
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <Button variant="outline" onClick={addInvitation}>
              Add Another Invitation
            </Button>

            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleInviteSubmit}>
                Send Invitations ({invitations.filter(inv => inv.email).length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## Implementation Summary

This hierarchical permission system provides:

1. **Multi-Level Role Hierarchy**: Global → Space → Channel permissions
2. **Granular Permission Control**: Individual permission overrides at each level
3. **Flexible Member Management**: Sophisticated invitation system with custom permissions
4. **Security-First Design**: Proper validation and access control at every level
5. **Scalable Architecture**: Supports complex organizational structures

The system integrates seamlessly with the existing Payload CMS architecture while providing Discord-like collaboration features with enterprise-grade permission management.
