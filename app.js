var express = require('express');
var pug = require('pug');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const dbUrl = 'mongodb://localhost:27018';
const dbName = 'rtb-db';
const ordersTable = 'orders';
const usersCol = "users";

async function dbGetOrders() {
  let client;

  try {
      client = await MongoClient.connect(dbUrl);
      
      const db = client.db(dbName);
      const col = db.collection(ordersTable);

      var orders = await col.find({}).limit(100).sort({"_id": -1}).toArray();
      return orders;
  } catch (err) {
      console.log(err.stack);
  }
      client.close();
};

async function dbFindUser(name) {
  let client;

  try {
      client = await MongoClient.connect(dbUrl);
      
      const db = client.db(dbName);
      const col = db.collection(usersCol);

      var user = await col.findOne({"name": name});
      return user;
  } catch (err) {
      console.log(err.stack);
  }
      client.close();
};

var app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('pub'));

app.get('/', (req, res) => {
    res.render('index', {});
});

app.get('/orders', async function (req, res) {
    var orders = await dbGetOrders();
    res.render('orders', {'orders': orders});
});

app.get('/user/:name', async (req, res) => {
    user = await dbFindUser(req.params.name);
    if(user == null) {
	res.status(500).send("User does not exist.");
    } else {
	res.render('user', {'user': user, 'coins': user.coins});
    }
});

app.listen(3000);
