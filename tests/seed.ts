// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const product1 = await prisma.product.create({
    data: {
      name: 'Product 1',
      description: 'Description for product 1',
      rarity: 'common',
      contract_address: '0x123',
      metadata_id: 'metadata1',
      pricing: {
        create: [
          {
            currency: 'USDC',
            currency_type: 'crypto',
            currency_address: '',
            amount: 1,
          },
          {
            currency: 'ETH',
            currency_type: 'crypto',
            currency_address: '',
            amount: 0.00033,
          },
          {
            currency: 'USD',
            currency_type: 'fiat',
            amount: 1,
          },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Product 2',
      description: 'Description for product 2',
      rarity: 'rare',
      contract_address: '0x456',
      metadata_id: 'metadata2',
      pricing: {
        create: [
          {
            currency: 'USDC',
            currency_type: 'crypto',
            currency_address: '',
            amount: 2,
          },
          {
            currency: 'ETH',
            currency_type: 'crypto',
            amount: 0.00066,
          },
          {
            currency: 'USD',
            currency_type: 'fiat',
            amount: 2,
          },
        ],
      },
    },
  });

  const addStockItems = async (productId: number, tokenIdStart: number, tokenIdEnd: number) => {
    for (let tokenId = tokenIdStart; tokenId <= tokenIdEnd; tokenId++) {
      await prisma.stockItem.create({
        data: {
          product_id: productId,
          token_id: tokenId.toString(),
        },
      });
    }
  };

  await addStockItems(product1.id, 1000, 1099);
  await addStockItems(product2.id, 2000, 2099);

  console.log('Seeded 100 stock items for each product.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });