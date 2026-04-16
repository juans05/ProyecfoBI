const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedBranches() {
  console.log('🌱 Creando sedes iniciales...')
  
  // 1. Crear Sedes
  const branch1 = await prisma.branch.upsert({
    where: { code: 'SEDE_NORTE' },
    update: {},
    create: {
      name: 'Sede Norte (Chiclayo)',
      code: 'SEDE_NORTE'
    }
  })

  const branch2 = await prisma.branch.upsert({
    where: { code: 'SEDE_SUR' },
    update: {},
    create: {
      name: 'Sede Sur (Lima)',
      code: 'SEDE_SUR'
    }
  })

  console.log('✅ Sedes creadas:', branch1.name, branch2.name)

  // 2. Asignar Admin a ambas sedes
  const admin = await prisma.user.findUnique({ where: { email: 'admin@empresa.com' } })
  if (admin) {
    await prisma.userBranch.upsert({
      where: { userId_branchId: { userId: admin.id, branchId: branch1.id } },
      update: {},
      create: { userId: admin.id, branchId: branch1.id, isPrimary: true }
    })

    await prisma.userBranch.upsert({
      where: { userId_branchId: { userId: admin.id, branchId: branch2.id } },
      update: {},
      create: { userId: admin.id, branchId: branch2.id, isPrimary: false }
    })
    console.log('✅ Admin asignado a sedes Norte y Sur')
  }

  // 3. Vincular recursos existentes a la Sede Norte (por defecto)
  await prisma.resource.updateMany({
    data: { branchId: branch1.id }
  })
  console.log('✅ Recursos existentes vinculados a Sede Norte')
}

seedBranches()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
