//The userRouter is used to handle user related functions
import express from 'express';
import User from '../models/user';
import timelapseObj from '../models/timelapse';

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

userRouter.post("/getCurrentUserVotes", async (req, res) => {
  console.log(req.session);
  try {
    const userObj = await User.findOne({ip: req.session.user.ip}, {upvotedTimelapses: 1, downvotedTimelapses: 1, _id: 0});
    res.send(userObj);
  } catch (err) {
    res.status(400).send(err);
  }
});

userRouter.post("/getScoreByTimelapeFilename", async (req, res) => {
  try {
    const filename = req.body.fullFilename;
    const scoreObj = await timelapseObj.findOne({ fullFilename: filename }, { upvotes: 1, downvotes: 1, _id: 1 });
    if (scoreObj) {
      res.send(scoreObj);
    } else {
      res.send({upvotes: 0, downvotes: 0});
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

userRouter.post("/setVoteOnTimelapse", async (req, res) => {
  try {
    var voteValue = req.body.voteValue;
    const fullFilename = req.body.fullFilename;
    const username = req.session.user.ip;
    console.log("voteValue="+voteValue);
    console.log("fullFilename="+fullFilename);
    console.log("username="+username);
    const currentUserObj = await User.findOne({ip: username});
    console.log(currentUserObj);
    if (!currentUserObj){
      throw new Error("User not logged in");
    }
    var currentTimelapseObj = await timelapseObj.findOne({fullFilename: fullFilename});
    if(!currentTimelapseObj){
      currentTimelapseObj = new timelapseObj({ ownerId: currentUserObj._id, OwnerIp: currentUserObj.ip, fullFilename: fullFilename});
      await currentTimelapseObj.save();
    }else{
      console.log(currentTimelapseObj);
      if(currentUserObj.upvotedTimelapses.length && currentUserObj.upvotedTimelapses.includes(currentTimelapseObj._id)){
        currentTimelapseObj.upvotes = currentTimelapseObj.upvotes - 1;
        await currentTimelapseObj.save()
        await User.updateOne({ip: username},{
          $pullAll: {
              upvotedTimelapses: [currentTimelapseObj._id],
          },
        });
      } else if(currentUserObj.downvotedTimelapses.length && currentUserObj.downvotedTimelapses.includes(currentTimelapseObj._id)){
        currentTimelapseObj.downvotes = currentTimelapseObj.downvotes - 1;
        await currentTimelapseObj.save()
        await User.updateOne({ip: username},{
          $pullAll: {
              downvotedTimelapses: [currentTimelapseObj._id],
          },
        });
      }
    }
    if (voteValue == 1){
      await User.updateOne(
        { ip: username }, 
        { $push: { upvotedTimelapses: currentTimelapseObj._id } }
      );
      currentTimelapseObj.upvotes = currentTimelapseObj.upvotes + 1;
    }else if (voteValue == -1){
      await User.updateOne(
        { ip: username }, 
        { $push: { downvotedTimelapses: currentTimelapseObj._id } }
      );
      currentTimelapseObj.downvotes = currentTimelapseObj.downvotes + 1;
    }
    await currentTimelapseObj.save();
    console.log(currentTimelapseObj);
    res.send(currentTimelapseObj);
  } catch (err) {
    res.status(400).send(err);
  }
});



export default userRouter;
