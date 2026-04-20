
import { PowerBIService } from "./src/domains/bi/powerbi.service";
import * as dotenv from "dotenv";

dotenv.config();

async function testPowerBI() {
    console.log("--- Iniciando prueba de conexión a Power BI ---");
    
    // Estos son los IDs que están en tu .env actualmente (que sospechamos podrían estar mal el workspace)
    const workspaceId = process.env.PBI_WORKSPACE_ID;
    const reportId = "CUALQUIER_ID_PARA_PROBAR_TOKEN"; // Necesitamos uno real para el Embed Config completo

    console.log(`Usando Workspace ID: ${workspaceId}`);
    
    try {
        console.log("1. Intentando obtener Token de Acceso (MSAL)...");
        // Acceder al método privado mediante cast si es necesario o hacerlo público temporalmente
        const token = await (PowerBIService as any).getAccessToken();
        console.log("✅ Token de Acceso obtenido con éxito!");
        console.log("Token (primeros 50 caracteres):", token.substring(0, 50) + "...");

        if (workspaceId && workspaceId !== process.env.PBI_TENANT_ID) {
            console.log("\n2. Intentando obtener Embed Config (Requiere Workspace y Report IDs reales)...");
            // Aquí fallará si los IDs no son reales, pero el paso 1 ya valida los permisos de Azure.
        } else {
            console.log("\n⚠️ Saltando paso 2: El Workspace ID en .env parece ser igual al Tenant ID.");
            console.log("Por favor, pon un Workspace ID real en el .env para probar el Embed Config.");
        }

    } catch (error: any) {
        console.error("\n❌ Error en la prueba:");
        console.error(error.message);
    }
}

testPowerBI();
