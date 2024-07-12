# Primary Sales Inventory Backend for conducting a sale using the Immutable Primary Sales Widget

This project is a backend API for running a primary sale using the Immutable Primary Sales widget. It is one part of the system that serves stock management or inventory endpoints for selling your ERC721s or ERC1155 items.

## Disclaimer

The sample code provided is for reference purposes only and is not officially supported by Immutable. It has undergone best effort testing by Immutable to ensure basic functionality. However, it is essential that you thoroughly test this sample code within your own environment to confirm its functionality and reliability before deploying it in a production setting. Immutable disclaims any liability for any issues that arise due to the use of this sample code. By using this sample code, you agree to perform due diligence in testing and verifying its suitability for your applications.

## Features


## Setup Instructions

1. Install the dependencies:
   ```
   npm i
   ```
2. Copy the example environment file and fill it with your API key, and DB path(should be `file:./allowList.db`):
   ```
   cp .env.example .env
   ```
4. Populate your metadata in `server.ts` by following [this](https://docs.immutable.com/docs/zkEVM/products/minting/metadata/format) format.
5. Run the DB migrations:
   ```
   npx prisma migrate dev
   ```
6. Load your database, https://sqlitebrowser.org/ is great for this. You can also write a script that uses the Prisma client to load the database. Make sure you have your address allowlisted, and quantity is 1, isLocked is 0, hasMinted is 0.

7. Run the development server:

   ```
   npm start
   ```

8. Create your webhook at https://hub.immutable.com/, use localtunnel for testing webhooks locally:

   ```
   npx localtunnel --port 3000
   ```

   Use the above URL for the webhook endpoint with the path `/webhook`. For example: `https://ten-rooms-vanish.loca.lt/webhook`.

## To-Do List

- [ ] Consider switching to Pino instead of Winston for logging
- [ ] Troubleshoot why all console.log are not showing up in the console with logger.info
- [ ] Add color coding to success or failure in the logs
- [ ] Generally type more things like the mint requests etc.
- [ ] Add ERC1155 support once the minting API is ready
- [ ] Add the ability to choose whether you want mintByQuantity or mintByID

## Tech Stack

- Prisma ORM
- sqlite3
