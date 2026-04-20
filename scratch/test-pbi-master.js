
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

async function testMasterUserConnection() {
    console.log("--- TEST DE CONEXIÓN (USUARIO MAESTRO CON SECRET) ---");
    
    const msalConfig = {
        auth: {
            clientId: envVars.PBI_CLIENT_ID,
            authority: `https://login.microsoftonline.com/${envVars.PBI_TENANT_ID}`,
            clientSecret: envVars.PBI_CLIENT_SECRET, // Agregamos el secret para que sea Confidential
        }
    };

    const clientApp = new msal.ConfidentialClientApplication(msalConfig);

    try {
        console.log("1. Solicitando Token mediante Usuario, Contraseña y Secret...");
        
        const authResponse = await clientApp.acquireTokenByUsernamePassword({
            scopes: ["https://analysis.windows.net/powerbi/api/.default"],
            username: envVars.PBI_USERNAME,
            password: envVars.PBI_PASSWORD,
        });

        if (authResponse && authResponse.accessToken) {
            console.log("✅ ÉXITO: Token de acceso obtenido con Usuario Maestro.");
            const accessToken = authResponse.accessToken;

            console.log("\n2. Validando acceso a Power BI API...");
            try {
                const response = await axios.get("https://api.powerbi.com/v1.0/myorg/reports", {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                console.log("✅ ÉXITO: Conexión establecida.");
                console.log(`Reportes disponibles: ${response.data.value.length}`);
            } catch (pbiError) {
                console.error("❌ ERROR en Power BI API:", pbiError.response?.data || pbiError.message);
            }
        }
    } catch (error) {
        console.error("❌ ERROR de MSAL:");
        console.error(error.message);
    }
}

testMasterUserConnection();
