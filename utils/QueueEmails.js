const axios = require("axios").default;
const getClientPdfContent = require("./getPdfContent2")
const nodemailer = require("nodemailer");

const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASSWORD;
const HOST = process.env.SMTP_HOST;
const PORT = process.env.SMTP_PORT;
const FROM_EMAIL = process.env.EMAILS_FROM_EMAIL;
const FROM_NAME = process.env.EMAILS_FROM_NAME;
const LOCAL_API = process.env.LOCAL_API_URL;
const API_URL = process.env.API_URL;
const TOKEN = process.env.TOKEN_BEARER;

async function QueueEmails() {
  console.log("Se ejecuto QueueEmails");
  class JobQueue {
    constructor() {
      this.queue = [];
      this.isProcessing = false;
    }

    enqueue(job) {
      this.queue.push(job);
      this.processQueue();
    }

    async processQueue() {
      if (this.isProcessing) return;

      this.isProcessing = true;

      while (this.queue.length > 0) {
        const currentJob = this.queue.shift();
        try {
          await currentJob();
        } catch (error) {
          console.error("Error en el trabajo:", error);
        }
      }

      this.isProcessing = false;
    }
  }

  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    starttls: {
      enable: true,
    },
    secure: false,
    auth: {
      user: USER,
      pass: PASS,
    },
  });

  const sendEmail = async (task, retries = 1, attempt = 0) => {
    try {
      if (attempt !== 0) {
        console.log("Enviando correo a:", task.client, `(Intento ${attempt})`);
      } else {
        console.log("Enviando correo a:", task.client);
      }
      const url = `${API_URL}/operations?shows=30&userId=${task.id}&orderBy=operationDate&&dateAfter=2024-02-06&dateBefore=2024-08-06&sortBy=ascending&report=true`;
      const response = await axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        })
        .catch((err) => {
          console.log(err);
        });
      const pdfBuffer = await getClientPdfContent(response.data);
      await transporter.sendMail({
        from: {
          name: FROM_NAME,
          address: FROM_EMAIL,
        },
        to: [task.mail],
        subject: `Reporte para ${task.client}`,
        text: "Reporte del mes",
        html: "<b>Este es el b</b>",
        attachments: [
          {
            filename: `Reporte ${task.client}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
      console.log("Se envio el correo a", task.client, pdfBuffer);
    } catch (error) {
      console.error(error.message);
      if (retries > 0) {
        attempt++;
        console.log(`Reintentando enviar el correo a ${task.client}...`);
        await sendEmail(
          {
            id: task.id,
            client: task.client,
            mail: task.mail,
          },
          retries - 1,
          attempt
        );
      } else {
        console.log(`Fallo el envio del correo a ${task.client}...`);
      }
    }
  };

  const jobQueue = new JobQueue();

//   await axios
//     .get(`${LOCAL_API}/send`)
//     .then((res) => {
//       console.log(res.data);
//       res.data.forEach((email) => {
//         jobQueue.enqueue(() =>
//           sendEmail(
//             {
//               id: email.id,
//               client: email.cliente,
//               mail: email.correo,
//             },
//             3
//           )
//         );
//       });
//     })
//     .catch((err) => console.log(err));
    jobQueue.enqueue(() =>
        sendEmail(
        {
            id: "246",
            client: "Miguel",
            mail: "miguel.esserweb@gmail.com",
        },
        3
        )
    );
}

module.exports = QueueEmails