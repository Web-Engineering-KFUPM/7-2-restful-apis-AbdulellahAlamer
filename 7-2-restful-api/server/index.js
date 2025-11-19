import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Load env from project root config.env
dotenv.config({ path: "../config.env" });

import { connectDB } from "./db.js";
import { Song } from "./models/song.model.js";

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URL?.replace(
  "<password>",
  process.env.MONGO_PASSWORD
);

if (!mongoURI) {
  throw new Error("Missing MONGO_URL or MONGO_PASSWORD in config.env");
}

await connectDB(mongoURI);

// api/songs (Read all songs)
// Return all songs
app.get("/api/songs", async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// get one song
app.get("/api/songs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const songs = await Song.findById(id);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// api/songs (Insert song)
// Create a new song
app.post("/api/songs", async (req, res) => {
  try {
    const { title, artist, year } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: "title and artist are required" });
    }
    const song = await Song.create({ title, artist, year });
    res.status(201).json(song);
  } catch (err) {
    res.status(500).json({ error: "Failed to create song" });
  }
});

// /api/songs/:id (Update song)
// Update a song by id
app.put("/api/songs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, year } = req.body;
    const song = await Song.findByIdAndUpdate(
      id,
      { title, artist, year },
      { new: true, runValidators: true }
    );
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: "Failed to update song" });
  }
});

// /api/songs/:id (Delete song)
// Delete a song by id
app.delete("/api/songs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findByIdAndDelete(id);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json({ message: "Song deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete song" });
  }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
