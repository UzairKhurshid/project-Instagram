const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const accSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profileImage:{
        type:String
    },
    privacy:{
        type:String,
        required:true
    },
    followers:[{
        accID:{
            type:String,
        }
    }],
    following:[{
        accID:{
            type:String,
        }
    }],
    savedPosts:[{
        postID:{
            type:String,
            ref:'Post' 
        }
    }],
    stories:[{
        storyID:{
            type:String,
            ref:'Story'
        }
    }],
    posts:[{
        postID:{
            type:String
        }
    }]
})


accSchema.virtual('allPostsOfThisAccount',{
    ref:'Post',
    localField:'_id',
    foreignField:'postOwner' 
 })
 

//statics Method on schema
accSchema.statics.findByCredentials=async(username,password)=>{
    const account=await Account.findOne({username})
    if(!account){
        throw new Error('Account Not Found , Invalid Username')
    }
    const checkPassword=await bcrypt.compare(password,account.password)
    if(!checkPassword){
        throw new Error('Invalid Password')
    }
    return account
}

accSchema.statics.findUserAccountbyEmail=async(email)=>{
    const account=await Account.findOne({email})
    if(!account){
        throw new Error('Account with this email does not Exist.')
    }
    return account
}

accSchema.statics.findUserAccountbyUsername=async(username)=>{
    const account=await Account.findOne({username})
    if(!account){
        throw new Error('Account Not Found.')
    }
    return account
}

//pre save Application level mongoose middleware
accSchema.pre('save',async function (next) {
    const account=this
    if(account.isModified('password')){
        account.password=await bcrypt.hash(account.password,8)
    }
    next()
})


const Account=mongoose.model('Account',accSchema)
module.exports=Account