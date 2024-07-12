const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const axios = require("axios");
import { promisify } from "util";
const SnsValidator = require("sns-validator");
const validator = new SnsValidator();
import fs from "fs";
import logger from "./logger";
import { PassportIDToken, ServerConfig } from "./types";
import serverConfig, { environment } from "./config";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

// Function to verify the JWT token
export async function verifyPassportToken(IDtoken: string, jwk: string): Promise<void> {
  try {
    const pem = jwkToPem(jwk);
    const verifyPromise = promisify(jwt.verify);
    try {
      const decoded = await verifyPromise(IDtoken, pem, { algorithms: ["RS256"] });
      // Stringify the decoded token to log the details properly
      logger.info(`JWT verified: ${JSON.stringify(decoded, null, 2)}`);
    } catch (err) {
      // Stringify the error to display all its properties
      logger.error(`JWT verification failed: ${JSON.stringify(err, null, 2)}`);
      throw err;
    }
  } catch (error) {
    // Stringify the error to display all its properties
    logger.error(`Error during token verification: ${JSON.stringify(error, null, 2)}`);
    throw error;
  }
}

// Function to decode the JWT token
export async function decodePassportToken(IDtoken: string): Promise<PassportIDToken> {
  const decoded: PassportIDToken = jwt.decode(IDtoken, { complete: true });
  // Ensure the decoded data is logged as a stringified object for clarity
  logger.debug(`Decoded JWT: ${JSON.stringify(decoded, null, 2)}`);
  return decoded;
}

// Function to verify the SNS signature
export async function verifySNSSignature(webhookPayload: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    validator.validate(webhookPayload, (err: Error) => {
      if (err) {
        // Log the error as a stringified object to capture details
        logger.error(`Signature validation failed: ${JSON.stringify(err, null, 2)}`);
        reject(false);
      } else {
        logger.info("Signature verification successful");
        resolve(true);
      }
    });
  });
}

export async function readAddressesFromCSV(filePath: string): Promise<{ address: string; signature: string }[]> {
  try {
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    // Split the data into lines
    const lines = data.split("\n");

    // Skip the first line (header) and process the rest
    return lines
      .slice(1)
      .filter((line) => line.length > 0)
      .map((line) => {
        const [address, signature] = line.split(",");
        return { address, signature };
      });
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
}

// Function to verify the API key
export function verifyApiKey(apiKey: string): boolean {
  // Replace 'your_hardcoded_api_key' with the actual API key you expect
  const expectedApiKey = serverConfig[environment].INVENTORY_API_KEY || 'your_api_key';
  return apiKey === expectedApiKey;
}

// Helper function to get amount for a specific currency
export async function getAmountForCurrency(
  prisma: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  product_id: number,
  currency: string): Promise<number> {
  const productData = await prisma.product.findUnique({
    where: { id: product_id },
    include: {
      pricing: true,
    },
  });

  const pricing = productData?.pricing.find((p) => p.currency === currency);
  return pricing ? pricing.amount : 0;
}
