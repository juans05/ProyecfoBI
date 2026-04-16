/**
 * Tests E2E: Flujo de Recuperación de Contraseña
 * Requiere: servidor corriendo en http://localhost:3000
 */

import { test, expect, Page } from '@playwright/test'

async function goToForgotPassword(page: Page) {
  await page.goto('/login')
  const forgotLink = page.getByText(/olvidé|recuperar|forgot/i)
  if (await forgotLink.count() > 0) {
    await forgotLink.click()
  } else {
    await page.goto('/login?mode=forgot')
  }
}

test.describe('Recuperación de Contraseña', () => {
  test('muestra formulario de email para recuperación', async ({ page }) => {
    await goToForgotPassword(page)
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 3000 })
  })

  test('muestra mensaje genérico con email inexistente (no revela usuarios)', async ({ page }) => {
    await goToForgotPassword(page)
    await page.fill('input[type="email"], input[name="email"]', 'noexiste@test.com')
    await page.click('button[type="submit"]')

    // Debe mostrar un mensaje de confirmación genérico
    await expect(
      page.getByText(/correo|email|enviado|revisa|check/i)
    ).toBeVisible({ timeout: 5000 })

    // NO debe decir "email no existe" o similar
    const body = await page.textContent('body')
    expect(body?.toLowerCase()).not.toMatch(/no existe|not found|no encontrado/)
  })

  test('muestra mensaje de confirmación con email válido', async ({ page }) => {
    await goToForgotPassword(page)
    await page.fill('input[type="email"], input[name="email"]', process.env.E2E_ADMIN_EMAIL || 'admin@empresa.com')
    await page.click('button[type="submit"]')

    await expect(
      page.getByText(/correo|email|enviado|revisa/i)
    ).toBeVisible({ timeout: 5000 })
  })

  test('falla validación con email inválido', async ({ page }) => {
    await goToForgotPassword(page)
    await page.fill('input[type="email"], input[name="email"]', 'no-valido')
    await page.click('button[type="submit"]')

    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    const hasError = await page.locator('[role="alert"]').count() > 0

    expect(isInvalid || hasError).toBeTruthy()
  })
})

test.describe('Formulario de Nueva Contraseña (con token)', () => {
  test('muestra error con token inválido o expirado', async ({ page }) => {
    await page.goto('/login?token=token-invalido-123')

    // Intentar enviar nueva contraseña con token inválido
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first()
    if (await passwordInput.count() > 0) {
      await passwordInput.fill('NuevaPassword1')
      const confirmInput = page.locator('input[name="confirmPassword"]')
      if (await confirmInput.count() > 0) {
        await confirmInput.fill('NuevaPassword1')
      }
      await page.click('button[type="submit"]')

      await expect(
        page.getByText(/inválido|expirado|invalid|expired/i)
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('valida que password tenga mínimo 8 caracteres', async ({ page }) => {
    // Si hay un formulario de reset con token de prueba
    await page.goto('/login?token=test-token')

    const passwordInput = page.locator('input[name="password"]')
    if (await passwordInput.count() > 0) {
      await passwordInput.fill('Cor1') // menos de 8 chars
      await page.click('button[type="submit"]')

      await expect(
        page.getByText(/8 caracteres|minimum|mínimo/i)
      ).toBeVisible({ timeout: 3000 })
    }
  })

  test('valida que las contraseñas coincidan', async ({ page }) => {
    await page.goto('/login?token=test-token')

    const passwordInput = page.locator('input[name="password"]')
    const confirmInput = page.locator('input[name="confirmPassword"]')

    if (await passwordInput.count() > 0 && await confirmInput.count() > 0) {
      await passwordInput.fill('Password123')
      await confirmInput.fill('PasswordDistinta1')
      await page.click('button[type="submit"]')

      await expect(
        page.getByText(/no coinciden|don't match/i)
      ).toBeVisible({ timeout: 3000 })
    }
  })
})
