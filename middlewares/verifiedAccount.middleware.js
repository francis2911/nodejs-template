const { getUserByEmail } = require("../models/users");

const verifyAccount = async (req, res, next) => {
  try {
    const { verify } = await getUserByEmail(req.email);
    if (verify) {
      return next();
    }
    return res.status(401).json({ message: "Please verify account" });
  } catch (error) {
    console.log(error);
  }
  next();
};

module.exports = verifyAccount;
