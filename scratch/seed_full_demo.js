const { PrismaClient, ResourceType } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando Equipamiento de Empresa Demo...')
  const passwordHash = await bcrypt.hash('Root@123!', 12)

  // 1. Obtener o Crear la Empresa
  const company = await prisma.company.upsert({
    where: { taxId: '123456789' },
    update: { isActive: true },
    create: {
      name: 'Empresa Demo S.A.',
      taxId: '123456789',
      isActive: true
    }
  })

  // 2. Crear Perfil de Administrador para la Empresa
  const adminProfile = await prisma.profile.upsert({
    where: { 
      companyId_name: { name: 'Administrador', companyId: company.id } 
    },
    update: {},
    create: {
      name: 'Administrador',
      description: 'Acceso total a la empresa',
      companyId: company.id
    }
  })

  // 3. Crear Usuario Admin y Vincular Perfil
  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: { companyId: company.id },
    create: {
      email: 'admin@demo.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Demo',
      companyId: company.id,
      isActive: true
    }
  })

  await prisma.userProfile.upsert({
    where: { userId_profileId: { userId: user.id, profileId: adminProfile.id } },
    update: {},
    create: { userId: user.id, profileId: adminProfile.id }
  })

  // 4. Crear Módulo de ADMINISTRACIÓN
  const modAdmin = await prisma.module.upsert({
    where: { companyId_name: { name: 'Administración', companyId: company.id } },
    update: {},
    create: {
      name: 'Administración',
      icon: 'Settings',
      order: 1,
      companyId: company.id
    }
  })

  // 5. Crear Recursos de Administración
  const resUsers = await prisma.resource.upsert({
    where: { moduleId_name: { name: 'Usuarios', moduleId: modAdmin.id } },
    update: {},
    create: {
      name: 'Usuarios',
      type: ResourceType.PAGE,
      url: '/dashboard/admin/users',
      moduleId: modAdmin.id,
      order: 1
    }
  })

  const resProfiles = await prisma.resource.upsert({
    where: { moduleId_name: { name: 'Perfiles', moduleId: modAdmin.id } },
    update: {},
    create: {
      name: 'Perfiles',
      type: ResourceType.PAGE,
      url: '/dashboard/admin/profiles',
      moduleId: modAdmin.id,
      order: 2
    }
  })

  const resModules = await prisma.resource.upsert({
    where: { moduleId_name: { name: 'Módulos y Recursos', moduleId: modAdmin.id } },
    update: {},
    create: {
      name: 'Módulos y Recursos',
      type: ResourceType.PAGE,
      url: '/dashboard/admin/modules',
      moduleId: modAdmin.id,
      order: 3
    }
  })

  // 6. Crear Módulo de BI y el Dashboard Gran Molino
  const modBI = await prisma.module.upsert({
    where: { companyId_name: { name: 'Inteligencia de Negocios', companyId: company.id } },
    update: {},
    create: {
      name: 'Inteligencia de Negocios',
      icon: 'BarChart2',
      order: 2,
      companyId: company.id
    }
  })

  const resBI = await prisma.resource.upsert({
    where: { moduleId_name: { name: 'Dashboard Gran Molino', moduleId: modBI.id } },
    update: {
      powerbiWorkspaceId: '6a58a303-1362-4bcc-986b-9b7e000563d0', // Tu Tenant como temporal o el ID del workspace
      powerbiReportId: '35881d36-f7e7-4a26-aa78-f379712bce9c',
    },
    create: {
      name: 'Dashboard Gran Molino',
      type: ResourceType.POWERBI,
      moduleId: modBI.id,
      order: 1,
      powerbiWorkspaceId: '6a58a303-1362-4bcc-986b-9b7e000563d0',
      powerbiReportId: '35881d36-f7e7-4a26-aa78-f379712bce9c',
    }
  })

  // 7. Otorgar Permisos al Perfil sobre los Recursos
  const resources = [resUsers, resProfiles, resModules, resBI]
  for (const res of resources) {
    await prisma.profileResource.upsert({
      where: { profileId_resourceId: { profileId: adminProfile.id, resourceId: res.id } },
      update: { canView: true, canEdit: true, canDelete: true },
      create: {
        profileId: adminProfile.id,
        resourceId: res.id,
        canView: true,
        canEdit: true,
        canDelete: true
      }
    })
  }

  console.log('✅ Empresa Demo equipada con éxito.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
