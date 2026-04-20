
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updatePowerBIResource() {
    try {
        // IDs correctos encontrados en el descubrimiento
        const WORKSPACE_ID = "4da969c0-70ff-41d6-b3ed-d2983387ad4e";
        const REPORT_ID = "07b10b90-76d5-4dcf-b80e-b0066db10053";

        const updateResult = await prisma.resource.update({
            where: {
                id: "ea857eba-1bc7-4175-9e45-0d3f700ac630"
            },
            data: {
                name: "Módulo Logística",
                powerbiReportId: REPORT_ID,
                powerbiWorkspaceId: WORKSPACE_ID
            }
        });

        console.log("¡RECURSO ACTUALIZADO CON ÉXITO!");
        console.log(JSON.stringify(updateResult, null, 2));

    } catch (error) {
        console.error("Error al actualizar:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updatePowerBIResource();
