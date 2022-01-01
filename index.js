require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());


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

    }
    catch (e) {
        console.log(e.message);
    }
}
run().catch(console.dir)

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});