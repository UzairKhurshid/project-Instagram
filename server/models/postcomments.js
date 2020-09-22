const mongoose=require('mongoose')
const postCommentsSchema=new mongoose.Schema({
    postID:{
        type:String
    },
    commentedByID:{
        type:String,
        required:true
    }, 
    commentText:{
        type:String,
        required:true
    },
    likes:[{
        LikedByID:{
            type:String
        }
    }],
    commentRepliesInfo:[{
        commentRepliedByID:{
            type:String
        },
        commentRepliedText:{
            type:String
        }
    }]
},
{
    timestamps:true
})

const postComment=mongoose.model("postComment",postCommentsSchema)
module.exports=postComment