const User = require("../schemas/auth")
const express= require("express")
const  {auth} = require('../common/auth')
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { dbUrl } = require('../common/dbconfig')
const mongoose = require('mongoose')
mongoose.connect(dbUrl)



router.get('/', function(req, res, next) {
    res.render('index', { title: 'Stack Overflow App' });
  });


//Signup

router.post('/signup', async(req,res)=>{
  const {name,email,password} = req.body
  try {
     const existingUser = await User.findOne({email})
     if(existingUser){
        return res.status(404).json({message:"User already exists"})
     }

    const hashedPassword = await bcrypt.hash(password,12)

    const newUser = await User.create({name,email,password:hashedPassword})

    const token = jwt.sign({email:newUser.email, id:newUser._id},"test", { expiresIn: '1h'});

    res.status(200).json({result:newUser,token})

  } catch (error) {
    res.status(500).json("Something went wrong")
  }
});

//Login

router.post('/login', async(req,res)=>{
    const {email,password} = req.body
    console.log(req.body)
    try {
        const existingUser = await User.findOne({email})
        if(!existingUser){
           return res.status(404).json({message:"User don't exists"})
        }

        const isPasswordCrt = await bcrypt.compare(password,existingUser.password)
        if(!isPasswordCrt){
            return res.status(400).json({message:"Invalid credentials"})
        }
        const token = jwt.sign({email:existingUser.email, id:existingUser._id},"test", { expiresIn: '1h'});

        res.status(200).json({result:existingUser,token})
        
    } catch (error) {
        res.status(500).json("Someting went wrong...")
        
    }
    
});

router.get('/getAllUsers', async(req,res)=>{
    try {
        const allUsers = await User.find();
        const allUserDetails = []
        allUsers.forEach(users=>{
            allUserDetails.push({_id: users._id, name: users.name, about:users.about, tags: users.tags, joinedOn: users.joinedOn})
        })
        console.log(allUserDetails)
        res.status(200).json(allUserDetails)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
});

router.patch('/update/:id',auth, async(req,res)=>{
   const {id:_id} = req.params;
   const {name,about,tags} = req.body;

   if(!mongoose.Types.ObjectId.isValid(_id)){
    return res.status(404).send("question unAvailable...")
}
try {
    const updatedProfile = await User.findByIdAndUpdate(_id, {$set: {'name': name, 'about': about, 'tags': tags}},{new:true})
    res.status(200).json(updatedProfile)
} catch (error) {
    res.status(405).json({message: error.message})
}
});


module.exports = router