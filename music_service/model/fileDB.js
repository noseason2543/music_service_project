const mongoose = require('mongoose')
const Schema = mongoose.Schema
const newSchema = new Schema({
    namesinger: String, 
    songname : String,
    genre : String,
    URLimage: String,
    videofile: Buffer,
    path: String,
    lyrics:String
})

const mp3DB = mongoose.model('files',newSchema)
module.exports = mp3DB