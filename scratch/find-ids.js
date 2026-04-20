
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

const REPORT_NAME_TARGET = "MODULO LOGISTICA";

async function findWorkspaceId() {
    const msalConfig = {
        auth: {
            clientId: envVars.PBI_CLIENT_ID,
            authority: `https://login.microsoftonline.com/${envVars.PBI_TENANT_ID}`,
            clientSecret: envVars.PBI_CLIENT_SECRET,
        }
    };

    const clientApp = new msal.ConfidentialClientApplication(msalConfig);

    try {
        const authResponse = await clientApp.acquireTokenByUsernamePassword({
            scopes: ["https://analysis.windows.net/powerbi/api/.default"],
            username: envVars.PBI_USERNAME,
            password: envVars.PBI_PASSWORD,
        });

        const accessToken = authResponse.accessToken;

        // Listar reportes para encontrar el Workspace ID
        const response = await axios.get("https://api.powerbi.com/v1.0/myorg/reports", {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const reports = response.data.value;
        const target = reports.find(r => r.name.includes(REPORT_NAME_TARGET));

        if (target) {
            console.log("¡REPORTE ENCONTRADO!");
            console.log(`Nombre: ${target.name}`);
            console.log(`Report ID: ${target.id}`);
            console.log(`Workspace ID: ${target.datasetWorkspaceId || 'N/A'}`);
            
            // Si el datasetWorkspaceId es N/A, intentamos buscar en los grupos
            if (!target.datasetWorkspaceId) {
                console.log("\nBuscando Grupos (Workspaces)...");
                const groupsResponse = await axios.get("https://api.powerbi.com/v1.0/myorg/groups", {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const group = groupsResponse.data.value.find(g => g.name === "Tableros Power BI GM");
                if (group) {
                    console.log(`Workspace ID (desde Grupos): ${group.id}`);
                }
            }
        } else {
            console.log("No se encontró el reporte en la lista general.");
        }
        
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

findWorkspaceId();
