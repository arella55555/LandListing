import express from "express";
import { migrate } from "./src/config/migrate";

const app = express();
const PORT = 5000;

async function startServer() {
  await migrate();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
