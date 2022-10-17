import mongoose from "mongoose";

const { Schema } = mongoose;
const ClientSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Client", ClientSchema);
