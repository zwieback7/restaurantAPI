const express = require('express');
const basicAuth = require('express-basic-auth')
const recordmodel = require('../models/recordmodel');
const config = require('../config.json');

const router = express.Router();

router.get('/reservations/', basicAuth({ users: config.employees }), async (req, result) => {

  let options = {
    "status": req.query.status,
    "expectedArrivalDate": req.query.expectedArrivalDate
  };

  let res = await recordmodel.getAllReservation(options);
  if (res.error) {
    return result.status(500).send({ message: "fail to fetch reservations" });
  }

  result.send(res.rows);

});

router.post('/reservations', (req, result) => {
  if (!req.body.name ||
    !req.body.email) {
    return result.status(400).send({ message: "Info Missing" });
  }
  // info validation...

  let data = req.body;
  data.resvID = null;
  data.status = "open";
  recordmodel.addReservation(data, (err, res) => {
    if (err) {
      return result.status(400).send({ message: "fail to make reservation" });
    }
    result.send({
      message: "success",
      data: { "reservationID": res }
    });
  });
});


router.get('/reservations/:id', async (req, result) => {
  const id = req.params.id;
  const res = await recordmodel.getReservation(id);
  if (res.error) {
    return result.status(400).send({ message: "fail to fetch reservation" });
  }
  result.send({
    "reservationID": id,
    "reservation": res
  });
});

router.post('/reservations/:id', async (req, result) => {
  const id = req.params.id;
  const res = await recordmodel.getReservation(id);
  if (res.error) {
    return result.status(400).send({ message: "fail to fetch reservation" });
  }
  let data = req.body;
  data.resvID = id;
  recordmodel.addReservation(data, (err, res) => {
    if (err) {
      return result.status(400).send(err);
    }
    result.send({
      message: "success",
      data: { "reservationID": res }
    });
  });

});


router.post('/reservations/:id/status', async (req, result) => {
  if(!["open","cancelled","completed"].includes(req.body.status)){
    return result.status(400).send({error: "please use status in [open,cancelled,completed]"});
  }
  const id = req.params.id;
  const res = await recordmodel.getReservation(id);
  if (res.error) {
    return result.status(400).send({ message: "fail to fetch reservation" });
  }
  let data = res;
  data.status = req.body.status;
  data.resvID = id;
  recordmodel.addReservation(data, (err, res) => {
    if (err) {
      return result.status(400).send(err);
    }
    result.send({
      message: "success",
      data: { "reservationID": res }
    });
  });
});

module.exports = router;
