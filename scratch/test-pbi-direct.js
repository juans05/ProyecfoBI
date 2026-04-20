
const msal = require("@azure/msal-node");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Cargar .env manualmente
const envPath = path.join(__dirname, "..", ".env");
const envVars = fs.readFileSync(envPath, "utf-8").split("\n").reduce((acc, line) => {
    const [key, ...value] = line.split("=");
    if (key && value) acc[key.trim()] = value.join("=").trim().replace(/^"(.*)"$/, "$1");
    return acc;
}, {});

// USAR EL ID DE LOGÍSTICA QUE NOS PASÓ EL USUARIO
const REPORT_ID = "07b10b90-76d5-4dcf-b80e-b0066db10053";

async function testDirectReportConnection() {
    console.log("--- TEST DE CONEXIÓN DIRECTA (REPORTE LOGÍSTICA) ---");
    
    const msalConfig = {
        auth: {
            clientId: envVars.PBI_CLIENT_ID,
            authority: `https://login.microsoftonline.com/${envVars.PBI_TENANT_ID}`,
            clientSecret: envVars.PBI_CLIENT_SECRET,
        }
    };

    const clientApp = new msal.ConfidentialClientApplication(msalConfig);

    try {
        console.log("1. Obteniendo Token de Acceso...");
        const authResponse = await clientApp.acquireTokenByClientCredential({
            scopes: ["https://analysis.windows.net/powerbi/api/.default"],
        });

        const accessToken = authResponse.accessToken;
        console.log("✅ Token obtenido.");

        console.log(`\n2. Intentando acceder al Reporte ID: ${REPORT_ID}...`);
        console.log("(Nota: Esto funcionará si la App es Miembro del Workspace)");

        try {
            // Intentamos obtener los detalles del reporte
            const response = await axios.get(`https://api.powerbi.com/v1.0/myorg/reports/${REPORT_ID}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            console.log("✅ ÉXITO TOTAL: Se pudo leer el reporte.");
            console.log(`Nombre del reporte: ${response.data.name}`);
            console.log(`Workspace ID: ${response.data.datasetWorkspaceId}`);
            
            console.log("\n3. Intentando generar Embed Token...");
            const tokenResponse = await axios.post(
                `https://api.powerbi.com/v1.0/myorg/reports/${REPORT_ID}/GenerateToken`,
                { accessLevel: "View" },
                { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
            );
            console.log("✅ ÉXITO: ¡Token de visualización generado con éxito!");
            console.log("¡LISTO! Ya podemos integrar esto en la Intranet.");

        } catch (pbiError) {
            console.error("❌ ERROR al acceder al reporte:");
            console.error(pbiError.response?.data || pbiError.message);
            console.log("\n💡 Ayuda: Si sale '404 Not Found' o 'Forbidden', es porque falta agregar la App como Miembro en el Workspace.");
        }
        
    } catch (error) {
        console.error("❌ ERROR de MSAL:");
        console.error(error.message);
    }
}

testDirectReportConnection();
