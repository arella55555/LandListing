import express from "express";
import cors from "cors";
import userRoutes from './routes/userRoutes';
import listingRoutes from './routes/listingRoutes';
import categoryRoutes from './routes/categoryRoutes';
import imageRoutes from './routes/imageRoutes';
import negotiationRoutes from './routes/negotiationRoutes';
import messageRoutes from './routes/messageRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';
const app = express();

app.use(cors());
// Simple request logger for debugging
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl} - body: ${JSON.stringify(req.body || {})}`);
  next();
});
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', listingRoutes);
app.use('/api', categoryRoutes);

app.use('/api/listing-image', imageRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/admin', adminRoutes);

//global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack || err);
  // In development return the error message/stack to aid debugging. Do not enable in production.
  const payload: any = { message: "Something went wrong on the server." };
  if (process.env.NODE_ENV !== 'production') {
    payload.error = err?.message ?? String(err);
    payload.stack = err?.stack;
  }
  res.status(500).json(payload);
});

export default app;
