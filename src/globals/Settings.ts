import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  fields: [
    {
      name: 'welcomeMessage',
      type: 'text',
      defaultValue: 'Get stuff done!',
    },
    {
      name: 'defaultCategories',
      type: 'array',
      fields: [
        {
          name: 'category',
          type: 'text',
        },
      ],
    },
  ],
}
