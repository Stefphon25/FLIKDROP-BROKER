const express = require("express");
<<<<<<< HEAD
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔁 CHANGE THIS to your actual Render driver URL
const DRIVER_SERVER_BASE = "https://flikdrop-driver.onrender.com";

app.get("/", (req, res) => {
  res.send(\`
    <html>
      <head>
        <title>Flikdrop - Broker Link Generator</title>
        <style>
          body { font-family: sans-serif; text-align: center; margin-top: 100px; font-size: 1.2em; }
          input, button { padding: 10px; font-size: 1em; margin: 5px; }
        </style>
      </head>
      <body>
        <h2>📦 Flikdrop Link Generator</h2>
        <form method="POST" action="/generate">
          <input type="text" name="loadNumber" placeholder="Load Number" required><br>
          <input type="email" name="email" placeholder="Accounting Email" required><br>
          <button type="submit">Generate Upload Link</button>
        </form>
      </body>
    </html>
  \`);
});

app.post("/generate", async (req, res) => {
  const { loadNumber, email } = req.body;

  try {
    await axios.post(\`\${DRIVER_SERVER_BASE}/register-load\`, { loadNumber, email });
    const driverLink = \`\${DRIVER_SERVER_BASE}/upload/\${loadNumber}\`;

    res.send(\`
      <html>
        <head>
          <title>Upload Link Ready</title>
          <style>
            body { font-family: sans-serif; text-align: center; margin-top: 100px; font-size: 1.2em; }
            a { display: inline-block; margin-top: 20px; font-size: 1.1em; color: blue; }
          </style>
        </head>
        <body>
          <h2>✅ Link Created for Load #\${loadNumber}</h2>
          <p><a href="\${driverLink}" target="_blank">\${driverLink}</a></p>
        </body>
      </html>
    \`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).send("Failed to register load or generate link.");
  }
=======
const app = express();

app.use(express.urlencoded({ extended: true }));

const loadStore = {};

app.get("/", (req, res) => {
  res.redirect("/load");
});

app.get("/load", (req, res) => {
  res.send(`
    <html>
    <head><title>Flikdrop - Create Upload Link</title></head>
    <body style="font-family:sans-serif; text-align:center; padding:50px;">
      <h2>Generate POD Upload Link</h2>
      <form action="/generate" method="POST" style="margin-top:20px;">
        <input name="loadNumber" placeholder="Enter Load #" required style="padding:10px; width:80%; margin-bottom:10px;" /><br/>
        <input name="email" placeholder="Enter Email to Send POD" required style="padding:10px; width:80%;" /><br/><br/>
        <button type="submit" style="padding:10px 20px; font-weight:bold;">Generate Upload Link</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/generate", (req, res) => {
  const { loadNumber, email } = req.body;
  if (!loadNumber || !email) {
    return res.send("Missing load number or email.");
  }

  loadStore[loadNumber] = { email };

  const host = process.env.FLIKDROP_DRIVER_URL || "https://your-driver-link.com";
  const link = `${host}/upload/${loadNumber}`;

  res.send(`
    <html>
    <head><title>Link Created</title></head>
    <body style="font-family:sans-serif; text-align:center; padding:50px;">
      <h2>Share this link with the driver:</h2>
      <p><a href="${link}" style="font-size:1.25em;">${link}</a></p>
      <p style="margin-top:20px;">This link opens their camera and submits directly to accounting.</p>
    </body>
    </html>
  `);
>>>>>>> 2bf5c9f0ffb305fabda179f7007480c667c62348
});

app.listen(3000, () => {
  console.log("Flikdrop BROKER server running on port 3000");
});