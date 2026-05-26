import express, { Request, Response } from "express";
import cors from "cors";
import { pool } from "./config/db";

const app = express();

app.use(cors());
app.use(express.json());

const fallbackListings = [
  {
    id: "fallback-1",
    title: "Sunrise Bay Lot 42",
    description:
      "A sun-drenched coastal lot with sweeping views and flexible zoning for your next build.",
    price: 249000,
    location: "Sunrise Bay, California",
    area: 32670,
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
    ],
    sellerName: "Open Horizon Agent",
    sellerPhone: "+1-555-0199",
    category: "residential",
    status: "available",
    featured: true,
  },
];

const normalizeListing = (row: any) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  price: Number(row.price),
  location: [row.barangay, row.municipality, row.province]
    .filter(Boolean)
    .join(", ") || "Unknown location",
  area: Math.round(Number(row.area_sqm) * 10.7639),
  images:
    Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : fallbackListings[0]?.images ?? [],
  sellerName: row.seller_name || "Open Horizon Agent",
  sellerPhone: row.seller_phone || "+1-555-0199",
  category: row.category_name?.toLowerCase() || "residential",
  status: row.status === "active" ? "available" : row.status || "available",
  featured: true,
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Lupa.ph API running");
});

app.get("/listings", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        l.id,
        l.title,
        l.description,
        l.price,
        l.area_sqm,
        l.barangay,
        l.municipality,
        l.province,
        l.status,
        c.name AS category_name,
        u.full_name AS seller_name,
        u.phone AS seller_phone,
        COALESCE(
          json_agg(
            DISTINCT li.image_url
          ) FILTER (WHERE li.image_url IS NOT NULL),
          '[]'
        ) AS images
      FROM listings l
      JOIN categories c ON c.id = l.category_id
      JOIN users u ON u.id = l.seller_id
      LEFT JOIN listing_images li ON li.listing_id = l.id
      GROUP BY
        l.id,
        l.title,
        l.description,
        l.price,
        l.area_sqm,
        l.barangay,
        l.municipality,
        l.province,
        l.status,
        c.name,
        u.full_name,
        u.phone
      ORDER BY l.created_at DESC
      LIMIT 10
    `);

    if (!result.rows.length) {
      return res.json(fallbackListings);
    }

    return res.json(result.rows.map(normalizeListing));
  } catch (error) {
    console.error("Failed to load listings from database:", error);
    return res.json(fallbackListings);
  }
});

export default app;
