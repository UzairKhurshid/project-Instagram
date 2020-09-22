const mongoose=require('mongoose')
const storySchema=new mongoose.Schema({
    ownerID:{
        type:String,
        required:true
    },
    storyImage:{
        type:String,
        required:true
    },
    reacts:[{
        reactedBy:{
            type:String
        }
    }],
    replys:[{
        repliedBy:{
            type:String
        },
        repliedText:{
            type:String
        }
    }],
    viewedBy:[{
        viewedByID:{
            type:String
        }
    }]
},
{
    timestamps:true
}
)

const Story=mongoose.model("Story",storySchema)
module.exports=Story