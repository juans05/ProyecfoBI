
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workspaceId = "4da969c0-70ff-41d6-b3ed-d2983387ad4e";

  console.log("🚀 Iniciando corrección de recursos de Power BI...");

  // 1. Actualizar el Workspace ID para todos los recursos de Power BI
  const updateWorkspace = await prisma.resource.updateMany({
    where: { type: 'POWERBI' },
    data: { powerbiWorkspaceId: workspaceId }
  });
  console.log(`✅ Actualizados ${updateWorkspace.count} recursos con el Workspace ID correcto.`);

  // 2. Corregir nombres y report IDs específicos si existen
  
  // Calidad (que apunta a Ventas) -> Renombrar a Ventas
  await prisma.resource.updateMany({
    where: { powerbiReportId: '3eac6cc4-fd99-4947-b124-d7212d578b44' },
    data: { name: 'Módulo VENTAS' }
  });

  // Calidad 2 (que apunta a Calidad) -> Renombrar a Calidad
  await prisma.resource.updateMany({
    where: { powerbiReportId: '4540d47e-f2cd-4f65-a688-dbc5f17b1c3a' },
    data: { name: 'Módulo CALIDAD' }
  });

  console.log("🎉 Corrección completada.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
