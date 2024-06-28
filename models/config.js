const mongoose = require("mongoose");

const conectionDB = async () => {
  try {
    console.log("connecting to db...");
    await mongoose.connect(process.env.URI_DB);
    console.log("connected to DB");
  } catch (error) {
    console.error(error);
  }
};

module.exports = conectionDB;
