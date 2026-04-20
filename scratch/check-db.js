
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkResources() {
    try {
        const resources = await prisma.resource.findMany({
            where: {
                type: "POWERBI"
            }
        });
        console.log("RECURSOS POWERBI ACTUALES:");
        console.log(JSON.stringify(resources, null, 2));
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkResources();
