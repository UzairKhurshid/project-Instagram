const express=require('express')
const bcrypt=require('bcryptjs')
const sharp=require('sharp')
const auth=require('../auth/auth')
const Account=require('../models/account')
const Post=require('../models/post')
const mongoose = require('mongoose')
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

router.get('/updateProfile',auth,async(req,res)=>{
    const email=req.session.email
    try{
        const user=await Account.findUserAccountbyEmail(email)
        res.render('profile/profile',{
            title:"Profile",
            userAccount:user
        })
    }catch(e){
        console.log(e.message)
    }
})
router.post('/updateProfile',auth,async(req,res)=>{
    const ownerEmail=req.session.email
    try{
        const user=await Account.findUserAccountbyEmail(ownerEmail)
        var username=req.body.username
        var email=req.body.email
        var password=req.body.password
        const privacy=req.body.privacy

        if(username == ""){
            username=user.username
        }
        if(email==""){
            email=user.email
        }
        if(password==""){
            password=user.password
        }else if(password!=""){
            password=await bcrypt.hash(password,8)
        }
        
        await Account.updateOne({_id:user._id},{username,email,password,privacy})
        res.redirect('/updateProfile')
    }catch(e){
        console.log(e.message)
    }
})

router.post('/updateProfileImage/:id',auth,upload.single('avatar'),async(req,res)=>{
    const userID=req.params.id
    try{
        const userAcc=await Account.findById({_id:mongoose.Types.ObjectId(userID)})
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).jpeg().toBuffer()
        //console.log(buffer.toString('base64'))
        userAcc.profileImage=buffer.toString('base64')
        await userAcc.save()
        console.log("Image saved Successfully")
        res.redirect('/updateProfile')

    }catch(e){
        console.log(e.message)
    }
})

router.get('/personalAccount',auth,async(req,res)=>{
    const email=req.session.email
    try{
        let posts=[]
        const user=await Account.findUserAccountbyEmail(email)
        const username=user.username
        const followers=user.followers
        const followersCount=followers.length
        const following=user.following
        const followingCount=following.length
        const p=user.posts
        const postsCount=p.length
        const savedPosts=user.savedPosts
        const savedPostsCount=savedPosts.length
        const profileImage=user.profileImage

        console.log(username)

        if(p.length > 0){
            p.forEach(async(element,i) => {
                let eachpost=await Post.findById({_id:mongoose.Types.ObjectId(element.postID)},null,{ sort :{ createdAt : -1}})
               
                posts.push(eachpost)

                if(i == p.length -1){
                    return res.render('profile/personalAccount',{
                        title:"Profile",
                        ID:user._id,
                        followers:followers,
                        followersCount:followersCount,
                        following:following,
                        followingCount:followingCount,
                        posts:posts,
                        postsCount:postsCount,
                        savedPosts:savedPosts,
                        savedPostsCount:savedPostsCount,
                        profileImage:profileImage
                    })
                }
            });
        }
        else{
            return res.render('profile/personalAccount',{
                title:"Profile",
                ID:user._id,
                followers:followers,
                followersCount:followersCount,
                following:following,
                followingCount:followingCount,
                posts:p,
                postsCount:postsCount,
                savedPosts:savedPosts,
                savedPostsCount:savedPostsCount,
                profileImage:profileImage
            })
        }

        
    }catch(e){
        console.log(e.message)
    }
})


router.get('/followers/:id',auth,async(req,res)=>{
    const userID=req.params.id
    const email=req.session.email
    try{
        let followers=[]
        var personalAcc=false
        const user=await Account.findById({_id:mongoose.Types.ObjectId(userID)})
        const acc=await Account.findUserAccountbyEmail(email)
        if(user._id == acc._id){
            personalAcc=true
        }

        const f=user.followers
        if(f.length > 0){
            f.forEach(async(element,i) => {
                
                let followerAcc=await Account.findById({_id:mongoose.Types.ObjectId(element.accID)})
                followers.push(followerAcc)
                
                if(i == f.length -1){
                    if(personalAcc == true){
                        console.log('personal Account')
                        console.log(followers)
                    }
                    else{
                        console.log("this is not your personal account . cant check posts following,followers,post if account is not public or if your not following them ")
                        console.log(followers)
                    }
                }
            });
        }
    }catch(e){
        console.log(e.message)
    }
})



router.get('/removeFollower/:id',auth,async(req,res)=>{
    const followerID=req.params.id
    const email=req.session.email
    try{
        const userAcc=await Account.findUserAccountbyEmail(email)
        const followerAcc=await Account.findById({_id:mongoose.Types.ObjectId(followerID)})

        const f=userAcc.followers
        const followerF=followerAcc.following
        var flag=false
        var flag2=false
        

        //first remove follower from personal acc 
        if(f.length > 0){
            f.forEach(async(element,i) => {
                if(element.accID == followerID){
                    f.splice(i,1)
                    flag=true
                    console.log("removed Successfully")
                }
            });

            if(flag==true){
                userAcc.followers=f
                await userAcc.save()
            }
        }

        //also remove following from follower account
        if(followerF.length > 0){
            followerF.forEach(async(element,i) => {
                if(element.accID == userAcc._id){
                    followerF.splice(i,1)
                    flag=true
                    console.log("removed Successfully")
                }
            });

            if(flag==true){
                followerAcc.followers=followerF
                await followerAcc.save()
            }
        }        

        console.log("done")
        

        
        //console.log(userAcc.followers)

    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})





router.get('/following/:id',auth,async(req,res)=>{
    const userID=req.params.id
    const email=req.session.email
    try{
        let following=[]
        var personalAcc=false
        const user=await Account.findById({_id:mongoose.Types.ObjectId(userID)})
        const acc=await Account.findUserAccountbyEmail(email)
        if(user._id == acc._id){
            personalAcc=true
        }

        const f=user.following
        if(f.length > 0){
            f.forEach(async(element,i) => {
                
                let followingAcc=await Account.findById({_id:mongoose.Types.ObjectId(element.accID)})
                following.push(followingAcc)

                if(i == f.length -1){
                    if(personalAcc == true){
                        console.log("checking personal Account")
                        console.log(following)
                    }
                    else{
                        console.log("display on the basis of public or private account")
                        console.log(following)
                    }
                }
            });
        }
    }catch(e){
        console.log(e.message)
    }
})



router.get('/unfollow/:id',auth,async(req,res)=>{
    const followingID=req.params.id
    const email=req.session.email
    try{
        const userAcc=await Account.findUserAccountbyEmail(email)
        const followingAcc=await Account.findById({_id:mongoose.Types.ObjectId(followingID)})
        const f=userAcc.following
        const f2=followingAcc.followers
        var flag=false
        var flag2=false
        
        if(f.length > 0){
            f.forEach(async(element,i) => {
                if(element.accID == followingID){
                    f.splice(i,1)
                    flag=true
                    console.log("unfollowed Successfully")
                }
            });

            if(flag==true){
                userAcc.following=f
                await userAcc.save()
            }
        }



          //also remove follower from  account
          if(f2.length > 0){
            f2.forEach(async(element,i) => {
                if(element.accID == userAcc._id){
                    f2.splice(i,1)
                    flag2=true
                    console.log("removed Successfully")
                }
            });

            if(flag2==true){
                followingAcc.followers=f2
                await followingAcc.save()
            }
        }    

        console.log("done")
        

    }catch(e){
        console.log(e.message)
        res.redirect('/')
    }
})


module.exports=router