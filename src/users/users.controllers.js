const Joi = require("joi");
const usersModel = require("./users.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { UnauthorizedError, NotFound } = require("../errorHandler/errorHandler");
const { v4 } = require("uuid");
const sgMail = require("@sendgrid/mail");

class UsersController {
  constructor() {
    this._costFactor = 4;
    this._sgMail = sgMail;

    this._sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  get userRegistration() {
    return this._userRegistration.bind(this);
  }

  get userLogIn() {
    return this._userLogIn.bind(this);
  }

  get getCurrentUser() {
    return this._getCurrentUser.bind(this);
  }

  get updateUserSubscription() {
    return this._updateUserSubscription.bind(this);
  }

  get repeatVerify() {
    return this._repeatVerify.bind(this);
  }

  async _userRegistration(req, res, next) {
    try {
      const { password, email } = req.body;

      const isUserExist = await usersModel.findByEmail(email);

      if (isUserExist && isUserExist.length > 0) {
        return res.status(409).json({ message: "Email in use" });
      }

      const hashedPassword = await bcryptjs.hash(password, this._costFactor);

      const avatarURL = gravatar.url(
        email,
        { s: "100", r: "x", d: "retro" },
        true
      );

      const verificationToken = v4();

      const newUser = await usersModel.create({
        email: email,
        password: hashedPassword,
        avatarURL: avatarURL,
        verificationToken: verificationToken,
      });

      await this.sendVerificationMail(email, verificationToken);

      const [preparedUserData] = this.prepareReturnUserData([newUser]);

      return res.status(201).json({
        user: {
          ...preparedUserData,
          subscription: "starter",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendVerificationMail(email, verificationToken) {
    console.log(email);
    const msg = {
      to: email,
      from: process.env.Send_Mail,
      subject: "email verification",
      html: `<a href='http://localhost:3000/api/users/verify/${verificationToken}'>To verify your email click here</a>`,
    };

    await sgMail.send(msg);
  }

  async verifyEmail(req, res, next) {
    try {
      const { verificationToken } = req.params;

      const userToVerify = await usersModel.findVerificationToken(
        verificationToken
      );

      if (!userToVerify) {
        throw new NotFound("User not found");
      }

      await usersModel.verifyUser(userToVerify._id);

      return res.status(200).json({
        message: "Verification successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async _repeatVerify(req, res, next) {
    const { email } = req.body;
    const [user] = await usersModel.findByEmail(email);

    if (!user) {
      throw new NotFound("User not found");
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    await this.sendVerificationMail(email, user.verificationToken);

    return res.status(200).json({ message: "Verification email sent" });
  }

  validateRepeatVerify(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().email().required(),
    });

    const userData = req.body;

    const validationResult = validationSchema.validate(userData);

    if (validationResult.error) {
      return res.status(400).send({ message: "missing required field email" });
    }

    next();
  }

  async _userLogIn(req, res, next) {
    try {
      const { email, password } = req.body;
      const [user] = await usersModel.findByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Email or password is wrong" });
      }

      const isPasswordsValid = await bcryptjs.compare(password, user.password);

      if (!isPasswordsValid) {
        return res.status(401).json({ message: "Email or password is wrong" });
      }

      if (!user.verify) {
        return res.status(400).json({ message: "Email is not verified" });
      }

      const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      await usersModel.updateToken(user._id, token);

      const [preparedUserData] = this.prepareReturnUserData([user]);

      return res.status(200).json({
        token,
        user: {
          ...preparedUserData,
          subscription: "starter",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  userDataValidation(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const userData = req.body;

    const validationResult = validationSchema.validate(userData);

    if (validationResult.error) {
      return res.status(400).send({ message: validationResult.error });
    }

    next();
  }

  async authorize(req, res, next) {
    try {
      const authorizationHeader = req.get("Authorization");
      const token = authorizationHeader.replace("Bearer ", "");

      let userId = null;
      try {
        userId = jwt.verify(token, process.env.JWT_SECRET).id;
      } catch (error) {
        next(new UnauthorizedError({ message: "Not authorized" }));
      }

      const user = await usersModel.findById(userId);

      if (!user || user.token !== token) {
        next(new UnauthorizedError({ message: "Not authorized" }));
      }

      req.user = user;
      req.token = token;

      next();
    } catch (error) {
      next(error);
    }
  }

  async userLogout(req, res, next) {
    try {
      const user = req.user;
      await usersModel.updateToken(user._id, null);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  _getCurrentUser(req, res, next) {
    const [userForResponse] = this.prepareReturnUserData([req.user]);

    return res
      .status(200)
      .json({ ...userForResponse, subscription: "starter" });
  }

  async _updateUserSubscription(req, res, next) {
    const { subscription } = req.body;
    const { _id } = req.user;

    const subscriptionTypes = ["starter", "pro", "business"];

    if (!subscriptionTypes.includes(subscription)) {
      return res.status(400).json({
        message:
          'Invalid subscription type. Subscription type must one of the next meaning: "starter", "pro", "business"',
      });
    }

    const updateResults = await usersModel.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true }
    );

    if (!updateResults) {
      return res.status(404).json({
        error: "User is not found",
      });
    }

    const [preparedUser] = this.prepareReturnUserData([updateResults]);

    return res.status(204).json({
      user: preparedUser,
      message: "User updated",
    });
  }

  async updateUserAvatar(req, res, next) {
    try {
      const { _id, avatarURL } = req.user;

      const updateResults = await usersModel.findByIdAndUpdate(
        _id,
        { avatarURL: avatarURL },
        { new: true }
      );

      if (!updateResults) {
        next(new UnauthorizedError({ message: "Not authorized" }));
      }

      return res.status(200).json({ message: avatarURL });
    } catch (error) {
      next(new UnauthorizedError({ message: "Not authorized" }));
    }
  }

  prepareReturnUserData(users = []) {
    const newUserListData = users.map((user) => {
      const { email, subscription } = user;
      return {
        email: email,
        subscription: subscription,
      };
    });
    return newUserListData;
  }
}

module.exports = new UsersController();
