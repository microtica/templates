import express from "express";
import passport from "passport";
import clientController from "./client.controller";

export const clientRouter = express.Router();

clientRouter
  .route("/")
  .post(
    passport.authenticate("jwt", { session: false }),
    clientController.create
  )
  .get(
    passport.authenticate("jwt", { session: false }),
    clientController.findAll
  );

clientRouter
  .route("/:id")
  .get(
    passport.authenticate("jwt", { session: false }),
    clientController.findOne
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    clientController.delete
  )
  .put(
    passport.authenticate("jwt", { session: false }),
    clientController.update
  );
