const express = require('express');
const {connectToDb, getDb} = require('./db')
const mongodb = require("mongodb")
const {ObjectId} = require("mongodb");

// init app & middleware
const app = express();

app.use(express.json())

//db connection
let db;

connectToDb((error) => {
    if (!error) {
        app.listen(3000, () => {
            console.log('app listening on port 3000')
        })
        db = getDb()
    }
})

//routes
app.get('/products', (request, response) => {
    let products = []
    db.collection('products')
    .find()
    .forEach(product => products.push(product))
    .then(() => {
        console.log(products)
        response.status(200).json(products)
    })
    .catch((error) => {
        response.status(500).json({error: 'Could not fetch the products'})
    })
})


app.get('/products/:id', (request, response) => {
    if (ObjectId.isValid(request.params.id)) {
        db.collection('products')
            .findOne({_id: ObjectId(request.params.id)})
            .then((product) => {
                response.status(200).json(product)
            })
            .catch((error) => {
                response.status(500).json({error: 'Could not fetch the product'})
            })
    } else {
        response.status(500).json({error: 'Not a valid product id'})
    }
})

app.post('/products', (request, response) => {
    const product = request.body

    db.collection('products')
        .insertOne(product)
        .then((result) => {
            response.status(201).json(result)
        })
        .catch((error) => {
            response.status(500).json({error: 'Could not create a new document'})
        })
})

app.delete('/products/:id', (request, response) => {
    if (ObjectId.isValid(request.params.id)) {
        db.collection('products')
            .deleteOne({_id:new ObjectId(request.params.id)})
            .then((result) => {
                response.status(200).json(result)
            })
            .catch((error) => {
                response.status(500).json({error: 'Could not delete the documents'})
            })
    } else {
        response.status(500).json({error: 'Not a valid doc id'})
    }
})

app.put('/products/:id', (request, response) => {
    let newValues = {
        $set: {
            nazwa: request.body.nazwa,
            cena: request.body.cena,
            opis: request.body.opis,
            ilosc: request.body.ilosc,
            jednostka_miary: request.body.jednostka_miary,
        },
    };

    if (ObjectId.isValid(request.params.id)) {
        db.collection('products')
            .replaceOne({_id:new ObjectId(request.params.id)}, newValues)
            .then((result) => {
                response.status(200).json(result)
            })
            .catch((error) => {
                response.status(500).json({error: 'Could not delete the documents'})
            })
    } else {
        response.status(500).json({error: 'Not a valid doc id'})
    }
})

app.get('/products/:id/report', (request, response) => {
    db.collection("products").aggregate([{ $match: { _id: new ObjectId(request.params.id) } },
        {
            $project: {
                name: 1,
                price: 1,
                amount: 1,
                total: { $multiply: ["$price", "$amount"] }
            }
        }]).toArray(function (err, obj) {
            if (err) throw err;
            response.json(obj);
        })
})