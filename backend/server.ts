import app from "./src/app";
import { migrate } from "./src/config/migrate";

const PORT = 5000;

async function startServer() {
  await migrate();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();