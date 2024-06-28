const express = require("express");
const { userSchema, email } = require("../../validation/user.validation");
const {
  getUserByEmail,
  createUser,
  comparePasswords,
  generateToken,
  updateToken,
  updateSubscription,
  updateAvatarURL,
  getUserByTk,
  updateVerificationStatus,
} = require("../../models/users");
const verifyToken = require("../../middlewares/auth.middleware");
const router = express.Router();

const multer = require("multer");
const storage = require("../../middlewares/static.middleware");
const upload = multer({ storage });

const path = require("path");
const fs = require("fs");
const jimp = require("jimp");

const verifyAccount = require("../../middlewares/verifiedAccount.middleware");
const transporter = require("../../utils/nodemailer.utils");

router.post("/login", async (req, res, next) => {
  try {
    const { error, value } = userSchema.validate({
      email: req.body.email,
      password: req.body.password,
    });
    if (error) {
      res.status(400);
      res.json({
        message: error.message,
      });
    } else {
      const getUser = await getUserByEmail(value.email);
      const match = await comparePasswords(value.password, getUser);
      if (!getUser || !match) {
        return res.status(401).json({ message: "Email or password is wrong" });
      }

      const token = await generateToken(value);
      await updateToken(getUser.id, token);

      res.status(200);
      res.json({ email: value.email, token });
    }
  } catch (error) {
    console.error(error);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const { error, value } = userSchema.validate({
      email: req.body.email,
      password: req.body.password,
    });
    if (error) {
      res.status(400);
      res.json({
        message: error.message,
      });
      return;
    } else {
      const user = await getUserByEmail(value.email);
      if (user !== null) {
        res.status(409);
        res.json({
          message: "Email in use",
        });
        return;
      } else {
        const newUser = await createUser(value);
        await transporter.sendMail({
          from: process.env.USER_SMTP,
          to: value.email,
          subject: "Please verify your account",
          html: `<p>email sent by ${process.env.USER_SMTP}</p>
                <a target="_blank" href=${process.env.HOST}api/users/verify/${newUser.verificationToken}>Click here to verify account</a>
              or copy and paste link below: <p>${process.env.HOST}api/users/verify/${newUser.verificationToken}</p>`,
        });
        res.status(201);
        res.json(newUser);
      }
    }
  } catch (error) {
    console.error(error);
  }
});

router.post("/logout", verifyToken, verifyAccount, async (req, res, next) => {
  try {
    const getUser = await getUserByEmail(req.email);

    await updateToken(getUser.id, null);

    res.status(204);
    res.json();
  } catch (error) {
    console.error(error);
  }
});

router.get("/current", verifyToken, verifyAccount, async (req, res, next) => {
  try {
    const getUser = await getUserByEmail(req.email);
    res.status(200);
    res.json({ email: getUser.email, subscription: getUser.subscription });
  } catch (error) {
    console.error(error);
  }
});

router.patch("/", verifyToken, verifyAccount, async (req, res, next) => {
  try {
    if (req.body.subscription) {
      const getUser = await getUserByEmail(req.email);
      await updateSubscription(getUser.id, req.body.subscription);
    }
    res.status(200);
    res.json();
  } catch (error) {
    console.error(error);
  }
});

router.patch(
  "/avatars",
  verifyToken,
  verifyAccount,
  upload.single("file"),
  async (req, res) => {
    try {
      console.log(req.file);
      const getUser = await getUserByEmail(req.email);
      const filepath =
        process.env.STATIC_AVATARS +
        `avatar-${getUser.id}` +
        path.extname(req.file.originalname);
      const image = await jimp.read(req.file.path);
      image.resize(250, 250);
      image.write(filepath);
      await updateAvatarURL(
        getUser.id,
        process.env.HOST + filepath.split("public/")[1]
      );
      fs.unlink(req.file.path, (error) => error);
      res.status(200).json({
        avatarURL: process.env.HOST + filepath.split("public/")[1],
      });
    } catch (error) {
      console.error(error);
    }
  }
);

router.get("/verify/:verificationToken", async (req, res) => {
  try {
    const findUserByVT = await getUserByTk(req.params.verificationToken);
    if (findUserByVT === null) {
      res.status(404);
      res.json({
        message: "not found",
      });
      return;
    }
    await updateVerificationStatus(findUserByVT.id);
    return res.status(200).json({ message: "verification successfull" });
  } catch (error) {
    console.error(error);
  }
});

router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { error, value } = email.validate({ email: req.body.email });
    if (error) {
      res.status(400);
      res.json({
        message: "missing required field email",
      });
      return;
    }
    const findUserByEmail = await getUserByEmail(value.email);
    if (findUserByEmail === null) {
      res.status(404);
      res.json({
        message: "not found",
      });
      return;
    }
    if (!findUserByEmail.verify) {
      await transporter.sendMail({
        from: process.env.USER_SMTP,
        to: value.email,
        subject: "Please verify your account",
        html: `<p>email sent by ${process.env.USER_SMTP}</p>
            <a target="_blank" href=${process.env.HOST}api/users/verify/${findUserByEmail.verificationToken}>Click here to verify account</a>
              or copy and paste link below: <p>${process.env.HOST}api/users/verify/${findUserByEmail.verificationToken}</p>`,
      });
      return res
        .status(200)
        .json({ message: "Verification email sent, please verify your inbox" });
    }
    return res
      .status(400)
      .json({ message: "Verification has already been passed" });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
