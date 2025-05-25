const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const DRIVER_SERVICE_URL = "https://flikdrop-driver.onrender.com"; // Update if needed

app.get("/form", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Register Load</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen px-4">
      <form method="POST" action="/register" class="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h1 class="text-xl font-bold text-center text-gray-800">Flikdrop - Register Load</h1>
        <input name="loadNumber" placeholder="Load Number" class="w-full p-3 border border-gray-300 rounded-xl" required />
        <input name="email" placeholder="Accounting Email" type="email" class="w-full p-3 border border-gray-300 rounded-xl" required />
        <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition">Generate Upload Link</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/register", async (req, res) => {
  const { loadNumber, email } = req.body;
  if (!loadNumber || !email) {
    return res.status(400).send("Missing load number or email.");
  }

  try {
    await axios.post(`${DRIVER_SERVICE_URL}/register-load`, { loadNumber, email });
    const uploadLink = `${DRIVER_SERVICE_URL}/upload/${loadNumber}`;
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script></head>
      <body class="bg-green-50 flex items-center justify-center min-h-screen px-4">
        <div class="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 class="text-xl font-bold text-green-700 mb-2">✅ Upload Link Created</h2>
          <p class="mb-4">Driver can upload POD using the link below:</p>
          <a href="${uploadLink}" class="text-blue-600 underline break-all">${uploadLink}</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error registering load:", error.message);
    res.status(500).send("Error registering load.");
  }
});

app.get("/", (req, res) => {
  res.redirect("/form");
});

app.listen(3000, () => {
  console.log("Flikdrop BROKER server running on port 3000");
});