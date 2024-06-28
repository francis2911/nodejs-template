const app = require("./app");
const conectionDB = require("./models/config");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

conectionDB();

app.listen(3000, () => {
  console.log("Server running. Use our API on port: 3000");
});
