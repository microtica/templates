import express from "express";
import logger from "morgan";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import pdf from 'express-pdf';

import swaggerDocument from "../../config/swagger.json";
import { configureStrategy } from "./password-jwt";
import { configureGoogleStrategy } from "./passport-google";
import { devConfig } from "../../config/env/development";
import User from "../resources/user/user.model";
import { configureGithubStrategy } from "./passport-github";

export const globalMiddleware = (app) => {
  //body parser middleware
  app.use(express.json());

  //middleware
  app.use(express.urlencoded({ extended: true }));

  app.use(cors());

  app.use(pdf);

  app.use(logger("dev"));

  app.use(
    session({
      secret: devConfig.secret,
      resave: true,
      saveUninitialized: true,
    })
  );

  //password middleware
  app.use(passport.initialize({ userProperty: "currentUser" }));

  app.use(passport.session());

  configureStrategy();

  //google middleware
  configureGoogleStrategy();

  //github middleware
  configureGithubStrategy();

  //save user into session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // extract the userId from session
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(null, user);
    });
  });

  //swagger ui middleware
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { explorer: true })
  );

  app.get('failure', (req, res) => {
    return res.redirect('http://localhost:4200/login');
  })
};
