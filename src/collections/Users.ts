import { CollectionConfig } from 'payload'
import slugify from 'slugify'

const createTenant = async (payload, userId, userName, userEmail) => {
  try {
    // Generate tenant details
    const tenantName = userName || userEmail.split('@')[0]
    let tenantSlug = slugify(tenantName, {
      lower: true,
      strict: true,
      replacement: '-',
    })

    // Check if tenant with this slug exists
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        slug: {
          equals: tenantSlug,
        },
      },
    })

    // If tenant exists, append a random number to make slug unique
    if (existingTenant.docs.length > 0) {
      tenantSlug = `${tenantSlug}-${Math.floor(Math.random() * 1000)}`
    }

    console.log('Generated tenant details:', { tenantName, tenantSlug })

    // Create tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: tenantName,
        slug: tenantSlug,
        owner: userId,
        isActive: true,
      },
    })

    console.log('Tenant created:', tenant)

    // Update user with tenant reference
    const updatedUser = await payload.update({
      collection: 'users',
      id: userId,
      data: {
        tenant: tenant.id,
      },
    })

    console.log('User updated with tenant:', updatedUser)
    return { tenant, updatedUser }
  } catch (error) {
    console.error('Error in createTenant:', error)
    throw error
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // lock time in ms
  },
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: false,
      admin: {
        description: 'The tenant this user belongs to',
        position: 'sidebar',
      },
    },
  ],
  endpoints: [
    {
      path: '/create-tenant',
      method: 'post',
      handler: async (req, res) => {
        try {
          const { user } = req

          if (!user) {
            return res.status(401).json({ message: 'Unauthorized' })
          }

          // First check if user already has a tenant
          const existingUser = await req.payload.find({
            collection: 'users',
            where: {
              id: {
                equals: user.id,
              },
            },
          })

          if (!existingUser.docs.length) {
            return res.status(404).json({ message: 'User not found' })
          }

          const userData = existingUser.docs[0]

          // If user already has a tenant, return it
          if (userData.tenant) {
            try {
              const existingTenant = await req.payload.findByID({
                collection: 'tenants',
                id: userData.tenant,
              })
              return res.json({
                success: true,
                tenant: existingTenant,
                user: userData,
                message: 'Tenant already exists',
              })
            } catch (error) {
              console.log(
                'Error fetching existing tenant, will create new one:',
                error
              )
            }
          }

          console.log('Creating tenant with details:', {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
          })

          const result = await createTenant(
            req.payload,
            user.id,
            user.name,
            user.email
          )
          return res.json({
            success: true,
            tenant: result.tenant,
            user: result.updatedUser,
          })
        } catch (error) {
          console.error('Error in create-tenant endpoint:', error)
          return res.status(500).json({
            message: 'Error creating tenant',
            details: error.message,
          })
        }
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data }) => {
        if (!data.name && data.email) {
          data.name = data.email.split('@')[0]
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        console.log('afterChange hook triggered:', {
          operation,
          email: doc.email,
        })

        // Only create tenant on create operation and if no tenant exists
        if (operation !== 'create' || doc.tenant) {
          console.log('Skipping tenant creation:', {
            operation,
            hasTenant: !!doc.tenant,
          })
          return doc
        }

        try {
          console.log('Starting tenant creation for user:', {
            email: doc.email,
            id: doc.id,
          })

          // Instead of using setTimeout, create tenant immediately
          const result = await createTenant(
            req.payload,
            doc.id,
            doc.name,
            doc.email
          )
          return result.updatedUser
        } catch (error) {
          console.error('Error in tenant creation:', error)
          // Don't throw the error to allow user creation to succeed
          return doc
        }
      },
    ],
  },
}
