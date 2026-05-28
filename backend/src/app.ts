import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Lupa.ph API running");
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

export default app;
