// server.ts

// Import necessary libraries and modules
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import serverConfig, { environment } from './config';
import { getAmountForCurrency, verifyApiKey } from './utils';
import {
  QuoteRequest,
  QuoteResponse,
  ProductResponse,
  Pricing,
  AuthorizeRequest,
  AuthorizeResponse,
  AuthorizeProductResponse,
  ConfirmRequest,
  ExpiredOrderRequest
} from './types';
import logger from './logger';

// Initialize Prisma Client for database interactions
const prisma = new PrismaClient();

// Initialize Fastify instance
const fastify = Fastify({ logger: true });

// Enable CORS with specified options for API security and flexibility
fastify.register(cors, {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Supported HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed HTTP headers
});

fastify.get("/products", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const productData = ((await prisma.product.findMany({
      include: {
        pricing: true
      }
    })));

    reply.status(200).send({ productData })
  } catch (err) {
    logger.error(err)
    reply.status(500).send({ message: 'Internal Server Error. There was an error getting products.' })
  }
})

fastify.register((instance, opts, next) => {
  // Middleware to verify API key
  instance.addHook("preHandler", async (request, reply) => {
    const apiKey = request.headers["authorization"];
    if (!verifyApiKey(apiKey as string)) {
      reply.status(401).send({ error: "Unauthorized" });
    }
  });

  // POST endpoint to get a quote for products
  instance.post("/quote", async (request: FastifyRequest<{ Body: QuoteRequest }>, reply: FastifyReply) => {
    const { products } = request.body;

    try {
      const response: QuoteResponse = {
        products: [],
        totals: [],
      };

      const currencyTotals: { [key: string]: Pricing } = {};

      for (const product of products) {
        const { product_id, quantity } = product;

        // Fetch product pricing from the database
        const productData = await prisma.product.findUnique({
          where: { id: parseInt(product_id.toString()) },
          include: {
            pricing: true,
          },
        });

        if (!productData) {
          reply.status(404).send({ error: `Product with ID ${product_id} not found` });
          return;
        }

        const productResponse: ProductResponse = {
          product_id: product_id,
          quantity: quantity,
          pricing: [],
        };

        for (const price of productData.pricing) {
          const totalAmount = price.amount * quantity;

          productResponse.pricing.push({
            currency: price.currency,
            currency_type: price.currency_type,
            currency_address: price.currency_address,
            amount: totalAmount,
          });

          if (!currencyTotals[price.currency]) {
            currencyTotals[price.currency] = {
              currency: price.currency,
              currency_type: price.currency_type,
              currency_address: price.currency_address,
              amount: 0,
            };
          }

          currencyTotals[price.currency].amount += totalAmount;
        }

        response.products.push(productResponse);
      }

      response.totals = Object.values(currencyTotals);

      reply.send(response);
    } catch (error: any) {
      logger.error("Error fetching product quote:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // POST endpoint to authorize a sale
  instance.post("/authorize", async (request: FastifyRequest<{ Body: AuthorizeRequest }>, reply: FastifyReply) => {
    const { recipient_address, currency, products } = request.body;
    const reservationTimeMs = parseInt(process.env.RESERVATION_TIME_MS || '300000');

    try {
      const response: AuthorizeResponse = {
        reference: `O${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        currency: currency,
        products: [],
      };

      const now = new Date();
      const expiresAt = new Date(now.getTime() + reservationTimeMs);

      // Use a transaction to ensure data integrity
      await prisma.$transaction(async (prisma) => {
        for (const product of products) {
          let { product_id, quantity } = product;
          product_id = parseInt(product_id.toString());

          // Fetch available stock items from the database
          const availableStockItems = await prisma.stockItem.findMany({
            where: { product_id: product_id, available: true },
            include: {
              Product: true
            },
            take: quantity,
          });

          if (availableStockItems.length < quantity) {
            throw new Error(`Not enough stock for product ID ${product_id}`);
          }

          for (const stockItem of availableStockItems) {
            const productResponse: AuthorizeProductResponse = {
              product_id: product_id,
              collection_address: stockItem.Product.contract_address,
              contract_type: 'ERC721', // or 'ERC1155' depending on your contract type
              detail: [
                {
                  token_id: stockItem.token_id, // Use the stock item's token ID
                  amount: await getAmountForCurrency(prisma, product_id, currency),
                },
              ],
            };

            // Reserve the stock
            await prisma.reservation.create({
              data: {
                reference: response.reference,
                product_id: product_id,
                token_id: stockItem.token_id,
                currency: currency,
                recipient_address: recipient_address,
                expires_at: expiresAt,
                quantity: 1, // Add the missing quantity field
              },
            });

            // Mark the stock item as not available
            await prisma.stockItem.update({
              where: { id: stockItem.id },
              data: { available: false },
            });

            response.products.push(productResponse);
          }
        }
      });
      const mappedResponse = {
        currency: response.currency,
        reference: response.reference,
        products: response.products.map((product) => { return { ...product, product_id: product.product_id.toString() } })
      }

      reply.send(mappedResponse);
    } catch (error: any) {
      logger.error(error)
      logger.error("Error authorizing sale:", error.message);
      reply.status(500).send({ error: error.message });
    }
  });

  // POST endpoint to confirm a sale
  instance.post("/confirm", async (request: FastifyRequest<{ Body: ConfirmRequest }>, reply: FastifyReply) => {
    const { reference, tx_hash, token_id_hash, recipient_address, order } = request.body;

    try {
      const reservation = await prisma.reservation.findFirst({
        where: { reference: reference }
      });

      if (!reservation) {
        reply.status(404).send({ error: `Order with reference ${reference} not found` });
        return;
      }

      // Create a confirmation record
      await prisma.confirmation.create({
        data: {
          reference: reference,
          tx_hash: tx_hash,
          token_id_hash: token_id_hash,
          recipient_address: recipient_address,
          contract_address: order.contract_address,
          total_amount: order.total_amount,
          deadline: order.deadline,
          created_at: order.created_at,
          currency: order.currency,
          product_id: reservation.product_id,
          token_id: reservation.token_id,
        },
      });

      // Remove the reservation
      await prisma.reservation.delete({
        where: { id: reservation.id },
      });

      reply.send({ status: 'success' });
    } catch (error: any) {
      logger.error("Error confirming transaction:", error.message);
      reply.status(500).send({ error: error.message });
    }
  });

  // POST endpoint to handle expired orders
  fastify.post("/expire", async (request: FastifyRequest<{ Body: ExpiredOrderRequest }>, reply: FastifyReply) => {
    const { reference } = request.body;

    try {
      const reservation = await prisma.reservation.findFirst({
        where: { reference: reference }
      });

      logger.info(JSON.stringify(reservation));

      if (!reservation) {
        reply.status(404).send({ error: `Order with reference ${reference} not found` });
        return;
      }

      // Release the stock
      const stockItem = await prisma.stockItem.findFirst({
        where: { token_id: reservation.token_id }
      });

      // Release the stock
      await prisma.stockItem.update({
        where: { id: stockItem?.id, token_id: reservation.token_id },
        data: { available: true },
      });

      // Delete the reservation
      await prisma.reservation.delete({
        where: { id: reservation.id },
      });

      reply.send({ status: 'success' });
    } catch (error: any) {
      logger.error("Error expiring order:", error.message);
      reply.status(500).send({ error: error.message });
    }
  });

  next();
})


// Start the server
const start = async () => {
  try {
    await fastify.listen({
      port: serverConfig[environment].PORT,
      host: serverConfig[environment].HOST_IP,
    });
    logger.info(`Server running at http://${serverConfig[environment].HOST_IP}:${serverConfig[environment].PORT}`);
  } catch (err: any) {
    logger.error("Error starting server:", err);
    process.exit(1);
  }
};

start();