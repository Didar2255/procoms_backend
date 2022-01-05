require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User/User');
const Product = require('./models/Product/Product');
const Order = require('./models/Order/Order');
const ObjectId = require('mongodb').ObjectId;
const Review = require('./models/Review/Review');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

//intialize express app
const app = express();

//PORT
const PORT = process.env.PORT || 5000;

//middlewares
app.use(express.json());
app.use(cors());

//connetion URI of mongodb
const uri = process.env.MONGODB_URI;

// connect to mongodb database
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const errorhandler = (error, request, response, next) => {
  console.log(error.message);

  // handling error for finding documents with wrong ObjectId
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformated id' });
  }

  next(error);
};

async function run() {
  try {
    // (READ) --> GET ALL PRODUCTS FROM DATABASE
    app.get('/products', async (req, res, next) => {
      try {
        const products = await Product.find();
        res.json(products); // send all the products to user
      } catch (error) {
        next(error);
      }
    });

    // (READ) --> GET A SINGLE PRODUCT FROM THE DATABASE
    app.get('/products/:id', async (req, res, next) => {
      try {
        const id = req.params.id;

        const query = { _id: ObjectId(id) }; // query for single product

        const singleProduct = await Product.findOne(query); // find the single product

        res.json(singleProduct); // send the product to client side.
      } catch (error) {
        next(error);
      }
    });

    // (READ) --> GET ALL THE SPECIFIQ ORDER INFO OR ALL ORDERS OF A USER VIA QUERYING
    app.get('/orders', async (req, res, next) => {
      try {
        let orders; // find all orders

        if (req.query?.email) {
          const email = req.query.email;
          orders = await Order.find({ email }); // find the specific user order
        } else {
          orders = await Order.find(); // find all the orders
        }

        res.json(orders); // send the orders to client side.
      } catch (error) {
        next(error);
      }
    });

    // (READ) --> FIND A USER IS ADMIN OR NOT
    app.get('/user', async (req, res, next) => {
      try {
        const email = req.query.email;
        const user = await User.findOne({ email });
        const isAdmin = user?.role === 'admin';
        res.json({ admin: isAdmin }); // send the admin status of user to client side
      } catch (error) {
        next(error);
      }
    });

    // (READ) --> GET ALL THE REVIEW
    app.get('/reviews', async (req, res, next) => {
      try {
        //find in reviews collection
        const reviews = await Review.find();
        res.json(reviews); // send the reviews to client side.
      } catch (error) {
        next(error);
      }
    });

    // (CREATE) --> CREATE A PRODUCT IN DATABASE
    app.post('/products', async (req, res, next) => {
      try {
        const product = req.body;
        const createdProduct = await Product.create(product);
        res.json(createdProduct);
      } catch (error) {
        next(error);
      }
    });

    //  (CREATE) --> CREATE A PRODUCT IN DATABASE
    app.post('/products', async (req, res, next) => {
      try {
        const newProduct = req.body; // product info
        const result = await Product.insertMany(newProduct);

        res.json(result); // response after adding product in the database
      } catch (error) {
        next(error);
      }
    });

    // (CREATE) --> CREATE AN ORDER IN DATABASE
    app.post('/orders', async (req, res, next) => {
      try {
        const newOrder = req.body; // order info

        // insert the order info in order collection
        const result = await Order.insertMany({
          ...newOrder,
          status: 'pending',
        });

        res.json(result); // response after adding order info in the database
      } catch (error) {
        next(error);
      }
    });

    //  (CREATE) --> CREATE AN USER REVIEW IN DATABASE
    app.post('/reviews', async (req, res, next) => {
      try {
        const userReviews = req.body; // user review info

        const result = await Review.insertMany(userReviews);

        res.json(result); // response after adding bike user review in the database
      } catch (error) {
        next(error);
      }
    });

    // (CREATE) --> PAYMENT GATEWAY
    app.post('/create-payment-intent', async (req, res, next) => {
      try {
        const { price } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount: price * 100,
          currency: 'usd',
          automatic_payment_methods: {
            enabled: true,
          },
        });

        res.json({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        next(error);
      }
    });

    //(UPDATE) --> UPDATE THE ORDER STATUS
    app.put('/orders/:id', async (req, res, next) => {
      try {
        const id = req.params.id;

        const filter = { _id: ObjectId(id) };

        const options = { upsert: true };

        // update the order status
        const updateOrder = {
          $set: {
            status: 'shipped',
          },
        };

        const result = await Order.updateOne(filter, updateOrder, options);

        res.json(result); // send the response to client
      } catch (error) {
        next(error);
      }
    });

    //(UPDATE) --> UPDATE AN USER
    app.put('/user', async (req, res, next) => {
      try {
        const user = req.body;

        const filter = { email: user.email };

        const options = { upsert: true };

        const updateDoc = { $set: user };

        const result = await User.updateOne(filter, updateDoc, options);

        res.json(result); // send the respone to client side
      } catch (error) {
        next(error);
      }
    });

    //(UPDATE) --> UPDATE THE USER ROLE
    app.put('/user/admin', async (req, res, next) => {
      try {
        const user = req.body; // will come from frontend ({requester: email, newAdminEmail: email})

        if (user?.requester) {
          const requesterAccount = await User.findOne({
            email: user.requester,
          }); // find the requester info in database

          // check if the requester is admin or not
          if (requesterAccount?.role === 'admin') {
            const filter = { email: user.newAdminEmail };

            const updateDoc = { $set: { role: 'admin' } };

            const result = await User.updateOne(filter, updateDoc);

            res.json(result); // send the result after updating an user role
          } else {
            res
              .status(403)
              .json({ message: 'you do not have access to make admin' });
          }
        } else {
          res.status(404).json({
            message:
              'Please make sure the user that you want to make admin is available in database.',
          });
        }
      } catch (error) {
        next(error);
      }
    });

    // (DELETE) --> DELETE A PRODUCT FROM THE DATABASE
    app.delete('/products/:id', async (req, res, next) => {
      try {
        const id = req.params.id;

        const query = { _id: ObjectId(id) };

        const result = await Product.deleteOne(query); // delete the matched product from database

        res.json(result); // send the response to client side
      } catch (error) {
        next(error);
      }
    });

    // (DELETE) --> DELETE AN ORDER FROM THE DATABASE
    app.delete('/orders/:id', async (req, res, next) => {
      try {
        const id = req.params.id;

        const query = { _id: ObjectId(id) };

        const result = await Order.deleteOne(query); // delete the matched order from database

        res.json(result); // send the response to user
      } catch (error) {
        next(error);
      }
    });

    // (DELETE) --> DELETE ALL ORDERS WITH SPECIFIC ID
    app.delete('/orders/deleteall/:id', async (req, res, next) => {
      try {
        const id = req.params.id;

        const query = { product_id: id };

        const result = await Order.deleteMany(query); // delete all the matched order from database

        res.json(result); // send the response to user
      } catch (error) {
        next(error);
      }
    });

    // (DELETE) --> DELETE ALL ORDERS OF SPECIFICE USER
    app.delete('/orders', async (req, res, next) => {
      try {
        const email = req.query.email;
        const result = await Order.deleteMany({ email }); // delete all the matched order from database

        res.json(result); // send the response to user
      } catch (error) {
        next(error);
      }
    });
  } catch (e) {
    console.log(e.message);
  }
}
run().catch(console.dir);

app.use(errorhandler);

app.get('/', (req, res) => {
  res.send('welcome procoms');
});
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
