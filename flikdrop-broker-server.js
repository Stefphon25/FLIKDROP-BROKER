const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const twilio = require("twilio");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const loadStore = {
  "test123": { email: process.env.EMAIL_USER || "your@email.com" }
};

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
const FROM_PHONE = process.env.TWILIO_PHONE;

// Broker web form (GET)
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Flikdrop Broker</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 font-sans">
      <div class="min-h-screen flex items-center justify-center px-4">
        <div class="bg-white rounded-3xl shadow-lg max-w-md w-full p-6">
          <div class="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl p-6 mb-6 text-center">
            <h1 class="text-2xl font-bold mb-1">Send Upload Link</h1>
            <p class="text-sm opacity-80">Enter driver info to send POD link</p>
          </div>
          <form action="/send-link" method="POST" class="space-y-4">
            <div>
              <label class="block text-left text-sm font-medium text-gray-700">Load Number</label>
              <input type="text" name="loadNumber" required class="mt-1 block w-full p-2 border border-gray-300 rounded-xl" />
            </div>
            <div>
              <label class="block text-left text-sm font-medium text-gray-700">Driver Phone</label>
              <input type="text" name="driverPhone" required class="mt-1 block w-full p-2 border border-gray-300 rounded-xl" />
            </div>
            <div>
              <label class="block text-left text-sm font-medium text-gray-700">Email for POD</label>
              <input type="email" name="email" required class="mt-1 block w-full p-2 border border-gray-300 rounded-xl" />
            </div>
            <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700">Send Link</button>
          </form>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Register and send link route
app.post("/send-link", async (req, res) => {
  const { loadNumber, email, driverPhone } = req.body;
  if (!loadNumber || !email || !driverPhone) return res.status(400).send("Missing input.");

  loadStore[loadNumber] = { email };
  const uploadUrl = `https://flikdrop-driver.onrender.com/upload/${loadNumber}`;

  try {
    await client.messages.create({
      to: driverPhone.startsWith("+") ? driverPhone : `+${driverPhone}`,
      from: FROM_PHONE,
      body: `Flikdrop: Tap to upload POD → ${uploadUrl}`
    });
    res.send("<p style='text-align:center;font-family:sans-serif;'>✅ Link sent successfully to driver.</p>");
  } catch (error) {
    console.error("❌ Twilio SMS error:", error);
    res.status(500).send("Failed to send SMS.");
  }
});

// Existing upload endpoints remain unchanged

app.post("/register-load", express.json(), (req, res) => {
  const { loadNumber, email } = req.body;
  if (!loadNumber || !email) return res.status(400).send("Missing load number or email.");
  loadStore[loadNumber] = { email };
  res.status(200).send("Load registered successfully.");
});

app.get("/upload/:loadNumber", (req, res) => {
  const loadNumber = req.params.loadNumber;
  const entry = loadStore[loadNumber];
  if (!entry) return res.status(404).send("Invalid load number.");
  res.redirect(`/upload/${loadNumber}`);
});

app.post("/upload/:loadNumber", upload.single("bolImage"), async (req, res) => {
  const loadNumber = req.params.loadNumber;
  const entry = loadStore[loadNumber];
  if (!entry) return res.status(404).send("Invalid load number.");
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  try {
    await transporter.sendMail({
      from: `"Flikdrop" <${process.env.EMAIL_USER}>`,
      to: entry.email,
      subject: `POD for Load ${loadNumber}`,
      text: `Attached is the signed POD for Load ${loadNumber}.`,
      attachments: [{ filename: originalName, path: filePath }]
    });
    fs.unlinkSync(filePath);
    res.send("✅ POD submitted and emailed.");
  } catch (err) {
    console.error("❌ EMAIL FAILED:", err);
    res.status(500).send("Upload failed.");
  }
});

app.get("/health", (req, res) => {
  res.send("Flikdrop Broker Service is Live 🚚📨");
});

app.listen(3000, () => {
  console.log("Flikdrop BROKER server running on port 3000");
});
