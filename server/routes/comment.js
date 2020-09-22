const express=require('express')
const mongoose=require('mongoose')
const auth = require('../auth/auth')
const router=new express.Router()
const Account = require('../models/account')
const postComment=require('../models/postcomments')
const Post=require('../models/post')
const { assign } = require('nodemailer/lib/shared')


router.get('/addNewComment/:id',auth,async(req,res)=>{
    const postID=req.params.id
        res.render('comments/addcomment',{
            title:"Add New Comment",
            postID:postID
        })
})

router.post('/addNewComment/:id',auth,async(req,res)=>{
    const email=req.session.email
    const postID=req.params.id
    try{
        const userAcc=await Account.findUserAccountbyEmail(email)
        const post=await Post.findById({_id:postID})
        const newComment=new postComment()
        newComment.commentText=req.body.commentText
        newComment.commentedByID=userAcc._id
        newComment.postID=postID
        await newComment.save()
        var postCommentID=newComment._id
        post.comments=post.comments.concat({postCommentID:postCommentID})
        await post.save()

        console.log("successfully commented")
        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('/addNewPost')
    }
})

router.post('/updateComment/:id',auth,async(req,res)=>{
    const email=req.session.email
    const commentID=req.params.commentID
    try{
        const comment=await postComment.findById({_id:commentID})
        comment.commentText=req.body.commentText
        await comment.save()

        console.log("comment successfully Updated")
        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('/addNewPost')
    }
})


router.get('/deleteComment/:id',auth,async(req,res)=>{
    const postID=req.params.id
    const commentID=req.query.commentID
    try{
        //deleteComment/5f61cc1dc6cd76518c33b02c?commentID=5f61dbc7920e245188eea423
        const post=await Post.findById({_id:mongoose.Types.ObjectId(postID)})
        
        var temp=post.comments
        temp.forEach(async(element,i) => {
            if(element.postCommentID==commentID){
                temp.splice(i,1)
            }
        });
        post.comments=temp
        await post.save()
        await postComment.findByIdAndDelete({_id:mongoose.Types.ObjectId(commentID)})

        console.log("comment successfully deleted")
        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('/addNewPost')
    }
})


router.get('/likeComment/:id',auth,async(req,res)=>{
    const commentID=req.params.id
    const userEmail=req.session.email
    try{
        var flag=false
        const userAcc=await Account.findUserAccountbyEmail(userEmail)
        const comment=await postComment.findById({_id:mongoose.Types.ObjectId(commentID)})
        //check for post existance
        if(!comment){
            console.log('Comment not found')
            return res.redirect('/')
        }
        var commentLikes=comment.likes
        //check that user already liked this post or not
        commentLikes.forEach((element,i) => {
            if(commentLikes[i].likedByID==userAcc._id){
                console.log("like matched")
                flag=true
            }
        });
        if(flag==true){
            console.log("Already liked this comment")
            return res.redirect('/')
        }
        else{
            comment.likes=comment.likes.concat({likedByID:userAcc._id})
            await comment.save()
            console.log('comment liked Successfully')
            return res.redirect('/')
        }
        
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})

router.get('/unlikeComment/:id',auth,async(req,res)=>{
    const commentID=req.params.id
    const userEmail=req.session.email
    try{
        var flag=false
        const userAcc=await Account.findUserAccountbyEmail(userEmail)
        const comment=await postComment.findById({_id:mongoose.Types.ObjectId(commentID)})
        if(!comment){
            console.log("comment not found")
            return res.redirect('/')
        }
        var commentLikes=comment.likes
        //console.log(postLikes.length)
        
        if(commentLikes.length > 0){
            commentLikes.forEach(async(element,i) => {
                if(commentLikes[i].likedByID==userAcc._id){
                    commentLikes.splice(i,1)
                    flag=true
                }
            });
          
            if(flag==true){
                comment.likes=commentLikes
                await comment.save()
            }
        }
        
        
        console.log('comment unliked Successfully')
        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})


router.get('commentReply/:id',auth,async(req,res)=>{
    const commentID=req.params.id
    const email=req.session.email
    try{
        const txt=req.body.commentRepliedText
        const comment=await postComment.findById({_id:mongoose.Types.ObjectId(commentID)})
        const userAcc=await Account.findUserAccountbyEmail(userEmail)
        comment.commentRepliesInfo=comment.commentRepliesInfo.concat({commentRepliedByID:userAcc._id,commentRepliedText:txt})
        await comment.save()

        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})

module.exports=router