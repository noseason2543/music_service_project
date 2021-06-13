var express = require('express');
const router = express.Router();
const User = require('../model/User')
const Fav = require('../model/favuser')
const mp3DB = require('../model/fileDB')
const fs = require('fs');

router.get('/', async (req,res)=>{
    if(!req.session.user){  
      var name = 'undefined'
      var preOrNot = false
    }else{
      var name = req.session.user
      var checkpre = await User.findOne({name:name})
      var preOrNot = checkpre.premiumAccount
      var username = checkpre.username
    }
    const mp3 = await mp3DB.find({})
    var arr = new Array(mp3.length)
    for(let i = 0;i< arr.length;i++){
      arr[i] = new Array(5)
    }
    for(let i = 0;i < mp3.length;i++){
      arr[i][0] = 0
      arr[i][1] = mp3[i].namesinger
      arr[i][2] = mp3[i].songname
      arr[i][3] = mp3[i].URLimage
      arr[i][4] = mp3[i].path
    }
    
    const favAll = await Fav.find({})
    
    for(let i=0; i <favAll.length;i++){
      for(let j =0;j < arr.length;j++){
        if(favAll[i].artist === arr[j][1] && favAll[i].song === arr[j][2]){
          arr[j][0] = arr[j][0] +1
          break;
        }
      }
    }
    arr.sort(function(a,b) {return b[0]-a[0]});
    
    var result = new Array(10)
  
    for(let i=0;i < 10;i++){
      result[i] = new Array(5)
    }
  
    for(let i =0;i<10;i++){
      result[i][0] = arr[i][0]
      result[i][1] = arr[i][1]
      result[i][2] = arr[i][2]
      result[i][3] = arr[i][3]
      result[i][4] = arr[i][4]
    }
    var tf = []
    if(name === 'undefined'){
      for(let i =0;i <10;i++){
        tf[i] = false
      }
    }else{
      const ufav = await Fav.find({name : username})
      for(let i=0;i <10;i++){
        tf[i] = false
        for(let j=0;j< ufav.length;j++){
          if(ufav[j].artist === result[i][1] && ufav[j].song === result[i][2]){
            tf[i] = true
            break
          }
        }
      }
    }
    res.render('popular',({name,preOrNot,result,tf}))
  })

  router.get('/addFav/:artist/:song', async (req,res)=>{
    const name = req.session.user
    const checkpre = await User.findOne({name : name})
    const preOrNot = checkpre.premiumAccount
    const username = checkpre.username
    const {artist,song} = req.params
    const add = new Fav({
      name:username,
      artist,
      song
    })
    await add.save()
    const mp3 = await mp3DB.find({})
    var arr = new Array(mp3.length)
    for(let i = 0;i< arr.length;i++){
      arr[i] = new Array(5)
    }
    for(let i = 0;i < mp3.length;i++){
      arr[i][0] = 0
      arr[i][1] = mp3[i].namesinger
      arr[i][2] = mp3[i].songname
      arr[i][3] = mp3[i].URLimage
      arr[i][4] = mp3[i].path
    }
    
    const favAll = await Fav.find({})
    
    for(let i=0; i <favAll.length;i++){
      for(let j =0;j < arr.length;j++){
        if(favAll[i].artist === arr[j][1] && favAll[i].song === arr[j][2]){
          arr[j][0] = arr[j][0] +1
          break;
        }
      }
    }
    arr.sort(function(a,b) {return b[0]-a[0]});
    
    var result = new Array(10)
  
    for(let i=0;i < 10;i++){
      result[i] = new Array(5)
    }
  
    for(let i =0;i<10;i++){
      result[i][0] = arr[i][0]
      result[i][1] = arr[i][1]
      result[i][2] = arr[i][2]
      result[i][3] = arr[i][3]
      result[i][4] = arr[i][4]
    }
    var tf = []
    const ufav = await Fav.find({name : username})
    for(let i=0;i <10;i++){
      tf[i] = false
      for(let j=0;j< ufav.length;j++){
        if(ufav[j].artist === result[i][1] && ufav[j].song === result[i][2]){
          tf[i] = true
          break
        }
      }
    }
    res.render('popular',({name,preOrNot,result,tf}))
  })

  router.get('/unFav/:artist/:song', async (req,res)=>{
    const name = req.session.user
    const checkpre = await User.findOne({name : name})
    const preOrNot = checkpre.premiumAccount
    const username = checkpre.username
    const {artist,song} = req.params
    await Fav.findOneAndDelete({name:username,artist:artist,song:song})
    const mp3 = await mp3DB.find({})
    var arr = new Array(mp3.length)
    for(let i = 0;i< arr.length;i++){
      arr[i] = new Array(5)
    }
    for(let i = 0;i < mp3.length;i++){
      arr[i][0] = 0
      arr[i][1] = mp3[i].namesinger
      arr[i][2] = mp3[i].songname
      arr[i][3] = mp3[i].URLimage
      arr[i][4] = mp3[i].path
    }
    
    const favAll = await Fav.find({})
    
    for(let i=0; i <favAll.length;i++){
      for(let j =0;j < arr.length;j++){
        if(favAll[i].artist === arr[j][1] && favAll[i].song === arr[j][2]){
          arr[j][0] = arr[j][0] +1
          break;
        }
      }
    }
    arr.sort(function(a,b) {return b[0]-a[0]});
    
    var result = new Array(10)
  
    for(let i=0;i < 10;i++){
      result[i] = new Array(5)
    }
  
    for(let i =0;i<10;i++){
      result[i][0] = arr[i][0]
      result[i][1] = arr[i][1]
      result[i][2] = arr[i][2]
      result[i][3] = arr[i][3]
      result[i][4] = arr[i][4]
    }
    var tf = []
    const ufav = await Fav.find({name : username})
    for(let i=0;i <10;i++){
      tf[i] = false
      for(let j=0;j< ufav.length;j++){
        if(ufav[j].artist === result[i][1] && ufav[j].song === result[i][2]){
          tf[i] = true
          break
        }
      }
    }
    res.render('popular',({name,preOrNot,result,tf}))
  }) 
  
  router.get('/download/:artist/:song', async (req,res)=>{
    const name = req.session.user
    const {artist,song} = req.params
    const checkpre = await User.findOne({name : name})
    const preOrNot = checkpre.premiumAccount
    const username = checkpre.username
    const db = await mp3DB.findOne({namesinger:artist,songname:song})
    var buffer = db.videofile
    fs.writeFileSync('public/download/'+song+'.mp3', buffer)
    const mp3 = await mp3DB.find({})
    var arr = new Array(mp3.length)
    for(let i = 0;i< arr.length;i++){
      arr[i] = new Array(5)
    }
    for(let i = 0;i < mp3.length;i++){
      arr[i][0] = 0
      arr[i][1] = mp3[i].namesinger
      arr[i][2] = mp3[i].songname
      arr[i][3] = mp3[i].URLimage
      arr[i][4] = mp3[i].path
    }
    
    const favAll = await Fav.find({})
    
    for(let i=0; i <favAll.length;i++){
      for(let j =0;j < arr.length;j++){
        if(favAll[i].artist === arr[j][1] && favAll[i].song === arr[j][2]){
          arr[j][0] = arr[j][0] +1
          break;
        }
      }
    }
    arr.sort(function(a,b) {return b[0]-a[0]});
    
    var result = new Array(10)
  
    for(let i=0;i < 10;i++){
      result[i] = new Array(5)
    }
  
    for(let i =0;i<10;i++){
      result[i][0] = arr[i][0]
      result[i][1] = arr[i][1]
      result[i][2] = arr[i][2]
      result[i][3] = arr[i][3]
      result[i][4] = arr[i][4]
    }
    var tf = []
    const ufav = await Fav.find({name : username})
    for(let i=0;i <10;i++){
      tf[i] = false
      for(let j=0;j< ufav.length;j++){
        if(ufav[j].artist === result[i][1] && ufav[j].song === result[i][2]){
          tf[i] = true
          break
        }
      }
    }
    res.render('popular',({name,preOrNot,result,tf}))
  })  

module.exports = router;