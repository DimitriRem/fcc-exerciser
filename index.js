const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const upload = multer();
const mongoose = require('mongoose');
const { type } = require('express/lib/response');
mongoose.connect("mongodb+srv://fcc-exercise:fcc-exercise@cluster0.tresqhg.mongodb.net/fcc-exercise?retryWrites=true&w=majority&appName=Cluster0")

const userSchema = new mongoose.Schema({
  username: String,
  log:[]  
}, {versionKey: false})

var User = mongoose.model('User', userSchema);

var createAndSaveUser = (input, done) => {
  var concatName = input.split(" ").join("");
User.create({username: input})
.then(result => console.log("New DB Entry: "+result));
};

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  User.find({}).then(users => res.send(users));
    });

app.get('/api/users/:_id', (req, res) => {
  User.find({_id:req.params._id}).then(users => res.send(users));
    });

app.get('/api/users/:_id/logs', (req, res) => {
  User.find({_id:req.params._id}).then(user => res.json({_id:user[0]._id, username:user[0].username, log:user[0].log, count:user[0].log.length}));
    });

app.post("/api/users", upload.none(), (req, res) => { 
  if (req.body.username === "") {
    res.json({ error: "please enter a user name" })
    return;
  } 
  let username = req.body.username;
  createAndSaveUser(username);
  User.find({username: username}).then(item => res.json({username:item[0].username, _id:item[0]._id}));
  });


app.post("/api/users/:_id/exercises", upload.none(), (req, res) => {

  var formDate = "";

  if (req.body._id === null) {res.json({ error: "please enter a user id" })
  return;}
  if (req.body.description === ""  || typeof req.body.description !="string" ) {res.json({ error: "please enter a description" })
  return;}
  if (req.body.duration === "" || typeof parseFloat(req.body.duration) !="number" ) {res.json({ error: "please enter a duration" })
  return;}
  if (req.body.date === "") {formDate=new Date} else {formDate=new Date(req.body.date).toDateString()};

  var logObject = {description:req.body.description, duration:parseFloat(req.body.duration), date:formDate};
  console.log("04 logObject: ")
  console.log(logObject);
  console.log(typeof logObject.description);
  console.log(typeof logObject.duration);
  console.log(typeof logObject.formDate);

  User.find({_id:req.params._id})
  .then(
    user => {
      console.log("05 user found:");
      console.log(user);
      user[0].log.push(logObject);
      user[0].save().then((item) => {
        res.json(item);
      })
    });

    res.json

  })


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
