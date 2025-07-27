require("dotenv").config();

import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function seedDemoData() {
  console.log("🌱 Seeding demo data...");

  try {
    // Clear existing data
    await prisma.review.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.reviewer.deleteMany();
    await prisma.product.deleteMany();

    // Create demo products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          id: "B07JW9H4J1",
          name: "USB Cable - High Speed Charging & Data Sync",
          category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
          actualPrice: "₹1,099",
          rating: 4.2,
          aboutProduct: "High Compatibility with iPhone, fast charging, durable design",
          productLink: "https://www.amazon.in/example-product-1",
        }
      }),
      prisma.product.create({
        data: {
          id: "B098NS6PVG",
          name: "Ambrane Type C Cable 60W Fast Charging",
          category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
          actualPrice: "₹349",
          rating: 4.0,
          aboutProduct: "Compatible with all Type C devices, Quick Charging 3.0",
          productLink: "https://www.amazon.in/example-product-2",
        }
      }),
      prisma.product.create({
        data: {
          id: "B096MSW6CT",
          name: "iPhone Charging Cable & Data Sync",
          category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
          actualPrice: "₹1,899",
          rating: 3.9,
          aboutProduct: "Fast charger with safety protections, ultra high quality",
          productLink: "https://www.amazon.in/example-product-3",
        }
      })
    ]);

    // Create demo reviewers
    const reviewers = await Promise.all([
      prisma.reviewer.create({
        data: {
          id: "USER001",
          name: "Manav"
        }
      }),
      prisma.reviewer.create({
        data: {
          id: "USER002", 
          name: "Adarsh Gupta"
        }
      }),
      prisma.reviewer.create({
        data: {
          id: "USER003",
          name: "Sundeep"
        }
      })
    ]);

    // Create demo sales
    const sales = await Promise.all([
      prisma.sale.create({
        data: {
          productId: "B07JW9H4J1",
          dateSold: new Date("2025-01-15"),
        }
      }),
      prisma.sale.create({
        data: {
          productId: "B098NS6PVG",
          dateSold: new Date("2025-01-16"),
        }
      }),
      prisma.sale.create({
        data: {
          productId: "B096MSW6CT",
          dateSold: new Date("2025-01-17"),
        }
      })
    ]);

    // Create demo reviews
    const reviews = await Promise.all([
      prisma.review.create({
        data: {
          id: "REV001",
          productId: "B07JW9H4J1",
          reviewerId: "USER001",
          title: "Excellent quality cable",
          content: "Looks durable, charging is fine too. No complaints so far.",
        }
      }),
      prisma.review.create({
        data: {
          id: "REV002",
          productId: "B098NS6PVG", 
          reviewerId: "USER002",
          title: "Good product for the price",
          content: "Quality is good at this price and the cable is long. Charging power is excellent.",
        }
      }),
      prisma.review.create({
        data: {
          id: "REV003",
          productId: "B096MSW6CT",
          reviewerId: "USER003", 
          title: "Works as expected",
          content: "Not quite durable but works fine for basic charging needs.",
        }
      })
    ]);

    console.log(`✅ Created ${products.length} products`);
    console.log(`✅ Created ${reviewers.length} reviewers`);
    console.log(`✅ Created ${sales.length} sales`);
    console.log(`✅ Created ${reviews.length} reviews`);
    
  } catch (error) {
    console.error("❌ Failed to seed demo data:", error);
    throw error;
  }
}

async function main() {
  await seedDemoData();
  console.log("🎉 Demo data seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Demo data seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });