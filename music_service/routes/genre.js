var express = require('express');
const router = express.Router();
const User = require('../model/User')
const Fav = require('../model/favuser')
const mp3DB = require('../model/fileDB')
const fs = require('fs');

router.get('/allsong/:type/:genre/:img', async (req,res)=>{
    const {type,genre,img} = req.params
    var name
    var username
    var preOrNot
    var artistgen = []
    var songgen = []
    var imgdd = []
    var singfav = []
    var tf = []
    if(!req.session.user){
      name = 'undefined'
      preOrNot = false
      
    }else{
      name = req.session.user
      const checkpre = await User.findOne({name:name})
      username = checkpre.username
      preOrNot = checkpre.premiumAccount
    }
    const mp3 = await mp3DB.find({genre:genre})
    for(let i = 0;i < mp3.length;i++){
      artistgen[i] = mp3[i].namesinger
      songgen[i] = mp3[i].songname
      imgdd[i] = mp3[i].URLimage
      singfav[i] = mp3[i].path
    }
    const fav = await Fav.find({name:username})
    if(name === 'undefined'){
      for(let i = 0;i < artistgen.length;i++){
        tf[i] = false
      }
    }else{
      for(let i = 0;i<artistgen.length;i++){
        for(let j =0;j < fav.length;j++){
          tf[i] = false
          if(artistgen[i] === fav[j].artist && songgen[i] === fav[j].song){
            tf[i] = true
            break
          }
        }
      }
    }
    res.render('genreSong',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav})
  })

router.post('/search/:genre/:img/:type',async (req,res)=>{
    const {genre,img,type} = req.params
    const {search} = req.body
    if(search === ''){
      var name
      var username
      var preOrNot
      var artistgen = []
      var songgen = []
      var imgdd = []
      var singfav = []
      var tf = []
      if(!req.session.user){
        name = 'undefined'
        preOrNot = false
        
      }else{
        name = req.session.user
        const checkpre = await User.findOne({name:name})
        username = checkpre.username
        preOrNot = checkpre.premiumAccount
      }
      const mp3 = await mp3DB.find({genre:genre})
      for(let i = 0;i < mp3.length;i++){
        artistgen[i] = mp3[i].namesinger
        songgen[i] = mp3[i].songname
        imgdd[i] = mp3[i].URLimage
        sigfav[i] = mp3[i].path
      }
      const fav = await Fav.find({name:username})
      if(name === 'undefined'){
        for(let i = 0;i < artistgen.length;i++){
          tf[i] = false
        }
      }else{
        for(let i = 0;i<artistgen.length;i++){
          for(let j =0;j < fav.length;j++){
            tf[i] = false
            if(artistgen[i] === fav[j].artist && songgen[i] === fav[j].song){
              tf[i] = true
              break
            }
          }
        }
      }
      res.render('genreSong',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav})
    }else{
      var name
      var username
      var preOrNot
      var artistgen = []
      var songgen = []
      var imgdd = []
      var singfav = []
      var tf = []
      if(!req.session.user){
        name = 'undefined'
        preOrNot = false
        
      }else{
        name = req.session.user
        const checkpre = await User.findOne({name:name})
        username = checkpre.username
        preOrNot = checkpre.premiumAccount
      }
      var dogart,dogsong
      const mp3 = await mp3DB.find({genre:genre})
      for(let i =0;i <mp3.length;i++){
        if(search === mp3[i].namesinger){
          dogart = true
          break
        }else if(search === mp3[i].songname){
          dogsong = true
          break
        }else{
          continue
        }
      }
      if(dogart === 'undefined' && dogsong === 'undefined'){
        res.render('genreSong',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav})
      }else{
        if(dogart === true){
          const mp3num2 = await mp3DB.find({genre:genre,namesinger:search})
          for(let i = 0;i < mp3num2.length;i++){
            artistgen[i] = mp3num2[i].namesinger
            songgen[i] = mp3num2[i].songname
            imgdd[i] = mp3num2[i].URLimage
            singfav[i] = mp3num2[i].path
          }
          const fav = await Fav.find({name:username})
          if(name === 'undefined'){
            for(let i = 0;i < artistgen.length;i++){
              tf[i] = false
            }
          }else{
            for(let i = 0;i<artistgen.length;i++){
              for(let j =0;j < fav.length;j++){
                tf[i] = false
                if(artistgen[i] === fav[j].artist && songgen[i] === fav[j].song){
                  tf[i] = true
                  break
                }
              }
            }
          }
          res.render('genreSong',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav})
        }else{
          const mp3num2 = await mp3DB.find({genre:genre,songname:search})
          for(let i = 0;i < mp3num2.length;i++){
            artistgen[i] = mp3num2[i].namesinger
            songgen[i] = mp3num2[i].songname
            imgdd[i] = mp3num2[i].URLimage
            singfav = mp3num2[i].path
          }
          const fav = await Fav.find({name:username})
          if(name === 'undefined'){
            for(let i = 0;i < artistgen.length;i++){
              tf[i] = false
            }
          }else{
            for(let i = 0;i<artistgen.length;i++){
              for(let j =0;j < fav.length;j++){
                tf[i] = false
                if(artistgen[i] === fav[j].artist && songgen[i] === fav[j].song){
                  tf[i] = true
                  break
                }
              }
            }
          }
          res.render('genreSong',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav})
        }
      }
    }
  })

  router.get('/addFav/:name/:artist/:song/:img/:type',async(req,res)=>{
    var artistgen = []
    var songgen = []
    var tf = []
    var imgdd = []
    var singfav = []
    const {name,artist,song,img,type} = req.params
    console.log(name)
    const checkpre = await User.findOne({name:name})
    const preOrNot =checkpre.premiumAccount
    const username = checkpre.username
    const fav = new Fav({
      name:username,
      artist,
      song
    }) 
    await fav.save()
    const db = await mp3DB.findOne({namesinger:artist,songname:song})
    const genre = db.genre
    const mp3 = await mp3DB.find({genre:genre})
    for(let i = 0;i < mp3.length;i++){
      artistgen[i] = mp3[i].namesinger
      songgen[i] = mp3[i].songname
      imgdd[i] = mp3[i].URLimage
      singfav[i] = mp3[i].path
    }
    const fav2 = await Fav.find({name:username})
    if(name === 'undefined'){
      for(let i = 0;i < artistgen.length;i++){
        tf[i] = false
      }
    }else{
      for(let i = 0;i<artistgen.length;i++){
        for(let j =0;j < fav2.length;j++){
          tf[i] = false
          if(artistgen[i] === fav2[j].artist && songgen[i] === fav2[j].song){
            tf[i] = true
            break
          }
        }
      }
    }
    console.log('hello')
    res.render('genreSong',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav}) 
  })

  router.get('/unFav/:name/:artist/:song/:img/:type', async(req,res)=>{
    var artistgen = []
    var songgen = []
    var tf = []
    var imgdd =[]
    var singfav = []
    const {name,artist,song,img,type} = req.params
    const checkpre = await User.findOne({name:name})
    const preOrNot =checkpre.premiumAccount
    const username = checkpre.username
    const db = await mp3DB.findOne({namesinger:artist,songname:song})
    const genre = db.genre
    await Fav.findOneAndDelete({name:username,artist:artist,song :song})
    const mp3 = await mp3DB.find({genre:genre})
    for(let i = 0;i < mp3.length;i++){
      artistgen[i] = mp3[i].namesinger
      songgen[i] = mp3[i].songname
      imgdd[i] = mp3[i].URLimage
      singfav[i] = mp3[i].path
    }
    const fav2 = await Fav.find({name:username})
    if(name === 'undefined'){
      for(let i = 0;i < artistgen.length;i++){
        tf[i] = false
      }
    }else{
      for(let i = 0;i<artistgen.length;i++){
        for(let j =0;j < fav2.length;j++){
          tf[i] = false
          if(artistgen[i] === fav2[j].artist && songgen[i] === fav2[j].song){
            tf[i] = true
            break
          }
        }
      }
    }
    console.log('hello')
    res.render('genreSong',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav}) 
  })

  router.get('/download/:type/:genre/:img/:artist/:song', async (req,res)=>{
    const {type,genre,img,artist,song} = req.params
    var name
    var username
    var preOrNot
    var imgdd = []
    var artistgen = []
    var songgen = []
    var singfav = []
    var tf = []
    if(req.session.user === 'undefined'){
      name = 'undefined'
      preOrNot = false
      
    }else{
      name = req.session.user
      const checkpre = await User.findOne({name:name})
      preOrNot = checkpre.premiumAccount
      username = checkpre.username
    }
    const op = await mp3DB.findOne({namesinger:artist,songname:song})
    const buffer = op.videofile
    
    const mp3 = await mp3DB.find({genre:genre})
    for(let i = 0;i < mp3.length;i++){
      artistgen[i] = mp3[i].namesinger
      songgen[i] = mp3[i].songname
      imgdd[i] = mp3[i].URLimage
      singfav[i] = mp3[i].path
    }
    const fav = await Fav.find({name:username})
    if(name === 'undefined'){
      for(let i = 0;i < artistgen.length;i++){
        tf[i] = false
      }
    }else{
      for(let i = 0;i<artistgen.length;i++){
        for(let j =0;j < fav.length;j++){
          tf[i] = false
          if(artistgen[i] === fav[j].artist && songgen[i] === fav[j].song){
            tf[i] = true
            break
          }
        }
      }
    }
    console.log('hello')
    fs.writeFileSync('public/download/'+song+'.mp3', buffer)
    res.render('genreSong',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav})
  })

module.exports = router;