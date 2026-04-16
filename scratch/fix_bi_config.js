const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fix() {
  console.log('🛠️ Reparando configuración de "RPUEBA DE bi"...')
  const result = await prisma.resource.updateMany({
    where: { 
      name: 'RPUEBA DE bi',
      type: 'POWERBI'
    },
    data: { 
      powerbiWorkspaceId: '6a58a303-1362-4bcc-986b-9b7e000563d0' 
    }
  })
  console.log(`✅ Se actualizaron ${result.count} registros.`)
}

fix().catch(console.error).finally(() => prisma.$disconnect())
