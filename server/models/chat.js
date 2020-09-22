const mongoose=require('mongoose')
const chatSchema=new mongoose.Schema({
    accID:{
        type:String,
        required:true
    },
    friendID:{
        type:String,
        required:true
    },
    message:[{
        msgText:{
            type:String
        },
        type:{
            type:String
        },
        likedBy:[{
            likedByAccID:{
                type:String
            }
        }],
        status:{
            type:String
        }
    }]
})

const Chat=mongoose.model("Chat",chatSchema)
module.exports=Chat