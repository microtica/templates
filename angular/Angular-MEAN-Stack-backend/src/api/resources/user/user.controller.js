import HttpStatus from "http-status-codes";
import User from "./user.model";
import userService from "./user.service";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { devConfig } from "../../../config/env/development";
import { getEncryptedPassword, getJwtToken } from "../../modules/util";
import { sendEmail } from "../../modules/mail";

export default {
  async signup(req, res) {
    try {
      // validate the request
      const { error, value } = userService.validateSignupSchema(req.body);
      if (error && error.details) {
        return res.status(HttpStatus.BAD_REQUEST).json(error);
      }

      const existingUser = await User.findOne({ "local.email": value.email });
      if (existingUser) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ err: "You have already created account" });
      } else {
        // create new user
        const user = await new User();
        user.local.email = value.email;
        user.local.name = value.name;
        const salt = await bcryptjs.genSalt();
        const hash = await bcryptjs.hash(value.password, salt);
        user.local.password = hash;
        await user.save();

        return res.json({
          success: true,
          message: "User created successfully",
        });
      }
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  },

  async login(req, res) {
    try {
      // validate the request
      const { error, value } = userService.validateLoginSchema(req.body);
      if (error && error.details) {
        return res.status(HttpStatus.BAD_REQUEST).json(error);
      }

      const user = await User.findOne({ "local.email": value.email });

      if (!user) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ err: "invalid email or password" });
      }
      const matched = await bcryptjs.compare(
        value.password,
        user.local.password
      );
      if (!matched) {
        return res
          .signup(HttpStatus.UNAUTHORIZED)
          .json({ err: "invalid credentials" });
      }
      const token = jwt.sign({ id: user._id }, devConfig.secret, {
        expiresIn: "1d",
      });
      return res.json({ success: true, token });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  },

  async test(req, res) {
    return res.json(req.currentUser);
  },

  async forgotPassword(req, res) {
    try {
      const { value, error } = userService.validateForgotSchema(req.body);
      if (error && error.details) {
        return res.status(HttpStatus.BAD_REQUEST).json(error);
      }
      const criteria = {
        $or: [
          { "google.email": value.email },
          { "github.email": value.email },
          { "local.email": value.email },
        ],
      };
      const user = await User.findOne(criteria);
      console.log("user :>> ", user);
      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ err: "could not find user" });
      }
      const token = getJwtToken({ id: user._id });

      const resetLink = `
      <h3> Please click on the link to reset the password </h3>

      <a href = '${devConfig.frontendURL}/reset-password/${token}'>Reset Password</a>
      `;
      const sanitizedUser = userService.getUser(user);
      const results = await sendEmail({
        html: resetLink,
        subject: "Forgot Password",
        email: sanitizedUser.email,
      });
      return res.json(results);
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  },
  
  async resetPassword(req, res) {
    try {
      const { password } = req.body;
      if (!password) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ err: "password is required" });
      }
      const user = await User.findById(req.currentUser._id);
      const sanitizedUser = userService.getUser(user);
      if (!user.local.email) {
        user.local.email = sanitizedUser.email;
        user.local.name = sanitizedUser.name;
      }
      const hash = await getEncryptedPassword(password);
      user.local.password = hash;
      await user.save();
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  },
};
