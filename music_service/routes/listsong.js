var express = require('express');
const router = express.Router();
const User = require('../model/User')
const Fav = require('../model/favuser')
const mp3DB = require('../model/fileDB')
const fs = require('fs');

const mongodb = require('mongodb')
const { findOne } = require('../model/User');
const mongoClient = mongodb.MongoClient
const binary = mongodb.Binary

router.get('/find/:artist',async (req,res)=>{
    var r1 = []
    var j
    var checkfav
    var tf = []
    const {artist} = req.params
    console.log(artist)
    if(req.session.user){
      var name2 = req.session.user;
      var checkpre2 = await User.findOne({name:name2})
      var preOrNot2 = checkpre2.premiumAccount
      var username = checkpre2.username
      j = await mp3DB.find({namesinger:artist})
      for(let i=0;i< j.length;i++){
        r1[i] = j[i].songname
      }
      r1.sort()
      checkfav = await Fav.find({name:username,artist:artist})
      for(let i = 0;i < r1.length;i++){
        for(let j =0;j < checkfav.length ;j++){
          tf[i] = false
          if(r1[i] === checkfav[j].song){
            tf[i] = true
            break;
          }
        }
      }
      console.log(tf)
  
    }else{
      var name2 = 'undefined';
      var preOrNot2 = false
      j = await mp3DB.find({namesinger:artist})
      for(let i=0;i< j.length;i++){
        r1[i] = j[i].songname
      }
      r1.sort()
      checkfav = await Fav.find({name:name2,artist:artist})
      for(let i = 0;i < r1.length;i++){
        for(let j =0;j < checkfav.length ;j++){
          tf[i] = false
          if(r1[i] === checkfav[j].song){
            tf[i] = true
            continue;
          }
        }
      }
    }
    getSongList(artist,name2,preOrNot2,tf,res)
  })

  router.post('/search/:artist',async (req,res)=>{
    var artistDB,name2,preOrNot2,artistimage,genre
    var arrsong2 = []
    var tf = []
    var singfav = []
    const {artist} = req.params
    const {search} = req.body
    const check = await mp3DB.find({namesinger:artist})
    genre = check[0].genre
    if(!req.session.user){
      name2 = 'undefined'
      preOrNot2 = false
      if(search === artist){
        artistDB = artist
        const mp3 = await mp3DB.find({namesinger:artist})
        for(let i=0;i <mp3.length;i++){
          artistimage = mp3[i].URLimage
          arrsong2[i] = mp3[i].songname
          singfav[i] = mp3[i].path
        }
        for(let i=0;i <arrsong2.length;i++){
          tf[i] = false
        }
        res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
      }else if(search === ''){
        artistDB = artist
        const mp3 = await mp3DB.find({namesinger:artist})
        for(let i=0;i <mp3.length;i++){
          artistimage = mp3[i].URLimage
          arrsong2[i] = mp3[i].songname
          singfav[i] = mp3[i].path
        }
        for(let i=0;i <arrsong2.length;i++){
          tf[i] = false
        }
        res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
      }else{
        artistDB = artist
        const mp32 = await mp3DB.find({namesinger:artist})
        const mp3 = await mp3DB.find({songname:search})
        for(let i=0;i <mp3.length;i++){
          artistimage = mp3[i].URLimage
          arrsong2[i] = mp3[i].songname
          singfav[i] = mp3[i].path
        }
        artistimage = mp32[0].URLimage
        for(let i=0;i <arrsong2.length;i++){
          tf[i] = false
        }
        res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
      }
    }else{
      name2 = req.session.user
      const checkpre = await User.findOne({name: req.session.user})
      const username = checkpre.username
      preOrNot2 = checkpre.premiumAccount
      if(search === artist){
        artistDB = artist
        const mp3 = await mp3DB.find({namesinger:artist})
        for(let i=0;i <mp3.length;i++){
          artistimage = mp3[i].URLimage
          arrsong2[i] = mp3[i].songname
          singfav[i] = mp3[i].path
        }
        const use = await Fav.find({name : username})
        for(let i=0;i <arrsong2.length;i++){
          tf[i] = false
          for(let j=0 ;j < use.length;j++){
            if(artistDB === use[j].artist && arrsong2[i] === use[j].song){
              tf[i] = true
              break
            }
          }
        }
        res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
      }else if(search === ''){
        artistDB = artist
        const mp3 = await mp3DB.find({namesinger:artist})
        for(let i=0;i <mp3.length;i++){
          artistimage = mp3[i].URLimage
          arrsong2[i] = mp3[i].songname
          singfav[i] = mp3[i].path
        }
        const use = await Fav.find({name : username})
        for(let i=0;i <arrsong2.length;i++){
          tf[i] = false
          for(let j=0 ;j < use.length;j++){
            if(artistDB === use[j].artist && arrsong2[i] === use[j].song){
              tf[i] = true
              break
            }
          }
        }
        res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
      }else{
        artistDB = artist
        const mp32 = await mp3DB.find({namesinger:artist})
        const mp3 = await mp3DB.find({songname:search})
        for(let i=0;i <mp3.length;i++){
          artistimage = mp3[i].URLimage
          arrsong2[i] = mp3[i].songname
          singfav[i] = mp3[i].path
        }
        artistimage = mp32[0].URLimage
        const use = await Fav.find({name : username})
        for(let i=0;i <arrsong2.length;i++){
          tf[i] = false
          for(let j=0 ;j < use.length;j++){
            if(artistDB === use[j].artist && arrsong2[i] === use[j].song){
              tf[i] = true
              break
            }
          }
        }
        res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
      }
    } 
  })

  router.get('/addFav/:artistDB/:song',async (req,res)=>{
    var r1 = []
    var jj
    var arrsong2 = []
    var checkfav
    var singfav = []
    var tf = []
    const {artistDB,song} = req.params
    const name2 = req.session.user
    const checkpre = await User.findOne({name:name2})
    const username = checkpre.username
    const artist = artistDB
    const preOrNot2 = checkpre.premiumAccount
    const fav = new Fav({
      name:username,
      artist,
      song
    })
    await fav.save()
    jj = await mp3DB.find({namesinger:artist})
      for(let i=0;i< jj.length;i++){
        r1[i] = jj[i].songname
        singfav[i] = jj[i].path
      }
      var genre = jj[0].genre
      checkfav = await Fav.find({name:username,artist:artist})
      for(let i = 0;i < r1.length;i++){
        for(let j =0;j < checkfav.length ;j++){
          tf[i] = false
          if(r1[i] === checkfav[j].song){
            tf[i] = true
            break;
          }
        }
      }
      var artistimage = jj[0].URLimage
      arrsong2 = r1
      res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
  }) 
  
  router.get('/unFav/:artistDB/:song',async (req,res)=>{
    var r1 = []
    var jj
    var arrsong2 = []
    var checkfav
    var singfav = []
    var tf = []
    const {artistDB,song} = req.params
    const name2 = req.session.user
    const checkpre = await User.findOne({name:name2})
    const artist = artistDB
    const username = checkpre.username
    const preOrNot2 = checkpre.premiumAccount
    await Fav.findOneAndDelete({name:username,artist:artist,song:song})
    jj = await mp3DB.find({namesinger:artist})
      for(let i=0;i< jj.length;i++){
        r1[i] = jj[i].songname
        singfav[i] = jj[i].path
      }
      var genre = jj[0].genre
      checkfav = await Fav.find({name:username,artist:artist})
      for(let i = 0;i < r1.length;i++){
        for(let j =0;j < checkfav.length ;j++){
          tf[i] = false
          if(r1[i] === checkfav[j].song){
            tf[i] = true
            break;
          }
        }
      }
      var artistimage = jj[0].URLimage
      arrsong2 = r1
      res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
  })  

  router.get('/goback/:name/:artist',async (req,res)=>{
    const {name,artist} = req.params
    console.log(name)
    const artistDB = artist
    var name2 = name
    var preOrNot2
    const checkpre = await User.findOne({name:name2})
    var username
    if(name2 === 'undefined'){
      preOrNot2 = false
      name2 = 'undefined'
      username = 'undefined'
    }else{
      preOrNot2 = checkpre.premiumAccount
      username = checkpre.username
    }
    var r1 = []
    var jj
    var arrsong2 = []
    var checkfav
    var singfav = []
    var tf = []
    jj = await mp3DB.find({namesinger:artist})
      for(let i=0;i< jj.length;i++){
        r1[i] = jj[i].songname
        singfav[i] = jj[i].path
      }
      var genre = jj[0].genre
      
      checkfav = await Fav.find({name:username,artist:artist})
      for(let i = 0;i < r1.length;i++){
        for(let j =0;j < checkfav.length ;j++){
          tf[i] = false
          if(r1[i] === checkfav[j].song){
            tf[i] = true
            break;
          }
        }
      }
      var artistimage = jj[0].URLimage
      arrsong2 = r1
      res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
  })



function getSongList(artist,name2,preOrNot2,tf,res){
    const art = artist
    console.log(art)
    mongoClient.connect('mongodb://localhost:27017',{useNewUrlParser: true},(err, client)=>{
      if (err) {
        return err
    }else{
      let db = client.db('test')
      let collection = db.collection('files')
      collection.find({}).toArray((err,doc)=>{
        if (err) {
          console.log('err in finding doc:', err)
        }else{
          var arrsong2 =[]
          var artistDB = art
          var artistimage = ''
          var genre 
          var singfav = []
          for(let i =0;i<doc.length;i++){
            if(art === doc[i].namesinger){
              arrsong2.push(doc[i].songname)
              artistimage = doc[i].URLimage
              genre = doc[i].genre
              singfav.push(doc[i].path)
            }
          }
          console.log(arrsong2)
          res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
        }
      })
    }
    })
  }

  router.get('/download/:artist/:song',async (req,res)=>{
    var r1 = []
    var jj
    var checkfav
    var tf = []
    var singfav = []
    var arrsong2 = []
    var genre
    const {artist,song} = req.params
    const name2 = req.session.user
    const checkpre = await User.findOne({name:name2})
    const preOrNot2 = checkpre.premiumAccount
    const username = checkpre.username
    const db = await mp3DB.findOne({namesinger:artist,songname:song})
    const buffer = db.videofile
    const artistDB = artist
    fs.writeFileSync('public/download/'+song+'.mp3', buffer)
    jj = await mp3DB.find({namesinger:artist})
    genre = jj[0].genre
      for(let i=0;i< jj.length;i++){
        r1[i] = jj[i].songname
        singfav[i] = jj[i].path
      }
  
      checkfav = await Fav.find({name:username,artist:artist})
      for(let i = 0;i < r1.length;i++){
        for(let j =0;j < checkfav.length ;j++){
          tf[i] = false
          if(r1[i] === checkfav[j].song){
            tf[i] = true
            break;
          }
        }
      }
      var artistimage = jj[0].URLimage
      arrsong2 = r1
      res.render('showlistsong',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
  })
  

module.exports = router; 