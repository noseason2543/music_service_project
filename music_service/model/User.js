const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
  name:{type: String,unique: true},
  username: {
    type: String,
    unique: true
  },
  password: String,
  email: String,
  premiumAccount: Boolean
},{
  timestamps:true,versionKey:false
})
const UserModel = mongoose.model('User', userSchema)
module.exports = UserModel