import express from "express";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);



app.get("/", (req, res) => {
  res.send("Lupa.ph API running");
});

export default app;
