const dbPromise = require("../config/db_connection.js")
async function SignupAuth(req,res,next)
{
    const email = req.body.email;
    let db = await dbPromise;
    let users=await db.collection(req.body.role).find().toArray();
    users.forEach((element)=>{
        if(element.email===email)
        {
            req.body.exist=true;
        }
    });
    next();
}

module.exports = SignupAuth;