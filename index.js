require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User/User');

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
  } catch (e) {
    console.log(e.message);
  }
}
run().catch(console.dir);

app.use(errorhandler);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
