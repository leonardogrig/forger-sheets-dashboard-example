require("dotenv").config();

import { PrismaClient, UserRole } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    // First, try to find the user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create the user if they don't exist
      console.log(`Creating user: ${email}`);
      user = await prisma.user.create({
        data: {
          email,
          role: UserRole.ADMIN,
          name: email.split('@')[0], // Use email prefix as name
        },
      });
    } else {
      // Update existing user to admin
      console.log(`Updating existing user: ${email}`);
      user = await prisma.user.update({
        where: { email },
        data: { role: UserRole.ADMIN },
      });
    }

    console.log(`✅ User ${email} is now an admin`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    
  } catch (error) {
    console.error("❌ Failed to make user admin:", error);
    throw error;
  }
}

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  
  if (!email) {
    console.error("❌ Please provide an email address");
    console.log("Usage: npx tsx scripts/make-admin.ts <email>");
    console.log("Or set ADMIN_EMAIL environment variable");
    process.exit(1);
  }

  console.log(`🔧 Making ${email} an admin...`);
  await makeAdmin(email);
  console.log("🎉 Admin setup completed!");
}

main()
  .catch((e) => {
    console.error("❌ Admin setup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });