import express from "express";
import cors from "cors";
import authRoutes from './routes/authRoutes';
import roleRoutes from './routes/rolesRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', roleRoutes);

//global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server." });
});

export default app;