const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get various registries
// get officials
const getOfficials = async () => {
  const officials = await prisma.officials.findMany();
  return officials;
};

//get agencies
const getAgencies = async () => {
  const agencies = await prisma.agencies.findMany();
  return agencies;
};

//routes
router.get("/get-alerts", async (req, res) => {
  const alerts = await prisma.alerts.findMany();

  res.json(alerts);
});

router.get("/get-alerts/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const alert = await prisma.alerts.findMany({ where: { id: id } });
  res.json(alert);
});

router.get("/get-responses", async (req, res) => {
  const responses = await prisma.responses.findMany();
  res.json(responses);
});

router.get("/get-responses/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const response = await prisma.responses.findMany({ where: { id: id } });
  res.json(response);
});

router.get("/officials", async (req, res) => {
  const officials = await getOfficials().then((val) => {
    return val;
  });
  res.status(200).json(officials);
});

router.get("/officials/:id", async (req, res) => {
  const id = req.params.id;
  const official = await prisma.officials.findMany({ where: { staff_id: id } });
  res.json(official);
});

router.get("/agencies", async (req, res) => {
  const agencies = await getAgencies().then((val) => {
    return val;
  });
  res.status(200).json(agencies);
});

//for admin or lead to add user, agency...
router.post("/add-user", async (req, res) => {
  const { f_name, l_name, email, phone, agency, staff_id, role } = req.body;
  await prisma.officials
    .create({
      data: {
        f_name,
        l_name,
        email,
        phone,
        agency,
        staff_id,
        role,
      },
    })
    .then((response) => {
      const user = response;
      res.status(200).json(user);
      res.end;
    })
    .catch((err) => {
      res.send({ message: "User not added" });
      res.end;
    });
});

// update response
router.put("/respond", async (req, res) => {
  const { id, agency, time, pending_time, resolved_time, status } = req.body;

  await prisma.responses
    .update({
      data: {
        responding_agency: agency,
        response_timestamp: time,
        to_pending: pending_time,
        to_resolved: resolved_time,
        status: status,
      },
      where: { id: id },
    })
    .then((response) => {
      res.status(200).json(response);
      res.end;
    });
});

//add agency
router.post("/add-agency", async (req, res) => {
  const { name, phone, address, code } = req.body;
  await prisma.agencies
    .create({
      data: {
        name: name,
        contact_number: phone,
        address: address,
        c_name: code,
      },
    })
    .then((response) => {
      const agency = response;
      res.status(200).json(agency);
      res.end;
    })
    .catch((err) => {
      console.log(err);
      res.send({ message: "Agency not added" });
      res.end;
    });
});

module.exports = router;
