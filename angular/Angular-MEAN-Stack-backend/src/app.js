// const express = require('express');
import express from "express";
import mongoose from "mongoose";
import { restRouter } from "./api";
import { devConfig } from "./config/env/development";
import { globalMiddleware } from "./api/middleware/global-middleware";

mongoose.Promise = global.Promise;
mongoose
  .connect(`mongodb://localhost:27017/${devConfig.database}`)
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.log(`Connection failed! n${err}`);
  });

const app = express();
const PORT = devConfig.port;

// global middleware
globalMiddleware(app);

app.use("/api", restRouter);

// 404 middleware
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.message = "Invalid route";
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(`server is running at PORT ${PORT}`);
});
