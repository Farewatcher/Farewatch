import "dotenv/config";
import express from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const dbPath = process.env.DB_PATH || path.join(__dirname, "farewatch.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS watches (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    trip_type TEXT NOT NULL,
    departure_date TEXT NOT NULL,
    return_date TEXT,
    duration_days INTEGER NOT NULL,
    frequency_hours INTEGER NOT NULL,
    drop_percent INTEGER NOT NULL,
    target_price REAL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'demo'
  )
`);

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

const validAirport = /^[A-Z]{3}$/;
const validDate = /^\d{4}-\d{2}-\d{2}$/;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "FareWatch", mode: "starter-demo" });
});

app.post("/api/watches", (req, res) => {
  const body = req.body || {};
  const email = String(body.email || "").trim().toLowerCase();
  const origin = String(body.origin || "").trim().toUpperCase();
  const destination = String(body.destination || "").trim().toUpperCase();
  const tripType = body.tripType === "oneway" ? "oneway" : "roundtrip";
  const departureDate = String(body.departureDate || "");
  const returnDate = String(body.returnDate || "");
  const durationDays = Number(body.durationDays);
  const frequencyHours = Number(body.frequencyHours);
  const dropPercent = Number(body.dropPercent);
  const targetPrice = body.targetPrice === "" || body.targetPrice == null ? null : Number(body.targetPrice);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (!validAirport.test(origin) || !validAirport.test(destination) || origin === destination) {
    return res.status(400).json({ error: "Use different three-letter airport codes, such as MYR and JFK." });
  }
  if (!validDate.test(departureDate) || (tripType === "roundtrip" && !validDate.test(returnDate))) {
    return res.status(400).json({ error: "Choose valid travel dates." });
  }
  if (tripType === "roundtrip" && returnDate < departureDate) {
    return res.status(400).json({ error: "Return date must be on or after departure date." });
  }
  if (![1, 7, 14, 30, 60].includes(durationDays)) {
    return res.status(400).json({ error: "Choose a supported monitoring duration." });
  }
  if (![6, 12, 24].includes(frequencyHours)) {
    return res.status(400).json({ error: "Choose a supported check frequency." });
  }
  if (![0, 10, 25, 50].includes(dropPercent)) {
    return res.status(400).json({ error: "Choose a supported price-drop threshold." });
  }
  if (targetPrice !== null && (!Number.isFinite(targetPrice) || targetPrice <= 0)) {
    return res.status(400).json({ error: "Target price must be a positive number." });
  }

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO watches
      (id,email,origin,destination,trip_type,departure_date,return_date,duration_days,frequency_hours,drop_percent,target_price,created_at,status)
    VALUES
      (@id,@email,@origin,@destination,@trip_type,@departure_date,@return_date,@duration_days,@frequency_hours,@drop_percent,@target_price,@created_at,'demo')
  `).run({
    id, email, origin, destination, trip_type: tripType, departure_date: departureDate,
    return_date: tripType === "roundtrip" ? returnDate : null,
    duration_days: durationDays, frequency_hours: frequencyHours, drop_percent: dropPercent,
    target_price: targetPrice, created_at: new Date().toISOString()
  });

  res.status(201).json({
    ok: true,
    id,
    message: "Your watch settings were saved. Live fare checks and email alerts are not connected yet."
  });
});

app.get("/api/watches", (_req, res) => {
  const watches = db.prepare(`
    SELECT id,email,origin,destination,trip_type,departure_date,return_date,duration_days,
           frequency_hours,drop_percent,target_price,created_at,status
    FROM watches ORDER BY created_at DESC LIMIT 100
  `).all();
  res.json({ watches });
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`FareWatch starter running on port ${port}`);
});
