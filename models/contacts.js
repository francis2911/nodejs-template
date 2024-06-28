const contacts = require("../validation/contact.validationdb");
const users = require("../validation/user.validationdb");

const listContacts = async (email) => {
  try {
    const createdBy = await users.findOne({ email }).exec();
    const contactsList = await contacts.find({ owner: createdBy._id });
    return contactsList;
  } catch (error) {
    return { error };
  }
};

const listContactParams = async (email, page, limit) => {
  try {
    const createdBy = await users.findOne({ email }).exec();
    const contactsList = await contacts
      .find({
        owner: createdBy._id,
      })
      .skip((page - 1) * limit)
      .limit(limit);
    return contactsList;
  } catch (error) {
    return { error };
  }
};

const listFavoriteContacts = async (email, favorite) => {
  try {
    const createdBy = await users.findOne({ email }).exec();
    const favoriteQuery = favorite === "true";
    const contactsList = await contacts.find({
      favorite: favoriteQuery,
      owner: createdBy._id,
    });
    return contactsList;
  } catch (error) {
    return { error };
  }
};

const getContactById = async (contactId) => {
  try {
    const contact = await contacts.findById(contactId).exec();
    return contact;
  } catch (error) {
    return { error };
  }
};

const removeContact = async ({ id: contactId }) => {
  try {
    const contactRemoved = await contacts.findByIdAndDelete(contactId);
    return contactRemoved;
  } catch (error) {
    return { error };
  }
};

const addContact = async (body, email) => {
  try {
    const createdBy = await users.findOne({ email }).exec();
    const newContact = await contacts.create({
      ...body,
      favorite: false,
      owner: createdBy._id,
    });
    return { newContact, status: 200 };
  } catch (error) {
    return { error };
  }
};

const updateContact = async (contactId, body) => {
  try {
    const contactToUpdate = await contacts
      .findByIdAndUpdate(contactId, body)
      .exec();
    return contactToUpdate;
  } catch (error) {
    return { error };
  }
};

const updateFavoriteStatusContact = async (contactId, body) => {
  try {
    const contactToUpdateFavorite = await contacts
      .findByIdAndUpdate(contactId, body)
      .exec();
    return contactToUpdateFavorite;
  } catch (error) {
    return { error };
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavoriteStatusContact,
  listFavoriteContacts,
  listContactParams,
};
