const { MongoClient} = require("mongodb");
const mongoURL = "mongodb://127.0.0.1:27017";
const dbName = "car_rental";
let db;

db = MongoClient.connect(mongoURL).then((client)=>{
    console.log("Database Connected");
    return client.db(dbName);
});

module.exports = db;
