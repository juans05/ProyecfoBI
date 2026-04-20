
const msal = require("@azure/msal-node");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Cargar .env manualmente para evitar dependencias extra
const envPath = path.join(__dirname, "..", ".env");
const envVars = fs.readFileSync(envPath, "utf-8").split("\n").reduce((acc, line) => {
    const [key, ...value] = line.split("=");
    if (key && value) acc[key.trim()] = value.join("=").trim().replace(/^"(.*)"$/, "$1");
    return acc;
}, {});

async function testConnection() {
    console.log("--- TEST DE CONEXIÓN POWER BI ---");
    
    const msalConfig = {
        auth: {
            clientId: envVars.PBI_CLIENT_ID,
            authority: `https://login.microsoftonline.com/${envVars.PBI_TENANT_ID}`,
            clientSecret: envVars.PBI_CLIENT_SECRET,
        }
    };

    const clientApp = new msal.ConfidentialClientApplication(msalConfig);

    try {
        console.log("1. Solicitando Token a Microsoft Entra ID...");
        const authResponse = await clientApp.acquireTokenByClientCredential({
            scopes: ["https://analysis.windows.net/powerbi/api/.default"],
        });

        if (authResponse && authResponse.accessToken) {
            console.log("✅ ÉXITO: Token de acceso obtenido.");
            console.log("Token:", authResponse.accessToken.substring(0, 40) + "...");
            
            const accessToken = authResponse.accessToken;

            // Paso 2: Intentar listar los reports (esto valida si la App tiene permisos en Power BI)
            console.log("\n2. Validando permisos en Power BI (Listando reportes)...");
            try {
                const response = await axios.get("https://api.powerbi.com/v1.0/myorg/reports", {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                console.log("✅ ÉXITO: Conexión con Power BI establecida.");
                console.log(`Se encontraron ${response.data.value.length} reportes accesibles.`);
                
                if (response.data.value.length > 0) {
                    console.log("\nReportes disponibles:");
                    response.data.value.forEach(r => {
                        console.log(`- Nombre: ${r.name} | ID: ${r.id} | Workspace: ${r.datasetWorkspaceId}`);
                    });
                } else {
                    console.log("\n⚠️ OJO: No se encontraron reportes. Asegúrate de haber agregado la App como Miembro/Admin en el Workspace de Power BI.");
                }
            } catch (pbiError) {
                console.error("❌ ERROR al conectar con Power BI API:");
                console.error(pbiError.response?.data || pbiError.message);
                console.log("\n💡 Ayuda: Si el token de Azure funcionó pero esto falló, falta el permiso dentro del Portal de Power BI.");
            }

        } else {
            console.log("❌ ERROR: No se recibió token.");
        }
    } catch (error) {
        console.error("❌ ERROR de MSAL (Azure):");
        console.error(error.message);
    }
}

testConnection();
