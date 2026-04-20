/**
 * prisma/seed.ts
 * Datos iniciales: admin, perfiles base, módulos de ejemplo
 */

import { PrismaClient, ResourceType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Crear Empresa Principal: Gran Molino
  const company = await prisma.company.upsert({
    where: { taxId: '20600000001' },
    update: {},
    create: {
      name: 'Gran Molino S.A.C.',
      tradeName: 'Gran Molino',
      taxId: '20600000001',
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      sidebarBgColor: '#0f172a',
      sidebarTextColor: '#94a3b8',
    },
  })

  // 2. Crear Sede Principal
  const branch = await prisma.branch.upsert({
    where: { code: 'MAIN-01' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Sede Principal - Lima',
      code: 'MAIN-01',
      isActive: true,
    },
  })

  console.log('✅ Empresa y Sede creadas:', company.name)

  // 3. Perfiles base vinculados a la empresa
  const adminProfile = await prisma.profile.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Administrador' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Administrador',
      description: 'Acceso total al sistema',
    },
  })

  const analystProfile = await prisma.profile.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Analista BI' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Analista BI',
      description: 'Acceso a dashboards de Power BI',
    },
  })

  console.log('✅ Perfiles creados vinculados a la empresa')

  // 4. Usuario administrador vinculado a la empresa
  const passwordHash = await bcrypt.hash('Admin@123!', 12)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@granmolino.com' },
    update: {},
    create: {
      email: 'admin@granmolino.com',
      passwordHash,
      firstName: 'Administrador',
      lastName: 'Gran Molino',
      companyId: company.id,
      isActive: true,
    },
  })

  // Asignar el perfil de administrador al usuario
  await prisma.userProfile.upsert({
    where: { userId_profileId: { userId: adminUser.id, profileId: adminProfile.id } },
    update: {},
    create: { userId: adminUser.id, profileId: adminProfile.id },
  })

  // Asignar sede principal al usuario
  await prisma.userBranch.upsert({
    where: { userId_branchId: { userId: adminUser.id, branchId: branch.id } },
    update: {},
    create: { userId: adminUser.id, branchId: branch.id, isPrimary: true },
  })

  console.log('✅ Usuario admin configurado para Gran Molino')

  // 5. Módulos base vinculados a la empresa
  const adminModule = await prisma.module.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Administración' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Administración',
      icon: 'Settings',
      order: 100,
    },
  })

  const reportesModule = await prisma.module.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Reportes BI' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Reportes BI',
      icon: 'BarChart2',
      order: 10,
    },
  })

  console.log('✅ Estructura de módulos creada')

  // 6. Recursos (Páginas de administración)
  const resourcesData = [
    { name: 'Usuarios', url: '/dashboard/admin/users', order: 1 },
    { name: 'Perfiles', url: '/dashboard/admin/profiles', order: 2 },
    { name: 'Módulos y Recursos', url: '/dashboard/admin/modules', order: 3 },
    { name: 'Ajustes de Empresa', url: '/dashboard/admin/settings', order: 4 },
  ]

  for (const res of resourcesData) {
    const resource = await prisma.resource.upsert({
      where: { moduleId_name: { moduleId: adminModule.id, name: res.name } },
      update: {},
      create: {
        moduleId: adminModule.id,
        name: res.name,
        type: ResourceType.PAGE,
        url: res.url,
        order: res.order,
      },
    })

    // Dar permisos automáticos al perfil Admin para estos recursos
    await prisma.profileResource.upsert({
      where: { profileId_resourceId: { profileId: adminProfile.id, resourceId: resource.id } },
      update: {},
      create: { 
        profileId: adminProfile.id, 
        resourceId: resource.id, 
        canView: true, 
        canEdit: true, 
        canDelete: true 
      },
    })
  }

  // Activar el módulo de administración para el perfil Admin
  await prisma.profileModule.upsert({
    where: { profileId_moduleId: { profileId: adminProfile.id, moduleId: adminModule.id } },
    update: {},
    create: { profileId: adminProfile.id, moduleId: adminModule.id, canAccess: true },
  })

  console.log('✅ Recursos y permisos configurados')
  console.log('')
  console.log('🎉 Seed completado exitosamente para GRAN MOLINO!')
  console.log('──────────────────────────────────────')
  console.log('  Admin Email:    admin@granmolino.com')
  console.log('  Password:       Admin@123!')
  console.log('──────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
