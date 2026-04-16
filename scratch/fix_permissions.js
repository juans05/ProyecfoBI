const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function syncAdminPermissions() {
  console.log("🛠️ Sincronizando permisos de Administrador...")
  
  // 1. Obtener perfil admin de la empresa Demo
  const company = await prisma.company.findUnique({ where: { taxId: '123456789' } })
  const adminProfile = await prisma.profile.findFirst({
    where: { name: 'Administrador', companyId: company.id }
  })

  if (!adminProfile) {
    console.log("❌ No se encontró el perfil administrador")
    return
  }

  // 2. Obtener todos los módulos y recursos de la empresa
  const modules = await prisma.module.findMany({ where: { companyId: company.id } })
  const resources = await prisma.resource.findMany({ 
    where: { module: { companyId: company.id } } 
  })

  // 3. Asegurar que el admin tenga acceso a TODO
  for (const mod of modules) {
    await prisma.profileModule.upsert({
      where: { profileId_moduleId: { profileId: adminProfile.id, moduleId: mod.id } },
      update: { canAccess: true },
      create: { profileId: adminProfile.id, moduleId: mod.id, canAccess: true }
    })
  }

  for (const res of resources) {
    await prisma.profileResource.upsert({
      where: { profileId_resourceId: { profileId: adminProfile.id, resourceId: res.id } },
      update: { canView: true, canEdit: true, canDelete: true },
      create: { profileId: adminProfile.id, resourceId: res.id, canView: true, canEdit: true, canDelete: true }
    })
  }

  console.log("✅ Permisos sincronizados. Refresca la página.")
}

syncAdminPermissions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
