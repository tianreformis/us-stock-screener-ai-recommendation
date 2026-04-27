import { PrismaClient } from '@prisma/client';
import { TOP_US_STOCKS } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  for (const stock of TOP_US_STOCKS) {
    try {
      const existing = await prisma.stock.findUnique({
        where: { symbol: stock.symbol },
      });

      if (!existing) {
        await prisma.stock.create({
          data: {
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
          },
        });
        console.log(`Added: ${stock.symbol}`);
      }
    } catch (error) {
      console.error(`Failed to add ${stock.symbol}:`, error);
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });