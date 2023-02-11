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
  avatarURL: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
});

userSchema.statics.findByEmail = findByEmail;
userSchema.statics.updateToken = updateToken;
userSchema.statics.findVerificationToken = findVerificationToken;
userSchema.statics.verifyUser = verifyUser;

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

async function verifyUser(userId) {
  return this.findByIdAndUpdate(
    userId,
    {
      verify: true,
      verificationToken: null,
    },
    { new: true }
  );
}

async function findVerificationToken(verificationToken) {
  return this.findOne({ verificationToken });
}

const usersModel = mongoose.model("User", userSchema);

module.exports = usersModel;
