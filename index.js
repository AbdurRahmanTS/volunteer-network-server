const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.fxa3v.mongodb.net:27017,cluster0-shard-00-01.fxa3v.mongodb.net:27017,cluster0-shard-00-02.fxa3v.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-11d4rj-shard-0&authSource=admin&retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());

const port = 5000


MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, client) {
  const volunteerItemsCollection = client.db(`${process.env.DB_NAME}`).collection("volunteerItems");
  
  app.post('/addVolunteerItems', (req, res) => {
    const volunteerItems = req.body;
    volunteerItemsCollection.insertOne(volunteerItems)
      .then(result => {
        res.send(result.insertedCount)
      })
  })

  app.get('/volunteerItems', (req, res) => {
    volunteerItemsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  const registerCollection = client.db(`${process.env.DB_NAME}`).collection("registerInfo");

  app.post('/addRegisterInfo', (req, res) => {
    const newRegister = req.body
    registerCollection.insertOne(newRegister)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.get('/registerInfo', (req, res) => {
    registerCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.delete('/delete/:id', (req, res) => {
    registerCollection.deleteOne({ _id: req.params.id })
      .then(result => {
        res.send(result.deletedCount > 0);
      })
  })

});


app.listen(process.env.PORT || port)