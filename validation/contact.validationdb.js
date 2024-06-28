const { Schema, model } = require("mongoose");

const contactSchema = Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  favorite: {
    type: Boolean,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = model("contacts", contactSchema);
