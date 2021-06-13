var express = require('express');
var router = express.Router();
const User = require('../model/User')
const Fav = require('../model/favuser')
const mp3DB = require('../model/fileDB')
var bodyParser = require('body-parser')
var arr =[]
router.use(bodyParser.urlencoded({extended:true}))
// const mongoose = require('mongoose')
// const Schema = mongoose.Schema

//mongo IMage and video zone.
const mongodb = require('mongodb')
const fs = require('fs');
const { findOne } = require('../model/User');
const mongoClient = mongodb.MongoClient
const binary = mongodb.Binary

router.get("/download/:artist/:song",async (req, res) => {
  const {artist,song} = req.params;
  const name = req.session.user
  
  const checkpre = await User.findOne({name:name})
  const preOrNot = checkpre.premiumAccount
  const db = await mp3DB.findOne({namesinger:artist,songname:song})
  const detail = db.lyrics
  const artimg = db.URLimage
  var buffer = db.videofile
  fs.writeFileSync('public/download/'+song+'.mp3', buffer)
  var genre1 = db.genre
  console.log(genre1)
  console.log(song)
  
  res.download('public/video/luss3.mp3','dqwdq.mp3')
  res.render('lyrics',{name,preOrNot,detail,artimg,bl,genre1,artist,song})
  // res.render('lyrics',{song,genre1,name,preOrNot,detail,artimg,artist,bl})
})

router.post('/search',async (req,res)=>{
  const {search} = req.body;
  if(req.session.user){
    var name = req.session.user;
    var checkpre = await User.findOne({name:name})
    var preOrNot = checkpre.premiumAccount
  }else{
    var name = 'undefined';
    var preOrNot = false
  }
  getArtist(search,name,preOrNot,res)
})

function getArtist(songname,name,preOrNot,res){
  const dd = songname;
  mongoClient.connect('mongodb://localhost:27017',{useNewUrlParser: true},(err, client)=>{
    if (err) {
      return err
  }else{
    let db = client.db('test')
    let collection = db.collection('files')
    collection.find({}).toArray((err, doc)=>{
      if (err) {
        console.log('err in finding doc:', err)
    }else{ 
      var artist1 = []
      var URLimage1 = []
      var genre = []
      var songarr = new Array(doc.length)
          for(let j =0 ;j <songarr.length;j++){
            songarr[j] = new Array(2)
          }
      for(let i =0;i<doc.length;i++){
        let d = 0
        if(dd === doc[i].namesinger){
          if(artist1.indexOf(doc[i].namesinger) === -1){
            artist1.push(doc[i].namesinger)
            URLimage1.push(doc[i].URLimage)
            genre.push(doc[i].genre)
            songarr[d][0] = 'notfound'
            songarr[d][1] = 'notfound'
            d++
          } 
        }else if(dd === doc[i].songname){
          artist1.push(doc[i].namesinger)
          URLimage1.push(doc[i].URLimage)
          genre.push(doc[i].genre)
          songarr[d][0] = doc[i].namesinger
          songarr[d][1] = doc[i].songname

          d++
        }else{
          continue;
        }
      }
      if(artist1.length === 0){
        artist1.push('notfound')
        URLimage1.push('#')
        genre.push("notfound")
        songarr[0][0] = 'notfound'
        songarr[0][1] = 'notfound'
      }
      console.log(artist1)
      console.log(songarr)
      res.render('searchAS',{artist1,URLimage1,name,preOrNot,songarr,genre})
    }
    })
  }
  })
}

//end of mongo image and video zone




const isLoggedIn = (req, res, next) => {
  // req.session.name อะไรก็ได้
  if (!req.session.user) {
    return res.render('home',{name:'undefined'})
  }else{
    next()
  }
  
}

/* GET home page. */
router.get('/',isLoggedIn , async (req, res, next)=> {
  // req.session.name อะไรก็ได้
  if(req.session.user ==='admin'){
    res.render('backEnd')
  }
  const test = await User.findOne({name:req.session.user})
  req.session.pre = test.premiumAccount
  console.log(req.session.pre)
  res.render('home',{name:req.session.user,preOrNot:test.premiumAccount});
});

router.get('/premium',async (req,res)=>{
  console.log(req.session.user)
  const checkpre = await User.findOne({name:req.session.user})
  console.log(checkpre)
  const preOrNot = checkpre.premiumAccount
  console.log(preOrNot)
  res.render('premium',{name:req.session.user,preOrNot})
})

// router.get('/',(req,res,next)=>{
//   res.render('home')
// })

router.get('/getpremium',async (req,res)=>{
  const updated = {
    $set:{
      premiumAccount:true
    }
  }
  await User.findOneAndUpdate({name:req.session.user},updated)
  const preeiei = await User.findOne({name:req.session.user})
  req.session.pre = true;
  res.render('premium',{name:req.session.user,preOrNot:preeiei.premiumAccount})
})

router.get('/goprofile/:name',async (req,res)=>{
  const {name} = req.params
  const checkpre = await User.findOne({name:name})
  const preOrNot = checkpre.premiumAccount
  const email = checkpre.email
  const username = checkpre.username
  const createdAt = checkpre.createdAt
  const fo = await Fav.find({name : username})
  const follow = fo.length
  var ar = []
  var aart = 0
  for(let i=0;i < fo.length;i++){
    if(ar.indexOf(fo[i].artist) === -1){
      ar.push(fo[i].artist)
      aart++
    }
  }
  res.render('profile',{name,preOrNot,email,username,createdAt,aart,follow}) 
})

router.get('/edit/:name',async (req,res)=>{
  const {name} = req.params
  const checkpre = await User.findOne({name:name})
  const preOrNot = checkpre.premiumAccount
  const email = checkpre.email
  const username = checkpre.username
  const createdAt = checkpre.createdAt
  const fo = await Fav.find({name : username})
  const follow = fo.length
  var ar = []
  var aart = 0
  for(let i=0;i < fo.length;i++){
    if(ar.indexOf(fo[i].artist) === -1){
      ar.push(fo[i].artist)
      aart++
    }
  }
  res.render('edit',{name,preOrNot,email,username,follow,aart,createdAt})
})

router.post('/confirmedit', async (req,res)=>{
  const {editname,email1} = req.body
  const updated = {
    $set:{
      name : editname,
      email : email1
    }
  }
  await User.findOneAndUpdate({name:req.session.user},updated)
  req.session.user = editname
  const check = await User.findOne({name: req.session.user})
  const preOrNot = check.premiumAccount
  const email = check.email
  const username = check.username
  const createdAt = check.createdAt
  const name = check.name
  const fo = await Fav.find({name : username})
  const follow = fo.length
  var ar = []
  var aart = 0
  for(let i=0;i < fo.length;i++){
    if(ar.indexOf(fo[i].artist) === -1){
      ar.push(fo[i].artist)
      aart++
    }
  }
  res.render('profile',{name,preOrNot,email,username,createdAt,aart,follow})
})

router.get('/cancelpremium',async (req,res)=>{
  const updated = {
    $set:{
      premiumAccount:false
    }
  }
  await User.findOneAndUpdate({name:req.session.user},updated)
  const preeiei = await User.findOne({name:req.session.user})
  console.log(preeiei)
  req.session.pre = false;
  res.render('premium',{name:req.session.user,preOrNot:preeiei.premiumAccount})
})

router.get('/login',(req,res)=>{
    res.render('login',{resultText:''});
  
})

router.get('/logout',(req,res)=>{
  req.session.user = false
  return res.render('home',{name:'undefined'})
})

router.get('/register',(req,res)=>{
  res.render('register',{regisResult: ''})
})

module.exports = router;
