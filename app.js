const express = require('express');
const pug = require('pug');
const expressMongoDb = require('express-mongo-db');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var app = express();
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('pub'));
app.use(expressMongoDb('mongodb://localhost:27018/rtb-db'));

const ordersCol = "orders";
const usersCol = "users";

app.get('/', async (req, res) => {
    var orders = await req.db.collection(ordersCol).find({}).limit(5).sort({"_id": -1}).toArray();
    res.render('index', {"orders": orders});
});

app.get('/orders', async (req, res) => {
    var name = req.params.name;
    var orders = await req.db.collection(ordersCol).find({}).limit(100).sort({"_id": -1}).toArray();
    res.render('orders', {'orders': orders});
});

app.get('/user/:name', async (req, res) => {
    var name = req.params.name;
    var user = await req.db.collection(usersCol).findOne({"name": name})
    if(user == null) {
	res.status(500).send("User does not exist.");
    } else {
	var orders = req.db.collection(ordersCol);
	var fromOrders = await orders.find({"from": name}).limit(3).sort({"_id": -1}).toArray();
	var toOrders = await orders.find({"to": name}).limit(3).sort({"_id": -1}).toArray();
	res.render('user', {'user': user,
			    'coins': user.coins,
			    'fromOrders': fromOrders,
			    'toOrders': toOrders});
    }
});

app.listen(3000);
