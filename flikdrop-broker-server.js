
const express = require("express");
const axios = require("axios");
const path = require("path");
const twilio = require("twilio");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

app.get("/", (req, res) => {
  res.send("Flikdrop Broker Upload Service is Live 🚛📤");
});

app.get("/form", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Create Driver Upload Link</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 1.2em; }
        label, input { display: block; margin-bottom: 10px; width: 100%; max-width: 400px; }
        button { padding: 10px 20px; font-size: 1em; background-color: #4F46E5; color: white; border: none; border-radius: 5px; }
        .link-output { margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>You completed the load! Now drop the Flik ⬇️</h2>
      <form id="linkForm">
        <label for="loadNumber">Load Number:</label>
        <input type="text" id="loadNumber" name="loadNumber" required />
        <label for="email">Accounting Email:</label>
        <input type="email" id="email" name="email" required />
        <label for="phone">Driver Phone Number:</label>
        <input type="tel" id="phone" name="phone" required placeholder="+15551234567"/>
        <button type="submit">Generate Upload Link</button>
      </form>
      <div class="link-output" id="result"></div>
      <script>
        document.getElementById("linkForm").addEventListener("submit", async function(e) {
          e.preventDefault();
          const loadNumber = document.getElementById("loadNumber").value;
          const email = document.getElementById("email").value;
          const phone = document.getElementById("phone").value;
          const result = document.getElementById("result");

          try {
            const response = await fetch("/register-load", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ loadNumber, email, phone })
            });
            const data = await response.text();
            result.innerHTML = data;
          } catch (err) {
            result.textContent = "Failed to generate link.";
          }
        });
      </script>
    </body>
    </html>
  \`);
});

app.post("/register-load", async (req, res) => {
  const { loadNumber, email, phone } = req.body;
  if (!loadNumber || !email || !phone) return res.status(400).send("Missing required fields.");

  const link = \`https://flikdrop-driver.onrender.com/upload/\${loadNumber}\`;

  try {
    await axios.post("https://flikdrop-driver.onrender.com/register-load", { loadNumber, email });

    await client.messages.create({
      body: \`Flikdrop: Upload your POD here → \${link}\`,
      from: process.env.TWILIO_PHONE,
      to: phone.startsWith('+1') ? phone : '+1' + phone.replace(/\D/g, '')
    });

    res.send(`Driver Upload Link sent: <a href="\${link}" target="_blank">\${link}</a>\`);
  } catch (err) {
    console.error("Error sending SMS or registering load:", err);
    res.status(500).send("Failed to send link.");
  }
});

app.listen(3000, () => {
  console.log("Flikdrop BROKER server running on port 3000");
});
