require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User/User');
const Product = require('./models/Product/Product');
const ObjectId = require('mongodb').ObjectId;

//initialize express app
const app = express();

//PORT
const PORT = process.env.PORT || 5000;

//middle wares
app.use(express.json());
app.use(cors());

//connection URI of mongodb
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

        const query = { _id: ObjectId(id) }; // query for single bike

        const singleProduct = await Product.findOne(query); // find the single bike

        res.json(singleProduct); // send the bike to client side.
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

    //(UPDATE) --> UPDATE AN USER
    app.put('/user', async (req, res) => {
      const user = req.body;

      const filter = { email: user.email };

      const options = { upsert: true };

      const updateDoc = { $set: user };

      const result = await User.updateOne(filter, updateDoc, options);

      res.json(result); // send the respone to client side
    });

    //(UPDATE) --> UPDATE THE USER ROLE
    app.put('/user/admin', async (req, res) => {
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
    });

    // (DELETE) --> DELETE A BIKE FROM THE DATABASE
    app.delete('/products/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const query = { _id: ObjectId(id) };

        const result = await Product.deleteOne(query); // delete the matched product from database

        res.json(result); // send the response to client side
      } catch (error) {
        next(error);
      }
    });

    // Create A card In database

    app.post('/card', async (req, res, next) => {
      try {
        const card = await Card.create(req.body);
        res.json(card);
      } catch (error) {
        next(error);
      }
    });

    // get All card from database
    app.get('/', async (req, res, next) => {
      try {
        const allcards = await Card.find();
        res.json(allcards);
      } catch (error) {
        next(error);
      }
    });

    // get a single card using id 
    app.get('/card/:id', async (req, res, next) => {
      try {
        const { id } = req.params;
        const card = await Card.findById(id);
        res.json(card);
      } catch (error) {
        next(error);
      }
    });
    // implement payment
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

    // update the user payment info
    app.put('/makepayment', async (req, res, next) => {
      try {
        const email = req.query.email;
        const updatedUser = await User.updateOne(
          { email },
          { isPaidUser: true }
        );
        res.json(updatedUser);
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

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
