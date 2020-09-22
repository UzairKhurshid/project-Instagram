const mongoose=require('mongoose')
const postSchema=new mongoose.Schema({
    postOwner:{
        type:String,
        required:true,
        ref:'Account'
    },
    postCaption:{
        type:String
    },
    postImage:[{
        img:{
            type:String
        }
    }],
    tags:[{
        tagPersonID:{
            type:String
        }
    }],
    likes:[{
        likedByID:{
            type:String
        }
    }],
    comments:[{
        postCommentID:{
            type:String
        }
    }]
},
{
    timestamps:true
}
)


const Post=mongoose.model("Post",postSchema)
module.exports=Post