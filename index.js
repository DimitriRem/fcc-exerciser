const express = require('express')
const app = express()
const cors = require('cors')
const multer = require('multer')
require('dotenv').config()
const upload = multer();

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", upload.none(), (req, res) => {
  let username = req.body.username;
  
  if (username === ""){
    res.json({error: "please enter a user name"})}


console.log(username);
  res.json(username)
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
