// server.js
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables from .env (for local development)
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ PostgreSQL connection
const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres:physicsmas@localhost:5432/contact_form",
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false } // Required for Render external/internal DB
    : false,
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 DeltaQuant Backend is Live");
});

// ✅ Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error("❌ Test DB connection error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Contact form submission route
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  console.log("📩 Received form data:", req.body);

  // Validate required fields
  if (!name || !email || !service || !message) {
    return res.status(400).json({
      success: false,
      message: "⚠️ Missing required fields (name, email, service, message)",
    });
  }

  try {
    const query = `
      INSERT INTO quant_contacts (name, email, phone, service, message, submitted_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *;
    `;
    const values = [name, email, phone || null, service, message];
    const result = await db.query(query, values);

    console.log("✅ Data inserted successfully:", result.rows[0]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));