
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

async function discoverAll() {
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
        const headers = { 'Authorization': `Bearer ${accessToken}` };

        console.log("1. Listando Áreas de Trabajo (Groups)...");
        const groupsRes = await axios.get("https://api.powerbi.com/v1.0/myorg/groups", { headers });
        const groups = groupsRes.data.value;
        
        for (const group of groups) {
            console.log(`\n📂 Workspace: ${group.name} (ID: ${group.id})`);
            
            console.log(`   - Listando reportes del workspace...`);
            const reportsRes = await axios.get(`https://api.powerbi.com/v1.0/myorg/groups/${group.id}/reports`, { headers });
            const reports = reportsRes.data.value;
            
            reports.forEach(r => {
                console.log(`   📊 Reporte: ${r.name} (ID: ${r.id})`);
            });
        }
        
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

discoverAll();
