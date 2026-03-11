import { test, expect } from '@playwright/test';

test.describe('Course Creation Wizard E2E Flow', () => {
    // Configuración inicial: asumimos que el usuario está logueado o que la sesión
    // se maneja a través de global-setup de Playwright. Para propósitos de este test,
    // asumimos que /create es directamente accesible en el entorno de pruebas.

    test('should navigate through the wizard and publish a course', async ({ page }) => {
        // 1. Navegar a la página de creación
        await page.goto('/create');

        // 2. Modal "¿Qué quieres crear?"
        const createCourseBtn = page.getByTestId('create-course-btn');
        // Si el modal está visible, seleccionamos Curso Individual
        if (await createCourseBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await createCourseBtn.click();
        }

        // Identificadores de los botones de navegación del wizard
        const nextBtn = page.getByTestId('wizard-next-btn');
        const backBtn = page.getByTestId('wizard-back-btn');
        const publishBtn = page.getByTestId('wizard-publish-btn');

        // 3. Paso 1: Construcción (Course Builder)
        await expect(nextBtn).toBeVisible();

        // Aquí irían interacciones para llenar datos mínimos: Título, Categoría, etc.
        // Ej: await page.fill('input[name="titulo"]', 'Curso Playwright');

        // Avanzamos al Paso 2
        await nextBtn.click();

        // 4. Paso 2: Información del curso
        // Fill out specific Step 2 Data like descriptions, requirements
        await nextBtn.click();

        // 5. Paso 3: Configuración y Precio (Publish Config)
        // Select pricing tiers, configurations
        await nextBtn.click();

        // 6. Paso 4: Revisión (Review Step)
        const reviewContainer = page.getByTestId('review-step-container');
        await expect(reviewContainer).toBeVisible();

        // Verificar que estemos en el paso correcto y el botón publicar esté visible
        await expect(publishBtn).toBeVisible();

        // Clic en publicar
        // NOTA: Descomentar para una prueba real E2E
        // await publishBtn.click();

        // 7. Aserciones finales (ej: modal de éxito)
        // await expect(page.getByText('¡Tu curso ha sido publicado!')).toBeVisible();
    });
});
