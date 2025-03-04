document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm')
  const errorMessage = document.getElementById('errorMessage')

  // Get the API URL based on the current environment
  const BASE_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://todoapp.com'

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    // Clear previous error messages
    errorMessage.textContent = ''
    errorMessage.classList.remove('show')

    // Get form data
    const formData = {
      email: form.email.value.trim(),
      password: form.password.value,
      confirmPassword: form.confirmPassword.value,
    }

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      showError('Password must be at least 8 characters long')
      return
    }

    try {
      showError('Creating your account...') // Show loading state

      // Step 1: Create user
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.email.split('@')[0],
        }),
      })

      const userData = await response.json()

      if (!response.ok) {
        throw new Error(
          userData.errors?.[0]?.message ||
            userData.message ||
            'Registration failed'
        )
      }

      showError('Account created! Setting up your workspace...') // Update status

      // Step 2: Log in to get auth token
      const loginResponse = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        throw new Error('Login failed after registration')
      }

      // Step 3: Create tenant if not already created
      if (!userData.tenant) {
        showError('Creating your workspace...') // Update status

        try {
          const tenantResponse = await fetch(
            `${BASE_URL}/api/users/create-tenant`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${loginData.token}`,
              },
            }
          )

          const tenantData = await tenantResponse.json()

          if (
            !tenantResponse.ok &&
            !tenantData.message?.includes('already exists')
          ) {
            console.error('Tenant creation error:', tenantData)
            throw new Error(tenantData.details || 'Failed to create workspace')
          }
        } catch (error) {
          console.error('Tenant creation error:', error)
          // Don't throw error here - continue with redirect
        }
      }

      showError('Success! Redirecting to login...') // Show success message

      // Store minimal user data
      const userInfo = {
        id: userData.id,
        email: userData.email,
      }
      localStorage.setItem('userData', JSON.stringify(userInfo))

      // Redirect to login page
      setTimeout(() => {
        window.location.href = `${BASE_URL}/login`
      }, 1000)
    } catch (error) {
      console.error('Registration error:', error)
      showError(
        error.message ||
          'An error occurred during registration. Please try again.'
      )
    }
  })

  function showError(message) {
    errorMessage.textContent = message
    errorMessage.classList.add('show')
  }

  // Username validation and formatting
  const usernameInput = form.username
  usernameInput.addEventListener('input', (e) => {
    // Convert to lowercase and remove special characters
    let value = e.target.value.toLowerCase()
    value = value.replace(/[^a-z0-9-]/g, '')
    e.target.value = value
  })
})
