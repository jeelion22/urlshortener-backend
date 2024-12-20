const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const crypto = require("crypto");

const userController = {
  register: async (req, res) => {
    try {
      const { firstname, lastname, email, password } = req.body;

      let passwordHash = await bcrypt.hash(password, 10);

      const newUser = await User({ firstname, lastname, email, passwordHash });

      await newUser.save();

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      if (user.isPasswordResetRequested) {
        return res.status(400).json({ message: "Please reset password" });
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.passwordHash
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      if (!user.isEmailVerified) {
        await user.sendEmailVerificationLink();

        return res.status(200).json({
          message:
            "Please verify your email address by the link sent to your registered email address",
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 24 * 3600 * 1000),
      });

      res.status(200).json({ message: "Loggin successful" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  verifyAccount: async (req, res) => {
    try {
      const emailToken = req.params.emailToken;
      const userId = req.params.userId;

      const hashedEmailToken = crypto
        .createHash("sha256")
        .update(emailToken)
        .digest("hex");

      const user = await User.findOneAndUpdate(
        {
          _id: userId,
          emailVerificationToken: hashedEmailToken,
          emailVerificationTokenExpiresAt: { $gt: Date.now() },
        },
        {
          $set: {
            isEmailVerified: true,
          },
          $unset: {
            emailVerificationToken: "",
            emailVerificationTokenExpiresAt: "",
          },
        },

        {
          new: true,
        }
      );

      if (!user) {
        return res.status(400).json({ message: "Invalid link" });
      }

      res.status(200).json({ message: "Email verification successful" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const email = req.body.email;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "invalid credentials" });
      }

      await user.sendPasswordResetLink();

      res.status(200).json({
        message:
          "Password reset link sent successfully to registered email address",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { userId, passwordResetToken } = req.params;
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ message: "Password is required" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const hashedPasswordToken = crypto
        .createHash("sha256")
        .update(passwordResetToken)
        .digest("hex");

      const user = await User.findOneAndUpdate(
        {
          _id: userId,
          passwordResetVerificationToken: hashedPasswordToken,
          passwordResetVerificationTokenExpiresAt: { $gt: Date.now() },
        },
        {
          $set: {
            isPasswordResetRequested: false,
            passwordHash: passwordHash,
          },
          $unset: {
            passwordResetVerificationTokenExpiresAt: "",
            passwordResetVerificationToken: "",
          },
        },
        { new: true }
      );

      if (!user) {
        return res.status(400).json({ message: "Invalid link" });
      }

      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  me: async (req, res) => {
    try {
      const userId = req.userId;

      let user = await User.findById(userId).select(
        "-__v -isEmailVerified -passwordHash -emailVerificationToken -emailVerificationTokenExpiresAt  -passwordResetVerificationToken -passwordResetVerificationTokenExpiresAt"
      );

      if (user.isPasswordResetRequested) {
        res.clearCookie("token", {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });

        return res.status(400).json({ message: "Please reset password" });
      }

      formatUser = (user) => {
        const { _id, firstname, lastname, email, urlsShortened } = user;

        return { _id, firstname, lastname, email, urlsShortened };
      };

      res.status(200).json(formatUser(user));
    } catch (error) {
      res.json({ message: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.status(204).send();
    } catch (error) {
      res.json({ message: error.message });
    }
  },
};

module.exports = userController;
