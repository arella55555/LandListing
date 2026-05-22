import express from "express";
import cors from "cors";
import userRoutes from './routes/userRoutes';
import listingRoutes from './routes/listingRoutes';
import categoryRoutes from './routes/categoryRoutes';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes, listingRoutes, categoryRoutes);

//global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server." });
});

export default app;
