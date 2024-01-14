const express = require("express")
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require("dotenv").config()
const cors = require("cors")

const {Usermodel} = require("./models/User.model")
const {connection} = require("./config/db")
const {todoRouter} = require("./routes/todo.routes")
const {Authenticate} = require("./middlewares/Authenticate")

const app = express();

app.use(cors({
    origin : "*"
}))

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Base API endpoint")
})

app.post("/signup", async (req, res) => {
    const {name, email, password, phone} = req.body;
    try{
        bcrypt.hash(password, 4, async function(err, hash) {
            await Usermodel.create({name, email, password : hash, phone})
            res.send({message : "User successfully created"})
        });
    }
   catch(err){
    console.log(err)
    res.status(500).send("Something went wrong, please try again later")
   }
})


app.get("/check", async (req, res) => {
   
    const user = await Usermodel.find()
    res.send({user});
})
 
app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const user = await Usermodel.findOne({email})
    if(!user){
        return res.send({message : "Sign up first"})
    }
    const hash = user?.password
    bcrypt.compare(password, hash, function(err, result) {
        if(result){ 
            const token = jwt.sign({ userID : user._id}, process.env.SECRET_KEY);
            res.send({message : "login successfull", token : token , user: user})
        }
        else{
            res.send({message : "login failed"})  
        }
    });
})

app.use(Authenticate)
app.use("/todos",todoRouter)

app.listen(30001, async () => {
    try{
        await connection
        console.log("connected to mongodb successfully")
    }
    catch(err){
        console.log("error connecting to DB")
        console.log(err)
    }
    console.log("listening on PORT 30001")
})