const { request } = require('express')
const mongoose=require('mongoose')
const requestSchema=new mongoose.Schema({
    requestedTo:{
        type:String
    },
    requestedBy:{
        type:String
    }
},
{
    timestamps:true
})

const Request=mongoose.model('Request',requestSchema)
module.exports=Request