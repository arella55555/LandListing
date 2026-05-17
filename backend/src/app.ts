import express from "express";
import cors from "cors";
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/rolesRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/auth', roleRoutes);

//global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.get("/", (req, res) => {
  res.send("Lupa.ph API running");
});

export default app;
