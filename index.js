const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

try {
  mongoose.connect(
    "mongodb+srv://fcc-exercise:fcc-exercise@cluster0.tresqhg.mongodb.net/fcc-exercise?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  console.log("db connected");
} catch (err) {
  console.log(err);
}

const personSchema = new mongoose.Schema({
  username: {
    type: String,
    require: [true, "username must be provided"],
    unique: true,
  },
});

const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: [true, "userId must be provided"],
  },
  username: {
    type: String,
    require: [true, "username must be provided"],
  },
  description: {
    type: String,
    require: [true, "desc must be provided"],
  },
  duration: {
    type: Number,
    require: [true, "Duration must be provided"],
  },
  date: {
    type: Date,
    require: [true, "date must be provided"],
  },
});

const Person = mongoose.model("Person", personSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", function (req, res) {
  const username = req.body.username;
  const data = new Person({ username: username });
  data.save((err, data) => {
    if (err) {
      res.json("username already Taken");
    } else {
      res.json({ username: data.username, _id: data._id });
    }
  });
});

app.get("/api/users", (req, res) => {
  Person.find({}, (err, data) => {
    if (!data) {
      res.send("No user");
    } else {
      res.json(data);
    }
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const _id = req.body[":_id"];
  const { description, duration, date } = req.body;

  Person.findById(_id, (err, data) => {
    if (!data) {
      res.send("User Not found");
    } else {
      const username = data.username;
      const addExercise = new Exercise({
        userId: _id,
        username,
        description,
        duration,
        date,
      });
      addExercise.save((err, user) => {
        if (err) console.log(err);
        res.json({
          username: username,
          description: user.description,
          duration: user.duration,
          date: user.date.toDateString,
          _id,
        });
      });
    }
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  let filter = { _id };
  let dateFilter = {};
  if (from) {
    dateFilter["&gte"] = new Date(from);
  }
  if (to) {
    dateFilter["&lte"] = new Date(to);
  }
  if (from || to) {
    filter.dateFilter = dateFilter;
  }

  Person.findById(filter, (err, data) => {
    if (!data) {
      res.send("userId not found");
    } else {
      const username = data.username;
      //{date: {$gte: new Date(from), $lte:new Date (to)}}
      Exercise.find({ userId: _id })
        .limit(limit)
        .exec((err, data) => {
          if (err) console.log(err);
          console.log(data);
          let customdata = data.map((items) => {
            let formattedDate = new Date(items.date).toDateString();
            return {
              description: items.description,
              duration: items.duration,
              date: formattedDate,
            };
          });
          if (!data) {
            res.json({
              _id: _id,
              username: username,
              count: 0,
              log: [],
            });
          } else {
            console.log("inside");
            res.json({
              _id: _id,
              username: username,
              count: data.length,
              log: customdata,
            });
          }
        });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
