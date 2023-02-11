const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: String,
});

userSchema.statics.findByEmail = findByEmail;
userSchema.statics.updateToken = updateToken;

async function findByEmail(email) {
  return await this.find({ email: email });
}

async function updateToken(id, newToken) {
  return this.findByIdAndUpdate(
    id,
    { $set: { token: newToken } },
    { new: true }
  );
}

const usersModel = mongoose.model("User", userSchema);

module.exports = usersModel;
