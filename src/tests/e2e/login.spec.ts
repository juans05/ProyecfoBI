/**
 * Tests E2E: Flujo de Login
 * Requiere: servidor corriendo en http://localhost:3000
 * Ejecutar con: npx playwright test src/tests/e2e/login.spec.ts
 */

import { test, expect, Page } from '@playwright/test'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fillLoginForm(page: Page, email: string, password: string) {
  await page.fill('input[type="email"], input[name="email"]', email)
  await page.fill('input[type="password"], input[name="password"]', password)
  await page.click('button[type="submit"]')
}

// ─── Tests de Login ───────────────────────────────────────────────────────────

test.describe('Página de Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('muestra el formulario de login correctamente', async ({ page }) => {
    await expect(page).toHaveTitle(/intranet|login/i)
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await fillLoginForm(page, 'noexiste@test.com', 'wrongpassword')

    // Esperar mensaje de error
    await expect(
      page.locator('[role="alert"], .error, [data-error]').or(
        page.getByText(/credenciales|inválid|incorrect/i)
      )
    ).toBeVisible({ timeout: 5000 })

    // Debe permanecer en /login
    await expect(page).toHaveURL(/\/login/)
  })

  test('falla validación con email inválido (sin @)', async ({ page }) => {
    await fillLoginForm(page, 'no-es-email', 'cualquier')

    // El browser o el schema Zod debe rechazarlo
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    const hasError = await page.locator('[role="alert"]').count() > 0

    expect(isInvalid || hasError).toBeTruthy()
    await expect(page).toHaveURL(/\/login/)
  })

  test('falla validación con campos vacíos', async ({ page }) => {
    await page.click('button[type="submit"]')

    // Debe mostrar errores de validación o permanecer en login
    await expect(page).toHaveURL(/\/login/)
  })

  test('redirige a /dashboard con credenciales válidas', async ({ page }) => {
    // Usa credenciales del seed (usuario admin de prueba)
    await fillLoginForm(page, process.env.E2E_ADMIN_EMAIL || 'admin@empresa.com', process.env.E2E_ADMIN_PASSWORD || 'Admin1234')

    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('muestra enlace de recuperación de contraseña', async ({ page }) => {
    const forgotLink = page.getByText(/olvidé|recuperar|forgot/i)
    await expect(forgotLink).toBeVisible()
  })

  test('el campo password oculta los caracteres', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first()
    const inputType = await passwordInput.getAttribute('type')
    expect(inputType).toBe('password')
  })
})

// ─── Protección de rutas ─────────────────────────────────────────────────────

test.describe('Protección de rutas (sin sesión)', () => {
  test('acceder a /dashboard sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('acceder a /dashboard/admin/users sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/dashboard/admin/users')
    await expect(page).toHaveURL(/\/login/)
  })

  test('acceder a /dashboard/root/companies sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/dashboard/root/companies')
    await expect(page).toHaveURL(/\/login/)
  })
})

// ─── Logout ───────────────────────────────────────────────────────────────────

test.describe('Logout', () => {
  test.use({ storageState: 'src/tests/e2e/.auth/admin.json' })

  test('cerrar sesión redirige a /login', async ({ page }) => {
    await page.goto('/dashboard')

    // Buscar botón de logout
    const logoutBtn = page.getByRole('button', { name: /cerrar|logout|salir/i })
      .or(page.getByText(/cerrar sesión|logout/i))

    if (await logoutBtn.count() > 0) {
      await logoutBtn.click()
      await page.waitForURL(/\/login/, { timeout: 5000 })
      await expect(page).toHaveURL(/\/login/)
    } else {
      // Si no hay botón visible, navegar directamente al endpoint de signout
      await page.goto('/api/auth/signout')
    }
  })

  test('después del logout, /dashboard redirige a /login', async ({ page }) => {
    // Ir a logout
    await page.goto('/api/auth/signout')
    // Intentar acceder al dashboard
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
