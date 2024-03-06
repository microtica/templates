import { string } from "@hapi/joi";
import mongoose from "mongoose";

const { Schema } = mongoose;
const UserSchema = new Schema({
  local: {
    name: String,
    email: String,
    password: String,
  },
  google: {
    email: String,
    id: String,
    displayName: String,
    token: String,
  },
  github: {
    email: String,
    id: String,
    displayName: String,
    token: String,
  },
});

// UserSchema.pre("save", async function () {
//   // if user is modified or user is new
//   if (this.isModified("password") || this.isNew) {
//     const salt = await bcryptjs.genSalt();
//     const hash = await bcryptjs.hash(this.password, salt);
//     this.password = hash;
//   }
// });

export default mongoose.model("User", UserSchema);
