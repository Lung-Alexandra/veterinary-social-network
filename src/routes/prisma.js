const prismacli =require('@prisma/client');

const prisma= new prismacli.PrismaClient();

module.exports = prisma;