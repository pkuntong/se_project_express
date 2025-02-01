const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/index");

const app = express();
const { PORT = 3001 } = process.env;

mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("DB Connection Error:", err));

app.use(express.json());
app.use(cors());
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
