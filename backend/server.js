const express = require("express");
const { PrismaClient } = require("@prisma/client");
const CORS = require("cors");
const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.use(CORS({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// sms sender
const sendSMS = (lat, long, time) => {
  const mapString = `https://www.google.com.gh/maps/@${long},${lat},7z`;
  const smsString = `Logging Detected at this location: \n Latitude: ${lat}  \n Longitude: ${long} \n Time Detected: ${time} \n please take action \nclick to view location:(${mapString})`;
  const credentials = {
    apiKey: "e0e400d4d3001330b5d88db2db53ac02ae473b9306e01b6c3486479301aa82a4",
    username: "Deforestation_alert_sms",
  };
  const AfricasTalking = require("africastalking")(credentials);
  const sms = AfricasTalking.SMS;
  const options = {
    to: "+233541638748",
    message: smsString,
  };

  sms
    .send(options)
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
  console.log(smsString);
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
      },
    })
    .then((response) => {
      const alert = response;
      //fire of sms sender function
      sendSMS(alert?.lat, alert?.long, alert?.time_stamp);
      res.status(200).json(alert);
    })
    .catch((err) => {
      res.json({ message: "could not send alert", err });
    });
});

app.get("/get-alerts", async (req, res) => {
  const alerts = await prisma.alerts.findMany();

  res.json(alerts);
});

app.listen(port, () => console.log(`live on port ${port}!`));