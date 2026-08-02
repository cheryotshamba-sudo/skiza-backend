const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
    dest: "uploads/"
});


app.get("/", (req, res) => {
    res.send("Skiza Backend Running");
});


app.post("/upload", upload.single("screenshot"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No screenshot uploaded"
        });
    }

    console.log("Uploaded:", req.file.filename);

    res.json({
        success: true,
        message: "Screenshot uploaded successfully"
    });

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
