const dotenv = require('dotenv')
dotenv.config()
const {MongoClient} = require('mongodb')

let dbConnection;
const uri = process.env.URI
module.exports = {
    connectToDb: (callback) => {
        MongoClient.connect(uri)
            .then((client) => {
                dbConnection = client.db()
                console.log("połączono")
                return callback()
            })
            .catch((error) => {
                console.log(error)
                return callback(error)
            })
    }, // initially connect to a database
    getDb: () => dbConnection // return our database connection after we have alredy connected to it
}