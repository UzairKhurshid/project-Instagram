const express=require('express')
const mongoose=require('mongoose')
const auth = require('../auth/auth')
const sharp=require('sharp')
const router=new express.Router()
const multer=require('multer')
const Account = require('../models/account')
const Post=require('../models/post')
const postComment=require('../models/postcomments')
const e = require('express')

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/octet-stream') {
        cb(null, true)
    } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
        cb(null, false)
    }
}
var upload = multer({ fileFilter:fileFilter })

router.get('/addNewPost',auth,async(req,res)=>{
    
        res.render('post/addNewPost',{
            title:"Add New Post"
        })
})

router.post('/addNewPost',upload.array('avatar',3),auth,async(req,res)=>{
    const email=req.session.email
    try{
        var buffer
        const userAcc=await Account.findUserAccountbyEmail(email)
        var post=new Post()
        var postImage=post.postImage
        post.postOwner=userAcc._id
        post.postCaption=req.body.postCaption

        var file=req.files
        
        
        
        file.forEach(async(element,i) => {
            let img=""
            buffer=await sharp(element.buffer).resize({ width: 250, height: 250 }).jpeg().toBuffer()
            img=buffer.toString('base64')
            post.postImage=post.postImage.concat({img})
            
            if(i == file.length -1){
                var postID=post._id
                await post.save()
                userAcc.posts=userAcc.posts.concat({postID})
                await userAcc.save()
                res.redirect('/addNewPost')
            }
        }); 
        
        

        
        
    }catch(e){
        console.log(e.message)
        res.redirect('/addNewPost')
    }
})


router.get('/likePost/:id',auth,async(req,res)=>{
    const postID=req.params.id
    const userEmail=req.session.email
    try{
        var flag=false
        const userAcc=await Account.findUserAccountbyEmail(userEmail)
        const post=await Post.findById({_id:mongoose.Types.ObjectId(postID)})
        //check for post existance
        if(!post){
            console.log('post not found')
            return res.redirect('/')
        }
        var postLikes=post.likes
        //check that user already liked this post or not
        postLikes.forEach((element,i) => {
            if(postLikes[i].likedByID==userAcc._id){
                console.log("like matched")
                flag=true
            }
        });
        if(flag==true){
            console.log("Already liked this post")
            return res.redirect('/')
        }
        else{
            post.likes=post.likes.concat({likedByID:userAcc._id})
            await post.save()
            console.log('post liked Successfully')
            return res.redirect('/')
        }
        
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})

router.get('/unlikePost/:id',auth,async(req,res)=>{
    const postID=req.params.id
    const userEmail=req.session.email
    try{
        var flag=false
        const userAcc=await Account.findUserAccountbyEmail(userEmail)
        const post=await Post.findById({_id:mongoose.Types.ObjectId(postID)})
        if(!post){
            return res.redirect('/')
        }
        var postLikes=post.likes
        //console.log(postLikes.length)
        
        if(postLikes.length > 0){
            postLikes.forEach(async(element,i) => {
                if(postLikes[i].likedByID==userAcc._id){
                    postLikes.splice(i,1)
                    flag=true
                }
            });
          
            if(flag==true){
                post.postLikes=postLikes
                console.log
                await post.save()
            }
        }
        
        
        console.log('post unliked Successfully')
        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})



router.get('/deletePost/:id',auth,async(req,res)=>{
    const postID=req.params.id
    const email=req.session.email
    try{
        const userAcc=await Account.findUserAccountbyEmail(email)
        let temp=userAcc.posts
        temp.forEach(async(element,i) => {
            if(element.postID == postID){
                temp.splice(i,1)
            }
        }); 
        userAcc.posts=temp
        await userAcc.save()
        await Post.findByIdAndDelete({_id:mongoose.Types.ObjectId(postID)})
        const comment=await postComment.find()
        console.log(comment)
        if(comment.length>0){
            await postComment.findByIdAndDelete({postID:postID})
        }
        

        console.log("deleted Successfully")
        res.redirect('/')
    }catch(e){{
        console.log(e.message)
        res.redirect('/')
    }}
})




router.get('/savePost/:id',auth,async(req,res)=>{
    const postID=req.params.id
    const email=req.session.email
    try{
        let flag=false
        const userAcc=await Account.findUserAccountbyEmail(email)
        let temp=userAcc.savedPosts
        if(temp.length<=0){
            userAcc.savedPosts=userAcc.savedPosts.concat({postID:postID})
                await userAcc.save()
                console.log("post saved Successfully")
                return res.redirect('/')
        }
        temp.forEach(async(element,i) => {
            if(element.postID == postID){
                flag=true                
            }
            if(i == temp.length -1){
                if(flag==true){
                    console.log('already saved')
                    res.redirect('/')
                }else{
                    userAcc.savedPosts=userAcc.savedPosts.concat({postID:postID})
                    await userAcc.save()
                    console.log("post saved Successfully")
                    res.redirect('/')
                }
            }
        });
    
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})

router.get('/unsavePost/:id',auth,async(req,res)=>{
    const postID=req.params.id
    const email=req.session.email
    try{
        let flag=false
        const userAcc=await Account.findUserAccountbyEmail(email)
        var temp=userAcc.savedPosts
        if(temp.length > 0){
            temp.forEach(async(element,i) => {
                if(temp[i].postID==postID){
                    temp.splice(i,1)
                    flag=true
                }
            });
          
            if(flag==true){
                userAcc.savedPosts=temp
                console.log
                await userAcc.save()
            }
        }

        console.log("post unsaved Successfully")
        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})



module.exports=router