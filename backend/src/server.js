//Server logic. Imports all necessary routes, models, etc
import express from 'express';
import mongoose from 'mongoose';
import session from "express-session";
import MongoStore from "connect-mongo";
import { userRouter, sessionRouter, livepeerRouter } from './routes/index';
import {
  NODE_PORT, NODE_ENV, MONGO_URI, SESS_NAME, SESS_SECRET,
  SESS_LIFETIME , MONGO_URI_DEV, MONGO_URI_LOCAL, CONF_SIMPLE_MODE,
  CONF_DISABLE_DB
} from "./config";
// Env variable which determines which DB to connect to
const { NODE_ENV: mode } = process.env;

(async () => {
  try {
    // Make DB connection if needed
    let clientP;
    if (!CONF_SIMPLE_MODE && !CONF_DISABLE_DB){
      if (mode == "production"){
        clientP = mongoose.connect(MONGO_URI, { useNewUrlParser: true}).then(m => m.connection.getClient());
      }else if (mode == "development"){
        clientP = mongoose.connect(MONGO_URI_DEV, { useNewUrlParser: true}).then(m => m.connection.getClient());
      }else if (mode == "local"){
        clientP = mongoose.connect(MONGO_URI_LOCAL, { useNewUrlParser: true}).then(m => m.connection.getClient());
      }else{
        clientP = mongoose.connect(MONGO_URI, { useNewUrlParser: true}).then(m => m.connection.getClient());
      }
      console.log('MongoDB connected on ' + mode);
    }else{
      console.log('Running without a database connection' );
    }
    
    // Web application framework
    const app = express();
    app.disable('x-powered-by');
    // Parses and validates requests to make things harder for malicious actors 
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    if (!CONF_SIMPLE_MODE && !CONF_DISABLE_DB){
      // Declare session data
      app.use(session({
        name: SESS_NAME,
        //TODO: change secret in config file
        secret: SESS_SECRET,
        //define where to store them
        store: MongoStore.create({
          clientPromise: clientP,
          collectionName: 'session',
          ttl: parseInt(SESS_LIFETIME) / 1000,
        }),
        saveUninitialized: false,
        proxy: NODE_ENV === "production",
        resave: false,
        //cookie to send to users
        cookie: {
          sameSite: false,
          secure: false,
          maxAge: parseInt(SESS_LIFETIME)
        }
      }));
    }

    // Define endpoint paths
    const apiRouter = express.Router();
    // Catch any requests from /api/* and send it to the appropriate routes
    app.use('/api', apiRouter);
    apiRouter.use('/users', userRouter);
    apiRouter.use('/session', sessionRouter);
    apiRouter.use('/livepeer', livepeerRouter);

    // Error handler
    app.use(function(err, req, res, next) {
      res.locals.message = err.message;
      // Also log it to the console
      console.log(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      // Render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    // Start listening on the defined port
    app.listen(NODE_PORT, "0.0.0.0", function () {
      console.log(`Listening on port ${NODE_PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
})(); 
