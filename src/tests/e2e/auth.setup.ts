/**
 * Setup E2E: Autenticación
 * Crea sesiones guardadas para reusar en tests E2E.
 * Ejecutar: npx playwright test src/tests/e2e/auth.setup.ts --project=setup
 */

import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const AUTH_DIR = 'src/tests/e2e/.auth'

setup('Autenticar admin y guardar sesión', async ({ page }) => {
  // Crear directorio si no existe
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true })
  }

  await page.goto('/login')

  await page.fill(
    'input[type="email"], input[name="email"]',
    process.env.E2E_ADMIN_EMAIL || 'admin@empresa.com'
  )
  await page.fill(
    'input[type="password"], input[name="password"]',
    process.env.E2E_ADMIN_PASSWORD || 'Admin1234'
  )
  await page.click('button[type="submit"]')

  // Esperar redirección al dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  await expect(page).toHaveURL(/\/dashboard/)

  // Guardar estado de autenticación
  await page.context().storageState({ path: path.join(AUTH_DIR, 'admin.json') })
})
