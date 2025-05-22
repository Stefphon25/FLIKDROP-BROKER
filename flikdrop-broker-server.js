const express = require("express");
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
});

app.listen(3000, () => {
  console.log("Flikdrop BROKER server running on port 3000");
});