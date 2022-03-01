//Server logic. Imports all necessary routes, models, etc
import express from 'express';
import mongoose from 'mongoose';
import session from "express-session";
import connectStore from "connect-mongo";
import { userRouter, sessionRouter, livepeerRouter } from './routes/index';
import {
  PORT, NODE_ENV, MONGO_URI, SESS_NAME, SESS_SECRET, SESS_LIFETIME , MONGO_URI_DEV, MONGO_URI_LOCAL
} from "./config";

const { NODE_ENV: mode } = process.env;

(async () => {
  try {
    //first connect with DB
    if (mode == "production"){
      await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: false});
    }else if (mode == "development"){
      await mongoose.connect(MONGO_URI_DEV, { useNewUrlParser: true, useFindAndModify: false});
    }else if (mode == "local"){
      await mongoose.connect(MONGO_URI_LOCAL, { useNewUrlParser: true, useFindAndModify: false});
    }else{
      await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: false});
    }
    console.log('MongoDB connected on ' + mode);
    //web application framework
    const app = express();
    //disable powered by message, which contains information on
    app.disable('x-powered-by');
    //parses and validates requests to make things harder for malicious actors 
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    //import session module
    const MongoStore = connectStore(session);

    //define session data
    app.use(session({
      name: SESS_NAME,
      //TODO: change secret in config file
      secret: SESS_SECRET,
      //define where to store them
      store: new MongoStore({
        mongooseConnection: mongoose.connection,
        collection: 'session',
        ttl: parseInt(SESS_LIFETIME) / 1000,
      }),
      saveUninitialized: false,
      proxy: NODE_ENV === "production",
      resave: false,
      //cookie to send to users
      cookie: {
        sameSite: true,
        secure: NODE_ENV === 'production',
        maxAge: parseInt(SESS_LIFETIME)
      }
    }));
    //define default router
    const apiRouter = express.Router();
    //which handles any request starting with /api
    app.use('/api', apiRouter);
    //but changes to a different router for different paths
    apiRouter.use('/users', userRouter);
    apiRouter.use('/session', sessionRouter);
    apiRouter.use('/livepeer', livepeerRouter);

    // error handler
    app.use(function(err, req, res, next) {
      
      res.locals.message = err.message;
      // set locals, only providing error in development
      //res.locals.error = req.app.get('env') === 'development' ? err : {};

      // add this line to include winston logging
      console.log(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    //actually start server
    app.listen(PORT, "0.0.0.0", function () {
      console.log(`Listening on port ${PORT}`);
    });
    //and log any errors to the console
  } catch (err) {
    console.log(err);
  }
})(); 