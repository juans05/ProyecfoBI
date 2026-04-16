const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function seedRoot() {
  console.log('🌱 Creando Administrador Root (SaaS)...')
  
  const passwordHash = await bcrypt.hash('Root@123!', 12)

  // 1. Crear el usuario ROOT (Sin empresa asignada)
  const root = await prisma.user.upsert({
    where: { email: 'root@sistema.com' },
    update: {},
    create: {
      email: 'root@sistema.com',
      passwordHash,
      firstName: 'Administrador',
      lastName: 'del Sistema',
      isRoot: true,
      isActive: true
    }
  })

  console.log('✅ Usuario Root creado: root@sistema.com')

  // 2. Crear una Empresa de Prueba para validar el aislamiento
  const companyA = await prisma.company.upsert({
    where: { taxId: '123456789' },
    update: {},
    create: {
      name: 'Empresa Demo S.A.',
      taxId: '123456789',
      isActive: true,
      allowRootAccess: false // Por defecto bloqueado
    }
  })

  console.log('✅ Empresa Demo creada:', companyA.name)

  // 3. Crear el Administrador de la Empresa Demo
  const adminA = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Demo',
      companyId: companyA.id,
      isActive: true
    }
  })

  console.log('✅ Administrador de Empresa Demo creado: admin@demo.com')
}

seedRoot()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
