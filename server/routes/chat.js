const express=require('express')
const mongoose=require('mongoose')
const auth=require('../auth/auth')
const Account=require('../models/account')
const Chat=require('../models/chat')
const sharp=require('sharp')
const router=new express.Router()
const multer=require('multer')
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/octet-stream') {
        cb(null, true)
    } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
        cb(null, false)
    }
}
var upload = multer({ fileFilter:fileFilter })

 
//tested
router.get('/chats',auth,async(req,res)=>{
    const email=req.session.email
    try{
        const acc=await Account.findUserAccountbyEmail(email)
        const chat=await Chat.find({accID:acc._id})
        var allChats=[]
        if(chat.length <= 0){
        }else{
            chat.forEach(async(element,i) => {
                let friendAcc=await Account.findById({_id:mongoose.Types.ObjectId(element.friendID)})
                let obj={
                    friendAccID:friendAcc._id,
                    username:friendAcc.username
                }
                allChats.push(obj)
                if(i == chat.length -1){
                    if(allChats.length <= 0){
                        return res.render('chat/chat',{
                            title:"chats"
                        })
                    }
                    return res.render('chat/chat',{
                        title:"chats",
                        chats:allChats
                    })
                }   
            });
        }
        
    }catch(e){
        console.log(e.message)
    }
})

//tested
router.get('/sendMessage/:id',auth,async(req,res)=>{
    const id=req.params.id
    const email=req.session.email
    try{
        const userAcc=await Account.findUserAccountbyEmail(email)
        const friendAcc=await Account.findById({_id:mongoose.Types.ObjectId(id)})
        const chat=await Chat.findOne({friendID:friendAcc._id,accID:userAcc._id})
        var allChats=[]
        if(chat == null || chat == undefined){
            return res.render('chat/sendMessage',{
                title:"chat",
                friendAccID:id
            })
        }else{
            var temp=chat.message
            temp.forEach(async(element,i) => {
                let obj={
                    msgText:element.msgText,
                    type:element.type,
                    status:element.status
                }
                allChats.push(obj)
            });
            console.log(allChats)
            return res.render('chat/sendMessage',{
            title:"chat",
            friendAccID:id
        })
    }
    }catch(e){
        console.log(e.message)
    }
})



//tested
router.post('/sendMessage/:id',upload.single('avatar'),auth,async(req,res)=>{
    const email=req.session.email
    const accID=req.params.id
    try{
        const ownerAcc=await Account.findUserAccountbyEmail(email)
        const friendAcc=await Account.findById({_id:mongoose.Types.ObjectId(accID)})
        const chat=await Chat.findOne({accID:ownerAcc._id})

        if( chat==null || chat==undefined){
            var newChat=new Chat()
            newChat.accID=ownerAcc._id
            newChat.friendID=friendAcc._id
            var temp=newChat.message;
            if(req.file){
                const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).jpeg().toBuffer()
                var tempImg=buffer.toString('base64')
                let obj = {
                    msgText:tempImg,
                    type: "image",
                    status:"unread"
                }
                temp.push(obj)
                newChat.message=temp
                await newChat.save()
                console.log("New Chat : Message Sent")
                res.redirect('/')
            }
            else{
                let obj = {
                    msgText:req.body.msgText,
                    type: "message",
                    status:"unread"
                }

                temp.push(obj)
                newChat.message=temp
                await newChat.save()
                console.log("New Chat : Message Sent")
                res.redirect('/')
            }
        }
        else{

            var temp=chat.message
            if(req.file){
                const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).jpeg().toBuffer()
                var tempImg=buffer.toString('base64')
                let obj = {
                    msgText:tempImg,
                    type: "image",
                    status:"unread"
                }
                temp.push(obj)
                chat.message=chat.message.concat(temp)
                await chat.save()
                console.log(" Message Sent")
                res.redirect('/')
            }
            else{
                let obj = {
                    msgText:req.body.msgText,
                    type: "message",
                    status:"unread"
                }

                temp.push(obj)
                chat.message=chat.message.concat(temp)
                await chat.save()
                console.log(" Message Sent")
                res.redirect('/')
            }
        }
        
    }catch(e){
        console.log(e.message)
    }
})


//tested
router.get('/likeMessage/:id',auth,async(req,res)=>{
    // http://localhost:3000/unlikeMessage/5f61b01785c47950806f4c1e?messageID=5f61b01785c47950806f4c1f
    const chatID=req.params.id
    let messageID
    if(req.query.messageID){
        messageID=req.query.messageID  
    }else{
        res.send("please pass your message id")
    }
    const email=req.session.email
    try{
        const chat = await Chat.findById({_id:mongoose.Types.ObjectId(chatID)})
        const userAcc=await Account.findUserAccountbyEmail(email)
        var flag=false
        var temp=chat.message
        temp.forEach(async(element,i) => {
            if(element._id == messageID){
                var templikes=element.likedBy
                if(templikes.length == 0 ){
                    console.log("undef")
                    let obj={
                        likedByAccID:userAcc._id
                    }
                    templikes.push(obj)
                }
                else{
                    console.log("def")
                    templikes.forEach(async(e,j) => {
                        if(e.likedByAccID == userAcc._id){
                            console.log("already Liked this message")
                            flag=true
                        }
                        if(j == templikes.length -1){
                            if(flag==false){
                                let obj={
                                    likedByAccID:userAcc._id
                                }
                                templikes.push(obj)
                            }
                        }
                    });
                }
            }   
            if(i == temp.length -1){
                //console.log(temp)
                temp.likedBy=templikes
                chat.message=temp
                await chat.save()
                console.log("liked")    
            }
        });
        
        res.send("done")

    }catch(e){
        console.log(e.message)
    }
})



//tested
router.get('/unlikeMessage/:id',auth,async(req,res)=>{
    // http://localhost:3000/unlikeMessage/5f61b01785c47950806f4c1e?messageID=5f61b01785c47950806f4c1f
    const chatID=req.params.id
    let messageID
    if(req.query.messageID){
        messageID=req.query.messageID  
    }else{
        res.send("please pass your message id")
    }
    const email=req.session.email
    try{
        const chat = await Chat.findById({_id:mongoose.Types.ObjectId(chatID)})
        const userAcc=await Account.findUserAccountbyEmail(email)
        var flag=false
        var temp=chat.message
        temp.forEach(async(element,i) => {
            if(element._id == messageID){
                var templikes=element.likedBy
                if(templikes.length == 0 ){
                    console.log("no like found")
                    //no like exists
                }
                else{
                    console.log("def")
                    templikes.forEach(async(e,j) => {
                        if(e.likedByAccID == userAcc._id){
                            templikes.splice(j,1)
                        }
                        if(j == templikes.length -1){
                            if(flag==false){
                                console.log("no like found related to this account")
                                //no like found related to this account
                            }
                        }
                    });
                }
            }   
            if(i == temp.length -1){
                //console.log(temp)
                temp.likedBy=templikes
                chat.message=temp
                await chat.save()
                console.log("unliked")    
            }
        });
        
        res.send("done")

    }catch(e){
        console.log(e.message)
    }
})






module.exports=router