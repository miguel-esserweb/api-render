require('dotenv').config()
const express = require("express");
const QueueEmails = require('./utils/QueueEmails');

const app = express();
const port = 3005;
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Probando");
});
app.get("/send", (req, res) => {
  res.send([]);
});

app.use("/generateContent", async (req, res) => {
  try {
    QueueEmails()
    res.send("Enviando Correos");
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
