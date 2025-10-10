// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pkg from "pg";
import dotenv from "dotenv";  // ✅ Load environment variables

dotenv.config(); // ✅ Initialize dotenv

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ PostgreSQL connection (local + Render-ready)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:physicsmas@localhost:5432/contact_form", // ✅ your DB name here
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 DeltaQuant Backend is Live");
});

// ✅ Contact form submission route
app.post("/submit", async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !service || !message) {
    return res.status(400).json({ message: "⚠️ Missing required fields" });
  }

  try {
    console.log("📩 Received form data:", { name, email, phone, service, message });

    // ✅ Insert into your quant_contacts table
    const query = `
      INSERT INTO quant_contacts (name, email, phone, service, message, submitted_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *;
    `;
    const values = [name, email, phone, service, message];

    const result = await pool.query(query, values);
    console.log("✅ Data saved:", result.rows[0]);

    res.status(200).json({
      message: "✅ Message saved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
});

// ✅ Dynamic port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));