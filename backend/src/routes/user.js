import express from 'express';
import User from '../models/user.js';
const userRouter = express.Router();

userRouter.post("/getVisitorStats", async (req, res) => {
  try {
    const totalUserCount = await User.countDocuments();
    const activeUserCount = await User.countDocuments({ $or: [
      {"upvotedTimelapses.0": { "$exists": true }},
      {"downvotedTimelapses.0": { "$exists": true }}
    ]});
    res.send({totalVisitorCount: totalUserCount,
              activeVisitorCount: activeUserCount});
  } catch (err) {
    res.status(400).send(err);
  }
});

export default userRouter;
