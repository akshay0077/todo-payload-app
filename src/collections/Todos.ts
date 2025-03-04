import { CollectionConfig } from 'payload'

export const Todos: CollectionConfig = {
  slug: 'todos',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'status', 'dueDate', 'assignedTo', 'tenant'],
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
          // Set tenant from logged in user
          if (!data.tenant) {
            data.tenant = req.user.tenant
          }

          // Set creator on creation
          if (!data.createdBy) {
            data.createdBy = req.user.id
          }

          // If no assignee, assign to creator
          if (!data.assignedTo) {
            data.assignedTo = req.user.id
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
