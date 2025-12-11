const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require('dotenv').config();
const { errors } = require("celebrate");
const routes = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const { requestLogger, errorLogger } = require('./middlewares/logger');


const app = express();

const { PORT = 3001 } = process.env;

// #region agent log
try{const logPath=path.join(__dirname,'.cursor/debug.log');fs.appendFileSync(logPath,JSON.stringify({location:'app.js:17',message:'Before mongoose.connect',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B,C'})+'\n');}catch(e){console.error('Log error:',e.message);}
// #endregion
mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    // #region agent log
    try{fs.appendFileSync(path.join(__dirname,'.cursor/debug.log'),JSON.stringify({location:'app.js:20',message:'Connection success',data:{readyState:mongoose.connection.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})+'\n');}catch(e){}
    // #endregion
    console.log("connected to DB");
  })
  .catch((err) => {
    // #region agent log
    try{fs.appendFileSync(path.join(__dirname,'.cursor/debug.log'),JSON.stringify({location:'app.js:25',message:'Connection error detected',data:{errorMessage:err.message,errorName:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})+'\n');}catch(e){}
    // #endregion
    console.log("DB error", err);
  });
// #region agent log
try{fs.appendFileSync(path.join(__dirname,'.cursor/debug.log'),JSON.stringify({location:'app.js:30',message:'After mongoose.connect call',data:{readyState:mongoose.connection.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})+'\n');}catch(e){}
// #endregion

app.use(express.json());
app.use(cors());

app.use(requestLogger);

app.use("/", routes);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  // #region agent log
  try{fs.appendFileSync(path.join(__dirname,'.cursor/debug.log'),JSON.stringify({location:'app.js:40',message:'Server started',data:{port:PORT,dbReadyState:mongoose.connection.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})+'\n');}catch(e){}
  // #endregion
  console.log(`App listening at port ${PORT}`);
  console.log("This is working");
});