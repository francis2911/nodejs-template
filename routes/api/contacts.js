const express = require("express");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateFavoriteStatusContact,
  listFavoriteContacts,
  listContactParams,
} = require("../../models/contacts");

const router = express.Router();

const { schema, id, favorite: fav } = require("../../validation/validation");

router.get("/", async (req, res, next) => {
  try {
    if (req.query.favorite) {
      const favoritedata = await listFavoriteContacts(
        req.email,
        req.query.favorite
      );
      res.json({ data: favoritedata });
    } else if (req.query.page && req.query.limit) {
      const paramData = await listContactParams(
        req.email,
        req.query.page,
        req.query.limit
      );
      res.json({
        data: paramData,
      });
    } else {
      const data = await listContacts(req.email);
      res.json({
        data: data,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    if (contact == null) {
      res.status(404);
      res.json({ message: "Not found." });
      return;
    }
    res.json({ message: "contact exist.", contact });
  } catch (error) {
    console.error(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const { error, value } = schema.validate({ name, email, phone });
    if (error) {
      res.status(400);
      res.json(error.details);
    } else {
      const newContact = await addContact(value, req.email);
      res.status(newContact.status);
      res.json(newContact);
    }
  } catch (error) {
    console.error(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    let message = "";
    let status = 0;
    const { error, value } = id.validate({ id: req.params.contactId });
    if (error) {
      console.error(error);
    } else {
      const contactToRemove = await removeContact(value);
      if (contactToRemove == null) {
        message = "Contact does not exist";
        status = 404;
      } else {
        message = "Contact was removed";
        status = 200;
      }
      res.status(status);
      res.json({ message });
    }
  } catch (error) {
    console.error(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    let status = 0;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    let { error, value } = schema.validate({ name, email, phone });
    if (error) {
      res.status(400);
      res.json(error.details);
    } else {
      const updateDataContact = await updateContact(
        req.params.contactId,
        value
      );
      if (updateDataContact == null) {
        value = "Contact does not exist";
        status = 404;
      } else {
        value = await getContactById(req.params.contactId);
        status = 200;
      }
      res.status(status).json({ value });
    }
  } catch (error) {
    console.error(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    let status = 0;
    const favorite = req.body.favorite;
    let { error, value } = fav.validate({ favorite });
    if (error) {
      res.status(400);
      res.json(error.details);
    } else {
      const updateDataContact = await updateFavoriteStatusContact(
        req.params.contactId,
        value
      );
      if (updateDataContact == null) {
        value = "Contact does not exist";
        status = 404;
      } else {
        value = await getContactById(req.params.contactId);
        status = 200;
      }
      res.status(status).json({ value });
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
