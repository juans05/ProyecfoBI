
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function testPassword() {
    const email = "root@sistema.com";
    const password = "Admin@123!";
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log("Usuario no encontrado");
        return;
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log(`¿Contraseña '${password}' es válida para ${email}?: ${isValid}`);
    console.log(`Estado usuario: isActive=${user.isActive}, isRoot=${user.isRoot}`);
}

testPassword().finally(() => prisma.$disconnect());
