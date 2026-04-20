
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function resetPasswords() {
    const password = "Admin@123!";
    const passwordHash = await bcrypt.hash(password, 12);
    
    console.log(`--- RESTABLECIENDO CONTRASEÑAS ---`);
    
    const users = ["admin@demo.com", "root@sistema.com", "admin@empresa.com"];
    
    for (const email of users) {
        try {
            const user = await prisma.user.update({
                where: { email },
                data: { 
                    passwordHash,
                    isActive: true 
                }
            });
            console.log(`✅ Contraseña restablecida para: ${email}`);
        } catch (e) {
            console.log(`ℹ️ Usuario no encontrado (o ya existe): ${email}`);
        }
    }
    
    console.log(`\n¡Listo! Ahora puedes intentar loguearte con la clave: ${password}`);
}

resetPasswords().finally(() => prisma.$disconnect());
