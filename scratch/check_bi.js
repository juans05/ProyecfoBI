const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const resources = await prisma.resource.findMany({
    where: { type: 'POWERBI' }
  })
  console.log('--- BI RESOURCES ---')
  console.log(JSON.stringify(resources, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
