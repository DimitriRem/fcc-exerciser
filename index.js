const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function connectToDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://fcc-exercise:fcc-exercise@cluster0.tresqhg.mongodb.net/fcc-exercise?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Connected to DB OK");
  } catch (error) {
    console.error("Unable to connect to DB: ", error);
  }
}
connectToDB();

// SCHEMAS + Models _____________
const ExerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: String,
  duration: Number,
  date: String,
});
const UserSchema = new mongoose.Schema({
  username: String,
  log: [ExerciseSchema],
});

const Exercise = mongoose.model("Exercise", ExerciseSchema);
const User = mongoose.model("User", UserSchema);

//_______________________________

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const newUsername = req.body.username;

  try {
    const { username, _id } = await User.create({ username: newUsername });

    res.json({ username: username, _id: _id });
  } catch (error) {
    console.log("Unable to create new user: ", error);
    if (error.code === 11000 || error.code === 11001) {
      res.json({ message: "Duplicate record." });
    } else {
      res.json({ message: "Unable to create new user." });
    }
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const allUsers = await User.find();

    const usernames = [];

    const userArray = allUsers.map((user) => {
      return {
        username: user.username,
        _id: user._id,
        __v: user.__v,
      };
    });
    res.json(userArray);
  } catch (error) {
    console.log("Unable to fetch all users: ", error);
    res.json("Unable to fetch all users.");
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  let description = req.body.description;
  let duration = req.body.duration;
  let date = "";
  let _id = req.params._id;

  if (req.body.date === "") {
    date = new Date();
  } else {
    date = new Date(req.body.date).toDateString();
  }
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.json("Invalid user ID.");
  }
  if (!duration) return res.json("Please insert valid duration");
  if (!description) return res.json("Please insert valid description");

  try {
    const user = await User.findById({ _id });
    if (!user) {
      return res.json("No such user");
    }

    const newExercise = await Exercise.create({
      description: description,
      duration: duration,
      date: date,
    });

    user.log.push(newExercise);

    await user.save();

    const response = {
      _id: user._id,
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date,
    };

    res.json(response);
  } catch (error) {
    console.log("Error adding exercise: ", error);
    return res.json("Unable to add exercise.");
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.json("User not found.");
    }

    let logs = user.log;

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      logs = logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= fromDate && logDate <= toDate;
      });
    }

    if (limit) {
      logs = logs.slice(0, parseInt(limit, 10));
    }

    const formattedLogs = logs.map((log) => ({
      description: log.description,
      duration: log.duration,
      date: log.date.toDateString(),
    }));

    const response = {
      _id: userId,
      username: user.username,
      count: formattedLogs.length,
      log: formattedLogs,
    };

    return res.json(response);
  } catch (error) {
    console.log("Error getting user log data: ", error);
    return res.json("Could not get user las log data.");
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
