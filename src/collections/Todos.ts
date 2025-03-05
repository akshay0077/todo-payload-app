import { CollectionConfig } from 'payload/types'
import { Access, FieldAccess } from 'payload/types'

// Helper function to get tenant ID safely
const getTenantId = (user: any): string | null => {
  if (!user?.tenant) return null
  return typeof user.tenant === 'string' ? user.tenant : user.tenant.id
}

export const Todos: CollectionConfig = {
  slug: 'todos',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'status', 'dueDate', 'assignedTo', 'tenant'],
  },
  access: {
    // Only authenticated users can read todos
    read: ({ req: { user } }) => {
      if (!user) return false

      // Admins can read all todos
      if (user.roles?.includes('admin')) return true

      // Users can only read todos from their tenant
      const tenantId = getTenantId(user)
      if (!tenantId) return false

      return {
        tenant: {
          equals: tenantId,
        },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return true // Any authenticated user can create todos
    },
    update: ({ req: { user } }) => {
      if (!user) return false

      // Admins can update any todo
      if (user.roles?.includes('admin')) return true

      // Users can only update todos from their tenant
      const tenantId = getTenantId(user)
      if (!tenantId) return false

      return {
        tenant: {
          equals: tenantId,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false

      // Admins can delete any todo
      if (user.roles?.includes('admin')) return true

      // Users can only delete todos from their tenant
      const tenantId = getTenantId(user)
      if (!tenantId) return false

      return {
        tenant: {
          equals: tenantId,
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'todo',
      options: [
        {
          label: 'To Do',
          value: 'todo',
        },
        {
          label: 'In Progress',
          value: 'in-progress',
        },
        {
          label: 'Done',
          value: 'done',
        },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      options: [
        {
          label: 'High',
          value: 'high',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'Low',
          value: 'low',
        },
      ],
    },
    {
      name: 'dueDate',
      type: 'date',
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: {
        description: 'The user assigned to this todo',
      },
      // Only show users from the same tenant
      filterOptions: ({ req: { user } }) => {
        if (!user) return false
        if (user.roles?.includes('admin')) return true

        const tenantId = getTenantId(user)
        if (!tenantId) return false

        return {
          tenant: {
            equals: tenantId,
          },
        }
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'The tenant this todo belongs to',
        readOnly: true, // Prevent manual tenant changes
      },
      // Only show the user's tenant
      filterOptions: ({ req: { user } }) => {
        if (!user) return false
        if (user.roles?.includes('admin')) return true

        const tenantId = getTenantId(user)
        if (!tenantId) return false

        return {
          id: {
            equals: tenantId,
          },
        }
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'The user who created this todo',
      },
    },
  ],
  hooks: {
    beforeChange: [
      // Set the tenant and creator automatically
      async ({ req, data }) => {
        if (req.user) {
          const tenantId = getTenantId(req.user)

          // Set tenant from logged in user
          if (!data.tenant && tenantId) {
            data.tenant = tenantId
          }

          // Set creator on creation
          if (!data.createdBy) {
            data.createdBy = req.user.id
          }

          // If no assignee, assign to creator
          if (!data.assignedTo) {
            data.assignedTo = req.user.id
          }

          // Ensure users can't assign to a different tenant
          if (!req.user.roles?.includes('admin') && tenantId) {
            data.tenant = tenantId
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
