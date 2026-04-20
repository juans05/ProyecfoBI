
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const resources = await prisma.resource.findMany({
    where: { type: 'POWERBI' }
  });
  console.log(JSON.stringify(resources, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
