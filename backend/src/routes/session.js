import express from "express";
import User from "../models/user.js";
import { SESS_NAME } from "../config.js";
const sessionRouter = express.Router();

sessionRouter.post("", async (req, res) => {
  try {
    const username = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user = await User.findOne({ ip: username });
    if (user) {
      console.log("User logged in as " + user.ip);
      req.session.user = {ip: user.ip};
      res.send({ip: user.ip});
    } else {
      const newUser = new User({ ip: username});
      await newUser.save();
      console.log("User logged in as " + user.ip);
      req.session.user = {ip: newUser.ip};
      res.send({ip: newUser.ip});
    }
  } catch (err) {
    res.status(401).send(err);
  }
});

sessionRouter.delete("", ({ session }, res) => {
  try {
    const user = session.user;
    if (user) {
      console.log(user.username + " is logging out");
      session.destroy(err => {
        if (err) throw (err);
        res.clearCookie(SESS_NAME);
        res.send(user);
      });
    } else {
      throw new Error('Sessie kon niet worden verwijderd');
    }
  } catch (err) {
    res.status(422).send(err);
  }
});

sessionRouter.get("", ({ session: { user } }, res) => {
  res.send({ user });
});

export default sessionRouter;
