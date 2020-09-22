require('./db/mongoose')
const express=require('express')
const hbs=require('hbs')
const path=require('path')
const session=require('express-session')
const MongoDBStore=require('connect-mongodb-session')(session)
const bodyParser = require('body-parser')
//const multer=require('multer')
const authenticationRouter=require('./routes/authentication')
const dashboardRouter=require('./routes/dashboard')
const profileRouter=require('./routes/profile')
const postRouter=require('./routes/post')
const commentRouter=require('./routes/comment')
const storyRouter=require('./routes/story')
const chatRouter=require('./routes/chat')


const app=express()


const publicDirectory=path.join(__dirname,'../public')
const viewsDirectory=path.join(__dirname,'../views')
const store = new MongoDBStore({
    uri: 'mongodb+srv://fypbackup:fypbackup123@cluster0-qedl3.mongodb.net/projInstagram?retryWrites=true&w=majority',
    collection: 'mySessions'
});

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/octet-stream') {
//         cb(null, true)
//     } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
//         cb(null, false)
//     }
// }

app.set('views', viewsDirectory)
app.set('view engine', 'hbs');
 

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'mySecretKeyToHashMySessionID', resave: false, saveUninitialized: false, store: store }))
app.use(express.static(publicDirectory))
//app.use(multer({ fileFilter: fileFilter }).single('avatar'))


app.use(authenticationRouter)
app.use(dashboardRouter)
app.use(profileRouter)
app.use(postRouter)
app.use(commentRouter)
app.use(storyRouter)
app.use(chatRouter)



//this is express application-level middleware which will run for every request that isnt defined 
app.get('*',(req,res)=>{
    res.render('404',{
        title:'Page Not Found'
    })
})

app.listen(3000,()=>{
    console.log("server is up and running")
})