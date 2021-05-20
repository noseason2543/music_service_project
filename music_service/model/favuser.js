const mongoose = require('mongoose')
const Schema = mongoose.Schema
const playlist = new Schema({
    name : String,
    artist : String,
    song : String
},{
    timestamps:true,versionKey:false
  })
const favModel = mongoose.model('favorite',playlist)
module.exports = favModel