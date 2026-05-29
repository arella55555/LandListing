import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes";
import listingRoutes from "./routes/listingRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import imageRoutes from "./routes/imageRoutes";
import negotiationRoutes from "./routes/negotiationRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

/**
 * ============================================================
 * MIDDLEWARES
 * ============================================================
 */

app.use(cors());

app.use(express.json());

/**
 * ============================================================
 * ROUTES
 * ============================================================
 */

app.use("/api", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api", listingRoutes);

app.use("/api", categoryRoutes);

app.use("/api/listing-image", imageRoutes);

app.use("/api/negotiations", negotiationRoutes);

app.use("/api/favorites", favoriteRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/admin", adminRoutes);

/**
 * ============================================================
 * GLOBAL ERROR HANDLER
 * ============================================================
 */

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);

    res.status(500).json({
      message: "Something went wrong on the server.",
    });
  }
);

export default app;