const express=require('express')
const mongoose=require('mongoose')
const auth = require('../auth/auth')
const sharp=require('sharp')
const router=new express.Router()
const multer=require('multer')
const Account = require('../models/account')
const Story=require('../models/stories')

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/octet-stream') {
        cb(null, true)
    } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
        cb(null, false)
    }
}
var upload = multer({ fileFilter:fileFilter })


router.get('/viewStory/:id',auth,async(req,res)=>{
    const storyID=req.params.id
    const email=req.session.email
    try{
        let flag=false
        const userAcc=await Account.findUserAccountbyEmail(email)
        const story=await Story.findById({_id:mongoose.Types.ObjectId(storyID)})
        var temp=story.viewedBy
        let arr=[]
        if(story.ownerID ==  userAcc._id){
            return res.redirect('/')
        }
        temp.forEach(async(element,i) => {
            if(element.viewedByID == userAcc._id){
                flag=true
            } 
        });
        if(flag==true){
            console.log("already Viewed by you")
            return res.redirect('/')
        }
        else{
            let obj={
                viewedByID:userAcc._id
            }
            temp.push(obj)
            story.viewedBy=temp
            console.log(story)
            //console.log(story.count)
            await story.save()
            return res.redirect('/')
        }
        
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})



router.get('/addNewStory',auth,async(req,res)=>{
    
        res.render('story/addStory',{
            title:"Add New Story"
        })
}) 

router.post('/addNewStory',upload.single('avatar'),auth,async(req,res)=>{
    const email=req.session.email
    try{
        
        const userAcc=await Account.findUserAccountbyEmail(email)
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).jpeg().toBuffer()
        //console.log(buffer.toString('base64'))
        var story=new Story()
        story.ownerID=userAcc._id
        story.storyImage=buffer.toString('base64')
         
        await story.save()
        var storyID=story._id
        userAcc.stories=userAcc.stories.concat({storyID})
        userAcc.save()

        console.log("Story saved Successfully")
        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})


router.get('/likeStory/:id',auth,async(req,res)=>{
    const storyID=req.params.id
    const userEmail=req.session.email
    try{
        var flag=false
        const userAcc=await Account.findUserAccountbyEmail(userEmail)
        const story=await Story.findById({_id:mongoose.Types.ObjectId(storyID)})
        //check for post existance
        if(!story){
            console.log('Story not found')
            return res.redirect('/')
        }
        var temp=story.reacts
        //check that user already liked this post or not
        temp.forEach((element,i) => {
            if(temp[i].reactedBy==userAcc._id){
                console.log("like matched")
                flag=true
            }
        });
        if(flag==true){
            console.log("Already liked this Story")
            return res.redirect('/')
        }
        else{
            story.reacts=story.reacts.concat({reactedBy:userAcc._id})
            await story.save()
            console.log('Story liked Successfully')
            return res.redirect('/')
        }
        
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})



router.get('/replyStory/:id',auth,async(req,res)=>{
    const storyID=req.params.id
    const email=req.session.email
    try{
        const userAcc=await Account.findUserAccountbyEmail(email)
        const story=await Story.findById({_id:mongoose.Types.ObjectId(storyID)})
        var temp=story.replys
        let arr=[]
        
        
            let obj={
                repliedBy:userAcc._id,
                repliedText:"replied text"
                //change this when you have real input from req.body
                // repliedText:req.body.text
            }
            temp.push(obj)
            story.replys=temp
            console.log(story)
            await story.save()
            return res.redirect('/')
        
        
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})




router.get('/deleteStory/:id',auth,async(req,res)=>{
    const storyID=req.params.id
    const email=req.session.email
    try{
        await Story.findByIdAndDelete({_id:mongoose.Types.ObjectId(storyID)})
        const userAcc=await Account.findUserAccountbyEmail(email)
        var temp=userAcc.stories
        console.log(temp.length)
        temp.forEach(async(element,i) => {
            console.log(i)
            if(element.storyID == storyID){
                temp.splice(i,1)
                userAcc.stories=temp
                await userAcc.save()
                console.log('deleted successfully')
                return res.redirect('/')
            }
        });

        
    }catch(e){{
        console.log(e.message)
        res.redirect('/')
    }}
})




module.exports=router