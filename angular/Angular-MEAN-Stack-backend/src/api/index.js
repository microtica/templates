import express from "express";
import { authRouter } from "./resources/auth";
import { clientRouter } from "./resources/client";
import { invoiceRouter } from "./resources/invoice";
import { userRouter } from "./resources/user";

export const restRouter = express.Router();

restRouter.use("/clients", clientRouter);
restRouter.use("/invoices", invoiceRouter);
restRouter.use("/users", userRouter);
restRouter.use("/auth", authRouter);
