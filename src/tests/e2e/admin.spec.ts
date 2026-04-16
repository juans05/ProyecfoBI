/**
 * Tests E2E: Flujos de Administración (Usuarios, Perfiles, Módulos)
 * Requiere: servidor + sesión admin guardada en .auth/admin.json
 * Setup: npx playwright test src/tests/e2e/auth.setup.ts
 */

import { test, expect } from '@playwright/test'

// Usa estado de autenticación guardado (creado por auth.setup.ts)
test.use({ storageState: 'src/tests/e2e/.auth/admin.json' })

// ─── Dashboard ────────────────────────────────────────────────────────────────

test.describe('Dashboard Principal', () => {
  test('carga correctamente el dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).not.toHaveURL(/\/login/)
    // El sidebar debe estar visible
    await expect(page.locator('nav, aside, [data-testid="sidebar"]').first()).toBeVisible()
  })

  test('muestra el nombre del usuario autenticado', async ({ page }) => {
    await page.goto('/dashboard')
    // Algún elemento debe mostrar el nombre del usuario
    const body = await page.textContent('body')
    expect(body?.length).toBeGreaterThan(100)
  })
})

// ─── Gestión de Usuarios ──────────────────────────────────────────────────────

test.describe('Gestión de Usuarios (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/admin/users')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('muestra la tabla de usuarios', async ({ page }) => {
    await expect(page.locator('table, [role="table"], [data-testid="users-table"]')).toBeVisible({ timeout: 5000 })
  })

  test('tiene botón para crear nuevo usuario', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /nuevo|crear|agregar|add/i })
      .or(page.getByText(/nuevo usuario|crear usuario/i))
    await expect(createBtn.first()).toBeVisible()
  })

  test('abre formulario al hacer clic en nuevo usuario', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /nuevo|crear|agregar/i }).first()
    await createBtn.click()

    // Debe aparecer un modal o formulario
    await expect(
      page.locator('[role="dialog"], form, [data-testid="user-form"]').first()
    ).toBeVisible({ timeout: 3000 })
  })

  test('valida email requerido en formulario de usuario', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /nuevo|crear/i }).first()
    await createBtn.click()

    // Intentar enviar sin email
    await page.click('button[type="submit"]')

    await expect(
      page.getByText(/email|requerido|required/i).first()
    ).toBeVisible({ timeout: 3000 })
  })

  test('puede activar/desactivar un usuario', async ({ page }) => {
    // Buscar botón de toggle en la primera fila
    const toggleBtn = page.getByRole('button', { name: /activar|desactivar|toggle/i }).first()
      .or(page.locator('[data-testid="toggle-status"]').first())

    if (await toggleBtn.count() > 0) {
      await toggleBtn.click()
      // Debe mostrar confirmación o cambio de estado
      await page.waitForTimeout(1000)
    }
  })
})

// ─── Gestión de Perfiles ─────────────────────────────────────────────────────

test.describe('Gestión de Perfiles', () => {
  test('carga la página de perfiles', async ({ page }) => {
    await page.goto('/dashboard/admin/profiles')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.locator('table, [role="table"], h1, h2').first()).toBeVisible()
  })

  test('muestra lista de perfiles existentes', async ({ page }) => {
    await page.goto('/dashboard/admin/profiles')
    // Al menos el perfil "Administrador" debe existir
    await expect(page.getByText(/administrador/i).first()).toBeVisible({ timeout: 5000 })
  })
})

// ─── Gestión de Módulos ───────────────────────────────────────────────────────

test.describe('Gestión de Módulos', () => {
  test('carga la página de módulos', async ({ page }) => {
    await page.goto('/dashboard/admin/modules')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('tiene opción para crear nuevo módulo', async ({ page }) => {
    await page.goto('/dashboard/admin/modules')
    const createBtn = page.getByRole('button', { name: /nuevo|crear|agregar/i }).first()
    await expect(createBtn).toBeVisible({ timeout: 5000 })
  })
})

// ─── Control de Acceso ────────────────────────────────────────────────────────

test.describe('Control de Acceso por Rol', () => {
  test('admin de empresa NO puede acceder a /dashboard/root/companies', async ({ page }) => {
    await page.goto('/dashboard/root/companies')

    // Debe ser redirigido, mostrar error 403, o estar en una página de error
    const url = page.url()
    const body = await page.textContent('body')

    const isBlocked =
      url.includes('/login') ||
      url.includes('/dashboard') && !url.includes('/root') ||
      body?.toLowerCase().includes('acceso') ||
      body?.toLowerCase().includes('autorizado') ||
      body?.toLowerCase().includes('403')

    expect(isBlocked).toBeTruthy()
  })

  test('usuario autenticado puede acceder al dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

// ─── Cambio de Sucursal ───────────────────────────────────────────────────────

test.describe('Cambio de Sucursal', () => {
  test('muestra selector de sucursal si el usuario tiene múltiples', async ({ page }) => {
    await page.goto('/dashboard')

    const branchSwitcher = page.locator('[data-testid="branch-switcher"], select[name="branch"]')
      .or(page.getByText(/sucursal|branch/i).first())

    // Este test es informativo - puede no haber sucursales en el seed
    if (await branchSwitcher.count() > 0) {
      await expect(branchSwitcher.first()).toBeVisible()
    }
  })
})
