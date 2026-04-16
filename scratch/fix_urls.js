const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixUrls() {
  console.log('🔍 Iniciando reparación de URLs...')
  
  const resources = await prisma.resource.findMany({
    where: {
      url: {
        startsWith: '/admin/'
      }
    }
  })

  for (const res of resources) {
    const newUrl = `/dashboard${res.url}`
    console.log(`Updating ${res.name}: ${res.url} -> ${newUrl}`)
    await prisma.resource.update({
      where: { id: res.id },
      data: { url: newUrl }
    })
  }

  console.log('✅ URLs actualizadas correctamente.')
}

fixUrls()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
