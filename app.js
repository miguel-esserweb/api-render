require('dotenv').config()
const express = require("express");
const QueueEmails = require('./utils/QueueEmails');
var cors = require('cors')

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
  

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
