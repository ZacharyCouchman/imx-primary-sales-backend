import { config } from "@imtbl/sdk";
import { ServerConfig } from "./types";
require("dotenv").config();

// Ternary operator to set environment based on .env value
export const environment = process.env.ENVIRONMENT === "PRODUCTION" ? config.Environment.PRODUCTION : config.Environment.SANDBOX;

//Used for verification of the Passport JWTs
export const IMX_JWT_KEY_URL = "https://auth.immutable.com/.well-known/jwks.json?_gl=1*1g7a0qs*_ga*NDg1NTg3MDI3LjE2ODU1OTY1Mzg.*_ga_4JBHZ7F06X*MTY4ODUyNjkyNy4xNC4wLjE2ODg1MjY5MjcuMC4wLjA.*_ga_7XM4Y7T8YC*MTY4ODUyNjkyNy4yNy4wLjE2ODg1MjY5MjcuMC4wLjA.";

const serverConfig: ServerConfig = {
  [config.Environment.SANDBOX]: {
    API_URL: "https://api.sandbox.immutable.com",
    HUB_API_KEY: process.env.SANDBOX_HUB_IMMUTABLE_API_KEY!,
    RPS_API_KEY: process.env.SANDBOX_RPS_IMMUTABLE_API_KEY!,
    HOST_IP: process.env.SANDBOX_HOST_IP!,
    PORT: parseInt(process.env.SANDBOX_PORT!, 10),
    INVENTORY_API_KEY: process.env.INVENTORY_API_KEY!,
    collectionAddress: process.env.SANDBOX_COLLECTION_ADDRESS!,
    chainName: "imtbl-zkevm-testnet",
    enableWebhookVerification: true, //Should the server verify the webhook SNS messages?
    allowedTopicArn: "arn:aws:sns:us-east-2:783421985614:*", //Used for webhook SNS verification
    enableFileLogging: true, //Should logs be output to files or just console?
    logLevel: "debug",
  },
  [config.Environment.PRODUCTION]: {
    API_URL: "https://api.immutable.com",
    HUB_API_KEY: process.env.MAINNET_HUB_IMMUTABLE_API_KEY!,
    RPS_API_KEY: process.env.MAINNET_RPS_IMMUTABLE_API_KEY!,
    HOST_IP: process.env.MAINNET_HOST_IP!,
    PORT: parseInt(process.env.MAINNET_PORT!, 10),
    INVENTORY_API_KEY: process.env.INVENTORY_API_KEY!,
    collectionAddress: process.env.MAINNET_COLLECTION_ADDRESS!,
    chainName: "imtbl-zkevm-mainnet",
    enableWebhookVerification: true, //Should the server verify the webhook SNS messages?
    allowedTopicArn: "arn:aws:sns:us-east-2:362750628221:*", //Used for webhook SNS verification
    enableFileLogging: true, //Should logs be output to files or just console?
    logLevel: "debug",
  },
};

export default serverConfig;
