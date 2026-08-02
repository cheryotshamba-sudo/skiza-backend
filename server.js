const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const Upload = require("./models/Upload");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: "uploads/"
});

app.get("/", (req, res) => {
  res.send("Skiza Backend Running");
});

app.post("/upload", upload.single("screenshot"), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No screenshot uploaded"
    });
  }

  try {
    const newUpload = new Upload({
      filename: req.file.filename
    });

    await newUpload.save();

    res.json({
      success: true,
      message: "Screenshot uploaded and saved successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save upload"
    });
  }

});

app.get("/uploads", async (req, res) => {
  try {
    const uploads = await Upload.find().sort({ uploadedAt: -1 });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch uploads"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
