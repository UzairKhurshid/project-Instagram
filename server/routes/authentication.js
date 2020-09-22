const express=require('express')
const nodemailer=require('nodemailer')
const Account=require('../models/account')
const router=new express.Router()


router.get('/login',(req,res)=>{
    if(req.session.email){
        return res.redirect('/')
    }
    res.render('authentication/login',{
        title:'login'
    })
})
router.post('/login',async(req,res)=>{
    try{
        const user=await Account.findByCredentials(req.body.username,req.body.password)
        req.session.email=user.email
         
        res.redirect('/')
    }catch(e){
        console.log(e.message)
        res.redirect('/login')
    }
})

router.get('/signup',(req,res)=>{
    if(req.session.email){
        return res.redirect('/')
    }
    res.render('authentication/signup',{
        title:'Signup'
    })
})
router.post('/signup',async(req,res)=>{
    try{
        const acc=new Account(req.body)
        acc.privacy="public"
        await acc.save()
        res.redirect('/login')
    }catch(e){
        console.log(e.message)
        res.redirect('/signup')
    }
})

router.get('/forgetPassword',async(req,res)=>{
    res.render('authentication/forgetPassword',{
        title:"Forget Password"
    })
})

router.post('/forgetPassword',async(req,res)=>{
    const userEmail=req.body.email
    try{
        const user=await Account.findUserAccountbyEmail(userEmail)
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: '',
              pass: ''
            }
          });
        
        let message = {
            from: 'uzair.finsols@gmail.com', // sender address
            to: userEmail, // list of receivers
            subject: "Recover Password", // Subject line
            text: "Your Password is :"+user.password // plain text body
            //html: "<h1>Your Password is :</h1><b>'+user.password+'</b>", // html body
        }
        let info = await transporter.sendMail(message);
        console.log('Recovery Mail sent')
        res.redirect('/login')
    }catch(e){
        console.log(e.message)
        res.redirect('/forgetPassword')
    }
})



module.exports=router