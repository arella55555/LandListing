import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});