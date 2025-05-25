
const express = require("express");
const path = require("path");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/form);
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
        <button type="submit">Generate Upload Link</button>
      </form>
      <div class="link-output" id="result"></div>
      <script>
        document.getElementById("linkForm").addEventListener("submit", async function(e) {
          e.preventDefault();
          const loadNumber = document.getElementById("loadNumber").value;
          const email = document.getElementById("email").value;
          const result = document.getElementById("result");

          try {
            await fetch("https://flikdrop-driver.onrender.com/register-load", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ loadNumber, email })
            });
            const link = "https://flikdrop-driver.onrender.com/upload/" + loadNumber;
            result.innerHTML = "Driver Upload Link: <a href='" + link + "' target='_blank'>" + link + "</a>";
          } catch (err) {
            result.textContent = "Failed to generate link.";
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("Flikdrop BROKER server running on port 3000");
});
