import { config } from "@imtbl/sdk";
import { ServerConfig } from "./types";
import { Provider } from "@ethersproject/providers";
require("dotenv").config();

// Ternary operator to set environment based on .env value
export const environment = process.env.ENVIRONMENT === "PRODUCTION" ? config.Environment.PRODUCTION : config.Environment.SANDBOX;

const serverConfig: ServerConfig = {
  [config.Environment.SANDBOX]: {
    HOST_IP: process.env.SANDBOX_HOST_IP!,
    PORT: parseInt(process.env.SANDBOX_PORT!, 10),
    INVENTORY_API_KEY: process.env.INVENTORY_API_KEY!,
    RESERVATION_TIME: process.env.RESERVATION_TIME!,
    enableFileLogging: true, //Should logs be output to files or just console?
    logLevel: "debug",
  },
  [config.Environment.PRODUCTION]: {
    HOST_IP: process.env.MAINNET_HOST_IP!,
    PORT: parseInt(process.env.MAINNET_PORT!, 10),
    INVENTORY_API_KEY: process.env.INVENTORY_API_KEY!,
    RESERVATION_TIME: process.env.RESERVATION_TIME!,
    enableFileLogging: true, //Should logs be output to files or just console?
    logLevel: "debug",
  },
};

export default serverConfig;
