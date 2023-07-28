 const express = require("express")
const Question = require("../schemas/Questions")
const router = express.Router()
const { dbUrl } = require('../common/dbconfig')
const mongoose = require('mongoose')
mongoose.connect(dbUrl)

router.patch('/post/:id', async(req,res)=>{
    const {id: _id} = req.params;
    const{noOfAnswers,answerBody,userAnswered,userId}=req.body
    if(!mongoose.Types.ObjectId.isValid(_id)){
        return res.status(404).send("question unAvailable...")
    }
    updateNoOfQuestions(_id,noOfAnswers)
    try {
        const UpdatedQuestions = await Question.findByIdAndUpdate(_id,{$addToSet:{'answer':[{answerBody,userAnswered,userId }]}})
        res.status(200).json(UpdatedQuestions)
    } catch (error) {
        res.status(400).json(error)
    }

})
const updateNoOfQuestions = async(_id,noOfAnswers)=>{
    try {
        await Question.findByIdAndUpdate(_id,{$set:{'noOfAnswers':noOfAnswers}})
    } catch (error) {
        console.log(error)
    }
}


router.patch('/delete/:id',async(req,res)=>{
const {id:_id}=req.params;
const {answerId,noOfAnswers} = req.body

if(!mongoose.Types.ObjectId.isValid(_id)){
    return res.status(404).send("Question unAvailable...")
}
if(!mongoose.Types.ObjectId.isValid(answerId)){
    return res.status(404).send("Answer unAvailable...")
}
updateNoOfQuestions(_id,noOfAnswers)

try {
    await Question.updateOne(
        {_id},
        {$pull: {'answer':{_id:answerId} }}
    )
    res.status(200).json({message:"Sucessfully deleted..."})
} catch (error) {
   res.status(405).json(error)
}
})

module.exports = router;