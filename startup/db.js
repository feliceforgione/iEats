const mongoose = require("mongoose");
mongoose
  .connect(process.env.databaseURI)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.log("MongoDB not connected: ", e));
