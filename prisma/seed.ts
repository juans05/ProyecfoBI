/**
 * prisma/seed.ts
 * Datos iniciales: admin, perfiles base, módulos de ejemplo
 */

import { PrismaClient, ResourceType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ─── Perfiles base ─────────────────────────────
  const adminProfile = await prisma.profile.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: {
      name: 'Administrador',
      description: 'Acceso total al sistema',
    },
  })

  const analystProfile = await prisma.profile.upsert({
    where: { name: 'Analista BI' },
    update: {},
    create: {
      name: 'Analista BI',
      description: 'Acceso a dashboards de Power BI',
    },
  })

  const viewerProfile = await prisma.profile.upsert({
    where: { name: 'Visualizador' },
    update: {},
    create: {
      name: 'Visualizador',
      description: 'Solo lectura de reportes asignados',
    },
  })

  console.log('✅ Perfiles creados:', adminProfile.name, analystProfile.name, viewerProfile.name)

  // ─── Usuario administrador ──────────────────────
  const passwordHash = await bcrypt.hash('Admin@123!', 12)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      email: 'admin@empresa.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
    },
  })

  // Asignar perfil Admin al usuario admin
  await prisma.userProfile.upsert({
    where: { userId_profileId: { userId: adminUser.id, profileId: adminProfile.id } },
    update: {},
    create: { userId: adminUser.id, profileId: adminProfile.id },
  })

  console.log('✅ Usuario admin creado:', adminUser.email)

  // ─── Módulos base (estructura del menú) ────────
  const adminModule = await prisma.module.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Administración',
      icon: 'Settings',
      order: 100,
    },
  })

  const reportesModule = await prisma.module.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Reportes BI',
      icon: 'BarChart2',
      order: 10,
    },
  })

  console.log('✅ Módulos creados')

  // ─── Recursos de Administración ────────────────
  const resAdminUsers = await prisma.resource.upsert({
    where: { id: '00000000-0000-0000-0001-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000001',
      moduleId: adminModule.id,
      name: 'Usuarios',
      type: ResourceType.PAGE,
      url: '/dashboard/admin/users',
      order: 1,
    },
  })

  const resAdminProfiles = await prisma.resource.upsert({
    where: { id: '00000000-0000-0000-0001-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000002',
      moduleId: adminModule.id,
      name: 'Perfiles',
      type: ResourceType.PAGE,
      url: '/dashboard/admin/profiles',
      order: 2,
    },
  })

  const resAdminModules = await prisma.resource.upsert({
    where: { id: '00000000-0000-0000-0001-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000003',
      moduleId: adminModule.id,
      name: 'Módulos',
      type: ResourceType.PAGE,
      url: '/dashboard/admin/modules',
      order: 3,
    },
  })

  const resAdminResources = await prisma.resource.upsert({
    where: { id: '00000000-0000-0000-0001-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000004',
      moduleId: adminModule.id,
      name: 'Recursos',
      type: ResourceType.PAGE,
      url: '/dashboard/admin/resources',
      order: 4,
    },
  })

  const resAdminPerms = await prisma.resource.upsert({
    where: { id: '00000000-0000-0000-0001-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000005',
      moduleId: adminModule.id,
      name: 'Permisos',
      type: ResourceType.PAGE,
      url: '/dashboard/admin/permissions',
      order: 5,
    },
  })

  console.log('✅ Recursos admin creados')

  // ─── Permisos del perfil Administrador ─────────
  // El admin tiene acceso a todos los módulos y recursos
  await prisma.profileModule.upsert({
    where: { profileId_moduleId: { profileId: adminProfile.id, moduleId: adminModule.id } },
    update: {},
    create: { profileId: adminProfile.id, moduleId: adminModule.id, canAccess: true },
  })

  await prisma.profileModule.upsert({
    where: { profileId_moduleId: { profileId: adminProfile.id, moduleId: reportesModule.id } },
    update: {},
    create: { profileId: adminProfile.id, moduleId: reportesModule.id, canAccess: true },
  })

  const adminResources = [resAdminUsers, resAdminProfiles, resAdminModules, resAdminResources, resAdminPerms]

  for (const resource of adminResources) {
    await prisma.profileResource.upsert({
      where: { profileId_resourceId: { profileId: adminProfile.id, resourceId: resource.id } },
      update: {},
      create: {
        profileId: adminProfile.id,
        resourceId: resource.id,
        canView: true,
        canEdit: true,
        canDelete: true,
      },
    })
  }

  console.log('✅ Permisos del administrador configurados')
  console.log('')
  console.log('🎉 Seed completado exitosamente!')
  console.log('')
  console.log('──────────────────────────────────')
  console.log('  Credenciales del administrador:')
  console.log('  Email:    admin@empresa.com')
  console.log('  Password: Admin@123!')
  console.log('──────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
