const express = require("express");
const { PrismaClient } = require("@prisma/client");
const CORS = require("cors");
const router = require("./routes");
const { default: axios } = require("axios");
const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(CORS({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// sms sender
const sendSMS = (lat, long, time) => {
  const mapString = `https://www.google.com.gh/maps/@${long},${lat},7z`;
  const smsString = `Logging Detected at this location: \n Latitude: ${lat}  \n Longitude: ${long} \n Time Detected: ${time} \n please take action \nclick to view location:(${mapString})`;

  const apiKey = "435|SrJE2ycHmmOLkfmGsByYLkdqsfuDVHHtf5MhCkUF ";
  const apiUrl = "https://www.webapp.usmsgh.com/api/sms/send";

  const config = {
    headers: { Authorization: `Bearer ${apiKey}` },
  };

  const bodyParameters = {
    recipient: "233541638748",
    sender_id: "DAMS-GHANA",
    message: smsString,
  };

  axios
    .post(apiUrl, bodyParameters, config)
    .then(console.log)
    .catch(console.log);
};

const setResponse = async (id, status) => {
  const response = await prisma.responses.create({
    data: {
      alertID: id,
      status: status,
    },
  });

  return response;
};

app.post("/alert", async (req, res) => {
  const { device_id, lat, long } = req.body;
  //   add this body data to the database
  await prisma.alerts
    .create({
      data: {
        device_id,
        lat,
        long,
        status: 1,
      },
    })
    .then(async (response) => {
      const alert = response;
      //fire of sms sender function
      sendSMS(alert?.lat, alert?.long, alert?.time_stamp);
      await setResponse(alert.id, alert.status);
      res.status(200).json(alert);
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "could not send alert", err: err });
    });
});

app.use("/api/", router);

app.use("/api-list", express.static("public"));

app.listen(port, () => console.log(`live on port ${port}!`));
