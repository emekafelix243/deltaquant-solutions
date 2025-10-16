// server.js
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";

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
    process.env.DATABASE_URL ||
    "postgresql://postgres:physicsmas@localhost:5432/contact_form", // 👈 use your exact local password
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// ✅ Root route for testing
app.get("/", (req, res) => {
  res.send("🚀 DeltaQuant Backend is Live");
});

// ✅ Test route to verify DB connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error("❌ Test DB connection error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Contact form route
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, service, message } = req.body;
  console.log("📩 Received form data:", req.body);

  if (!name || !email || !service || !message) {
    return res.status(400).json({ success: false, message: "⚠️ Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO quant_contacts (name, email, phone, service, message, submitted_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *;
    `;
    const values = [name, email, phone, service, message];
    const result = await db.query(query, values);

    console.log("✅ Data inserted successfully:", result.rows[0]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ Database Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
📦 Also confirm these 3 points:
.env file (or Render Environment Variables)

ini
Copy code
DATABASE_URL=postgresql://deltaquant_db_user:tWhNbtU0W9tDhLxkrS2X9sT4rtdyRNRg@dpg-d3kg8d15pdvs739hfci0-a/deltaquant_db
PORT=10000