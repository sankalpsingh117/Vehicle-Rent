const dbPromise = require("../config/db_connection.js")

async function LoginAuth(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    let db = await dbPromise;
    let users = await db.collection(req.body.role).find().toArray();
    for(element of users) {
        if (element.email === email && element.password === password) {
            req.body.login = true;
            break;
        } else if (element.email === email && element.password !== password)
            req.body.login = "wrong password";
        else
            req.body.login = "user not found";
    };
    next();
}

module.exports = LoginAuth;