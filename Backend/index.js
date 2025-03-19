const express = require("express");
const {ObjectId} = require("mongodb");
const bodyParser = require("body-parser");
const dbPromise = require('./config/db_connection.js');
const LoginAuth = require("./middlewares/LoginAuth.js");
const SignupAuth = require("./middlewares/SignupAuth.js");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const multer = require('multer');
const path = require("path");
const PORT = 3000;
const bcrypt = require('bcrypt');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
    },
  });

  const upload = multer({ storage });

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/login",LoginAuth,(req,res)=>{
    if(req.body.login === true){
        const token = jwt.sign({"email":req.body.email,'role':req.body.role}, 'mysecret', { expiresIn: "1h" });
        res.send({"token":token,"response":"Successful"});
    }
    else
    res.send(req.body.login);

});

app.post("/signup", SignupAuth ,async (req,res)=>{
    const db = await dbPromise;
    let user = req.body;
    if(req.body.exist!=true){
    await db.collection(req.body.role).insertOne(user);
    res.send("User Inserted");}
    else
    {res.send("user already exist");}
});

app.post("/owner-addcar",upload.single('image'),async (req,res)=>{
    const token = req.header("Authorisation")?.split(" ")[1];
    let response;
    try {
        response = jwt.verify(token, 'mysecret');
        
        let car = {
            carName: req.body.carName,
            buildYear: req.body.buildYear,
            model: req.body.model,
            carNumber: req.body.carNumber,
            price: req.body.price,
            image: req.file ? `/uploads/${req.file.filename}` : null,
            owner: response.email,
            requests: [],
            booked: null
        };
        
        const db = await dbPromise;
        await db.collection('cars').insertOne(car);
        res.send('inserted');
    } catch(e) {
        console.error(e);
        res.send("token is invalid");
    }
});

app.get('/account-info',async (req,res)=>{
    const token = req.header("Authorisation")?.split(" ")[1];
    try{
    let jwtres = jwt.verify(token,'mysecret')
    let db = await dbPromise;
    let result = await db.collection(jwtres.role).findOne({'email':jwtres.email});
    res.send(result);}
    catch(e)
    {res.send('login')}
})

app.get('/owner-getcars',async (req,res)=>{
  
    const token = req.header("Authorisation")?.split(" ")[1];
    try{
    let jwtres = jwt.verify(token,'mysecret')
    let db = await dbPromise;
    let result = await db.collection('cars').find({'owner':jwtres.email}).toArray();
    res.send(result);}
    catch(e)
    {
        res.send("login");
    }
 
})

app.get('/users-getcars', async (req, res) => {
    const token = req.header("Authorisation")?.split(" ")[1];
    try {
        let jwtres = jwt.verify(token, 'mysecret');
        let db = await dbPromise;
        let result = await db.collection('cars').find().toArray();
        res.send(result);
    } catch(e) {
        res.send("login");
    }
});

app.post('/book-car', async (req, res) => {
    const token = req.header("Authorisation")?.split(" ")[1];
    try {
        let jwtres = jwt.verify(token, 'mysecret');
        let db = await dbPromise;
        
        
        let result = await db.collection('cars').updateOne(
            {_id: new ObjectId(req.body.id)}, 
            {$push: {
                requests: {
                    email: jwtres.email,
                    duration: parseInt(req.body.duration),
                    startDate: new Date(req.body.startDate)
                }
            }}
        );
        res.send(result);
    } catch(e) {
        console.error(e);
        res.send('login');
    }
});

app.get('/user-requests', async (req, res) => {
    const token = req.header("Authorisation")?.split(" ")[1];
    try {
        let jwtres = jwt.verify(token, 'mysecret');
        let db = await dbPromise;
        let result = await db.collection('cars').find({
            "requests": {
                $elemMatch: {
                    email: jwtres.email
                }
            },
            "booked": null 
        }).toArray();
        res.send(result);
    } catch(e) {
        console.error(e);
        res.send('login');
    }
});

app.post('/approve-request', async (req, res) => {
    const token = req.header("Authorisation")?.split(" ")[1];
    try {
        let jwtres = jwt.verify(token, 'mysecret');
        let db = await dbPromise;
        
        
        const car = await db.collection('cars').findOne({
            _id: new ObjectId(req.body.carId),
            owner: jwtres.email
        });
        
        if (!car) {
            return res.status(403).send('Not authorized to approve this request');
        }
        
        
        let result = await db.collection('cars').updateOne(
            {_id: new ObjectId(req.body.carId)},
            {
                $set: {
                    booked: {
                        user: req.body.userEmail,
                        date: new Date(),
                        duration: req.body.duration || 1,
                        startDate: req.body.startDate || new Date()
                    }
                },
                $pull: {
                    requests: {
                        email: req.body.userEmail
                    }
                }
            }
        );
        
        if (result.modifiedCount > 0) {
            res.json({ 
                success: true,
                acknowledged: true,
                message: 'Request approved successfully'
            });
        } else {
            res.json({
                success: false,
                acknowledged: false,
                message: 'Failed to approve request'
            });
        }
    } catch(e) {
        console.error(e);
        res.status(500).json({
            success: false,
            acknowledged: false,
            message: 'Server error while approving request'
        });
    }
});

app.get('/owner-requests', async (req, res) => {
    const token = req.header("Authorisation")?.split(" ")[1];
    try {
        let jwtres = jwt.verify(token, 'mysecret');
        let db = await dbPromise;
        let result = await db.collection('cars').find({
            owner: jwtres.email,
            requests: { $exists: true, $ne: [] }
        }).toArray();
        res.send(result);
    } catch(e) {
        res.send('login');
    }
});

app.delete('/cancel-request/:carId', async (req, res) => {
    const token = req.header("Authorisation")?.split(" ")[1];
    try {
        let jwtres = jwt.verify(token, 'mysecret');
        let db = await dbPromise;
        
    
        let result = await db.collection('cars').updateOne(
            { _id: new ObjectId(req.params.carId) },
            { $pull: { 
                requests: { 
                    email: jwtres.email 
                } 
            }}
        );
        
        if (result.modifiedCount > 0) {
            res.json({ success: true, message: 'Request cancelled successfully' });
        } else {
            res.json({ success: false, message: 'Request not found or already cancelled' });
        }
    } catch(e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'Failed to cancel request' });
    }
});

app.get('/user-booked-cars', async (req, res) => {
    const token = req.header("Authorisation")?.split(" ")[1];
    try {
        let jwtres = jwt.verify(token, 'mysecret');
        let db = await dbPromise;
        
      
        let result = await db.collection('cars').find({
            "booked.user": jwtres.email
        }).toArray();
        
        res.send(result);
    } catch(e) {
        console.error(e);
        res.send('login');
    }
});

app.post('/user-cancel-booking/:carId', async (req, res) => {
    const token = req.header("Authorisation")?.split(" ")[1];
    try {
        let jwtres = jwt.verify(token, 'mysecret');
        let db = await dbPromise;
        
      
        const car = await db.collection('cars').findOne({
            _id: new ObjectId(req.params.carId),
            "booked.user": jwtres.email
        });
        
        if (!car) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }
       
        let result = await db.collection('cars').updateOne(
            { _id: new ObjectId(req.params.carId) },
            { $set: { booked: null } }
        );
        
        if (result.modifiedCount > 0) {
            res.json({
                success: true,
                message: 'Booking cancelled successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed to cancel booking'
            });
        }
    } catch(e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling booking'
        });
    }
});

app.delete('/owner-removecar/:carId', async (req, res) => {
    const token = req.header("Authorisation")?.split(" ")[1];
    try {
        let jwtres = jwt.verify(token, 'mysecret');
        let db = await dbPromise;
        
      
        const car = await db.collection('cars').findOne({
            _id: new ObjectId(req.params.carId),
            owner: jwtres.email
        });
        
        if (!car) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to remove this car'
            });
        }
        
    
        let result = await db.collection('cars').deleteOne({
            _id: new ObjectId(req.params.carId)
        });
        
        if (result.deletedCount > 0) {
            res.json({
                success: true,
                message: 'Car removed successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed to remove car'
            });
        }
    } catch(e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: 'Server error while removing car'
        });
    }
});


app.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.header("Authorisation")?.split(" ")[1];
    let jwtres = jwt.verify(token, 'mysecret');
    let db = await dbPromise;

    
    const collection = jwtres.role === 'owner' ? 'owners' : 'users';
    const user = await db.collection(collection).findOne({ _id: ObjectId(jwtres._id) });

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.json({ success: false, message: 'Current password is incorrect' });
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

 
    await db.collection(collection).updateOne(
      { _id: ObjectId(jwtres._id) },
      { $set: { password: hashedPassword } }
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.json({ success: false, message: 'Failed to change password' });
  }
});

app.use("/uploads", express.static("uploads"));

app.listen(PORT);