var express = require('express');
const router = express.Router();
const User = require('../model/User')
const Fav = require('../model/favuser')
const mp3DB = require('../model/fileDB')
const fs = require('fs');

router.get('/', async(req,res)=>{
    var name
    var preOrNot
    var username
    var email
    if(req.session.user === 'undefined'){
      name = 'undefined'
      username = 'undefined'
      preOrNot = false
      email = 'undefined'
    }else{
      name = req.session.user
      const checkpre = await User.findOne({name:name})
      preOrNot = checkpre.premiumAccount
      username = checkpre.username
      email = checkpre.email
    }
    const fav = await Fav.find({name:username})
    var favorite = new Array(fav.length)
    for(let i = 0;i < favorite.length;i++){
      favorite[i] = new Array(4)
    }
    for(let i =0;i < favorite.length;i++){
      favorite[i][0] = fav[i].artist
      favorite[i][1] = fav[i].song
    }
    for(let i =0;i < favorite.length;i++){
      const test = await mp3DB.findOne({namesinger: favorite[i][0]})
      favorite[i][2] = test.URLimage
      favorite[i][3] = test.path
    }
    res.render('favpage',{name,preOrNot,username,email,favorite})
  })

router.post('/search', async (req,res)=>{
    const {search} = req.body
    console.log(search)
    if(search === ''){
      var name
      var preOrNot
      var username
      var email
      if(req.session.user === 'undefined'){
        name = 'undefined'
        username = 'undefined'
        preOrNot = false
        email = 'undefined'
      }else{
        name = req.session.user
        const checkpre = await User.findOne({name:name})
        preOrNot = checkpre.premiumAccount
        username = checkpre.username
        email = checkpre.email
      }
      const fav = await Fav.find({name:username})
      var favorite = new Array(fav.length)
      for(let i = 0;i < favorite.length;i++){
        favorite[i] = new Array(4)
      }
      for(let i =0;i < favorite.length;i++){
        favorite[i][0] = fav[i].artist
        favorite[i][1] = fav[i].song
      }
      for(let i =0;i < favorite.length;i++){
        const test = await mp3DB.findOne({namesinger: favorite[i][0]})
        favorite[i][2] = test.URLimage
        favorite[i][3] = test.path
      }
      res.render('favpage',{name,preOrNot,username,email,favorite})
    }else{
      var name
      var preOrNot
      var username
      var email
      if(req.session.user === 'undefined'){
        name = 'undefined'
        username = 'undefined'
        preOrNot = false
        email = 'undefined'
      }else{
        name = req.session.user
        const checkpre = await User.findOne({name:name})
        preOrNot = checkpre.premiumAccount
        username = checkpre.username
        email = checkpre.email
      }
      const checkfav = await Fav.find({name:username})
      var dog1,dog2 
      for(let i= 0;i< checkfav.length;i++){
        if(search === checkfav[i].artist){
          dog1 = true
          break
        }else if(search === checkfav[i].song){
          dog2 = true
          break
        }else{
          continue
        }
      }
      console.log(dog1)
      if(dog1 === 'undefined' && dog2 === 'undefined'){
        var favorite = new Array(1)
        for(let i = 0;i < favorite.length;i++){
          favorite[i] = new Array(4)
        }
        res.render('favpage',{name,preOrNot,username,email,favorite})
      }else{
        if(dog1 === true){
          var pu = 0
          var numsum = 0
          console.log(pu)
          const bb = await mp3DB.find({namesinger:search})
          const dd = await Fav.find({name:username,artist:search})
          for(let i =0;i < bb.length;i++){
            for(let j=0;j < dd.length;j++){
              if(bb[i].namesinger === dd[j].artist && bb[i].songname === dd[j].song){
                numsum++
                break
              }
            }
          }
          var favorite = new Array(numsum)
          for(let i = 0;i < favorite.length;i++){
            favorite[i] = new Array(4)
          }
          for(let i =0;i < bb.length;i++){
            for(let j=0;j < dd.length;j++){
              if(bb[i].namesinger === dd[j].artist && bb[i].songname === dd[j].song){
                favorite[pu][0] = bb[i].namesinger
                favorite[pu][1] = bb[i].songname
                favorite[pu][2] = bb[i].URLimage
                favorite[pu][3] = bb[i].path
                pu++
                break
              }
            }
          }
          res.render('favpage',{name,preOrNot,username,email,favorite})
        }else{
          var pu = 0
          var numsum = 0
          const bb = await mp3DB.find({songname:search})
          const dd = await Fav.find({name:username,song:search})
          for(let i =0;i < bb.length;i++){
            for(let j=0;j < dd.length;j++){
              if(bb[i].namesinger === dd[j].artist && bb[i].songname === dd[j].song){
                numsum++
                break
              }
            }
          }
          var favorite = new Array(numsum)
          for(let i = 0;i < favorite.length;i++){
            favorite[i] = new Array(4)
          }
          for(let i =0;i < bb.length;i++){
            for(let j=0;j < dd.length;j++){
              if(bb[i].namesinger === dd[j].artist && bb[i].songname === dd[j].song){
                favorite[pu][0] = bb[i].namesinger
                favorite[pu][1] = bb[i].songname
                favorite[pu][2] = bb[i].URLimage
                favorite[pu][3] = bb[i].path
                pu++
                break
              }
            }
          }
          res.render('favpage',{name,preOrNot,username,email,favorite})
        }
      }
    }
  })

  // router.get("/download/:artist/:song",async (req, res) => {
  //   const {artist,song} = req.params;
  //   var username
  //   var email
  //   var artistfav = []
  //   var songfav = []
  //   var imgfav = []
  //   var singfav = []
  //   const name = req.session.user
  //   const checkpre = await User.findOne({name:name})
  //   const preOrNot = checkpre.premiumAccount
  //   username = checkpre.username
  //   email = checkpre.email
  //   const fav = await Fav.find({name:username})
  //   for(let i = 0;i < fav.length;i++){
  //     artistfav[i] = fav[i].artist
  //     songfav[i] = fav[i].song
  //   }
  //   for(let i =0;i < artistfav.length;i++){
  //     const test = await mp3DB.findOne({namesinger: artistfav[i]})
  //     imgfav[i] = test.URLimage
  //   }
  //   for(let i =0;i < artistfav.length;i++){
  //     const de = await mp3DB.findOne({namesinger: artistfav[i],songname:songfav[i]})
  //     singfav[i] = de.path
  //   }
  //   const db = await mp3DB.findOne({namesinger:artist,songname:song})
  //   var buffer = db.videofile
  //   fs.writeFileSync('public/download/'+song+'.mp3', buffer)
  
  //   res.render('favpage',{name,preOrNot,artistfav,songfav,username,email,imgfav,singfav})
  // })  

  router.get('/unFav/:name1/:artist/:song', async (req,res)=>{
    const {name1,artist,song} = req.params
    const check = await User.findOne({name:name1})
    const name2 = check.username
    await Fav.findOneAndDelete({name:name2,artist:artist,song:song})
    var name
    var preOrNot
    var username
    var email
    name = req.session.user
    const checkpre = await User.findOne({name:name})
    preOrNot = checkpre.premiumAccount
    username = checkpre.username
    email = checkpre.email
    const fav = await Fav.find({name:username})
      var favorite = new Array(fav.length)
      for(let i = 0;i < favorite.length;i++){
        favorite[i] = new Array(4)
      }
      for(let i =0;i < favorite.length;i++){
        favorite[i][0] = fav[i].artist
        favorite[i][1] = fav[i].song
      }
      for(let i =0;i < favorite.length;i++){
        const test = await mp3DB.findOne({namesinger: favorite[i][0]})
        favorite[i][2] = test.URLimage
        favorite[i][3] = test.path
      }
      res.render('favpage',{name,preOrNot,username,email,favorite})
  }) 
  
router.get('/sortByArtist',async (req,res) =>{
    var name
    var preOrNot
    var username
    var email
    if(req.session.user === 'undefined'){
      name = 'undefined'
      username = 'undefined'
      preOrNot = false
      email = 'undefined'
    }else{
      name = req.session.user
      const checkpre = await User.findOne({name:name})
      preOrNot = checkpre.premiumAccount
      username = checkpre.username
      email = checkpre.email
    }
    const fav = await Fav.find({name:username})
    var favorite = new Array(fav.length)
    for(let i = 0;i < favorite.length;i++){
      favorite[i] = new Array(4)
    }
    for(let i =0;i < favorite.length;i++){
      favorite[i][0] = fav[i].artist
      favorite[i][1] = fav[i].song
    }
    for(let i =0;i < favorite.length;i++){
      const test = await mp3DB.findOne({namesinger: favorite[i][0]})
      favorite[i][2] = test.URLimage
      favorite[i][3] = test.path
    }
    favorite.sort()
    res.render('favpage',{name,preOrNot,username,email,favorite})

})  

router.get('/sortBySong',async (req,res) =>{
  var name
  var preOrNot
  var username
  var email
  if(req.session.user === 'undefined'){
    name = 'undefined'
    username = 'undefined'
    preOrNot = false
    email = 'undefined'
  }else{
    name = req.session.user
    const checkpre = await User.findOne({name:name})
    preOrNot = checkpre.premiumAccount
    username = checkpre.username
    email = checkpre.email
  }
  const fav = await Fav.find({name:username})
  var favorite1 = new Array(fav.length)
  for(let i = 0;i < favorite1.length;i++){
    favorite1[i] = new Array(4)
  }
  var favorite = new Array(fav.length)
  for(let i = 0;i < favorite.length;i++){
    favorite[i] = new Array(4)
  }
  for(let i =0;i < favorite1.length;i++){
    favorite1[i][0] = fav[i].song
    favorite1[i][1] = fav[i].artist
  }
  for(let i =0;i < favorite1.length;i++){
    const test = await mp3DB.findOne({namesinger: favorite1[i][1]})
    favorite1[i][2] = test.URLimage
    favorite1[i][3] = test.path
  }
  favorite1.sort()
  for(let i =0;i < favorite.length;i++){
    favorite[i][0] = favorite1[i][1]
    favorite[i][1] = favorite1[i][0]
    favorite[i][2] = favorite1[i][2]
    favorite[i][3] = favorite1[i][3]
  }
  res.render('favpage',{name,preOrNot,username,email,favorite})

})  

module.exports = router;  