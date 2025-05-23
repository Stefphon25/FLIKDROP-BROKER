// flikdrop-broker-server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Store load number and email mapping (reset on each server restart)
const loadStore = {};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Form page for broker
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Flikdrop Broker</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen font-sans">
      <div class="bg-white p-8 rounded-2xl shadow-md max-w-lg w-full">
        <h1 class="text-2xl font-bold mb-6 text-center">Register Load & Generate Flikdrop Link</h1>
        <form action="/register" method="POST" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Load Number</label>
            <input name="loadNumber" required class="w-full mt-1 px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Accounting Email</label>
            <input name="email" type="email" required class="w-full mt-1 px-4 py-2 border rounded-md" />
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700">
            Generate Upload Link
          </button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Register load and show upload link
app.post("/register", (req, res) => {
  const { loadNumber, email } = req.body;

  if (!loadNumber || !email) {
    return res.status(400).send("Missing load number or email");
  }

  loadStore[loadNumber] = { email };

  const baseUrl = req.protocol + "://" + req.get("host");
  const driverLink = `${baseUrl}/upload/${loadNumber}`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Flikdrop Link Created</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen font-sans">
      <div class="bg-white p-8 rounded-2xl shadow-md max-w-lg w-full text-center">
        <h1 class="text-2xl font-bold text-green-600 mb-4">✅ Link Created</h1>
        <p class="mb-2 text-gray-800">Share this link with the driver:</p>
        <div class="bg-gray-100 p-3 rounded-md break-all text-blue-600 font-mono mb-4">${driverLink}</div>
        <a href="/" class="text-blue-500 underline">Create another link</a>
      </div>
    </body>
    </html>
  `);
});

// API endpoint the driver server can access (optional)
app.get("/loads", (req, res) => {
  res.json(loadStore);
});

app.listen(PORT, () => {
  console.log(`Flikdrop BROKER server running on port ${PORT}`);
});
