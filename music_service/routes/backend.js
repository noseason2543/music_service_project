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

router.get('/',(req,res)=>{
    res.render('backEnd')
  })

var songdel =[]
router.get('/listsong', async(req,res)=>{
    listSong(res)
  })

router.post('/deletesong/:artist/:song',async (req,res)=>{
    const {artist,song} = req.params
    console.log(artist)
    console.log(song)
    await mp3DB.findOneAndDelete({namesinger:artist,songname:song})
    const eu = await Fav.find({artist:artist, song:song})
    for(let i=0;i < eu.length;i++){
      await Fav.findOneAndDelete({artist:artist, song:song})
    }
    for(let i=0;i < songdel.length;i++){
      if(artist === songdel[i][1] && song === songdel[i][0]){
        songdel.splice(i,1)
      }
    }
    res.render('delsong',{songdel})
  })

  router.post('/searchsong',async (req,res)=>{
    const {search} = req.body
    const mp3 = await mp3DB.find({})
    if(search === ''){
      listSong(res)
    }else{
      for(let i=0;i < mp3.length;i++){
        if(search === mp3[i].namesinger){
          const mp3v2 = await mp3DB.find({namesinger:search})
          songdel = new Array(mp3v2.length)
            for(let j =0 ;j <songdel.length;j++){
              songdel[j] = new Array(3)
            }
          for(let i=0;i < songdel.length;i++){
            songdel[i][0] = mp3v2[i].songname
            songdel[i][1] = mp3v2[i].namesinger
            songdel[i][2] = mp3v2[i].URLimage
          }
          songdel.sort()
          res.render('delsong',{songdel})
        }else if(search === mp3[i].songname){
          const mp3v2 = await mp3DB.find({songname:search})
          songdel = new Array(mp3v2.length)
            for(let j =0 ;j <songdel.length;j++){
              songdel[j] = new Array(3)
            }
          for(let i=0;i < songdel.length;i++){
            songdel[i][0] = mp3v2[i].songname
            songdel[i][1] = mp3v2[i].namesinger
            songdel[i][2] = mp3v2[i].URLimage
          }
          songdel.sort()
          res.render('delsong',{songdel})
        }else{
          continue
        }
      }
      songdel = []
      res.render('delsong',{songdel})
    }
  })

  router.get('/sortArtist', async (req,res)=>{
    mongoClient.connect('mongodb://localhost:27017',{useNewUrlParser: true},(err, client)=>{
      if (err) {
        return err
      }else{
        let db = client.db('test')
        let collection = db.collection('files')
        collection.find({}).toArray((err,doc)=>{
          if (err) {
            console.log('err in finding doc:', err)
          }else{console.log(doc.length)
            var test = []
            songdel = new Array(doc.length)
            test = new Array(doc.length)
            for(let j =0 ;j <test.length;j++){
              test[j] = new Array(3)
            }
            for(let j =0 ;j <songdel.length;j++){
              songdel[j] = new Array(3)
            }
            for(let i =0;i< doc.length;i++){
              test[i][0] = doc[i].namesinger
              test[i][1] = doc[i].songname
              test[i][2] = doc[i].URLimage
            }
            test.sort()
            for(let i =0;i< doc.length;i++){
              songdel[i][0] = test[i][1]
              songdel[i][1] = test[i][0]
              songdel[i][2] = test[i][2]
            }
            res.render('delsong',{songdel})
          }
        })
      }  
    })
  })
  
  router.get('/upsongPage',(req,res)=>{
    res.render('upsong')
  })

  router.post("/upload", (req, res) => {
    let file = { namesinger: req.body.singer, 
      songname : req.body.songname,
      genre : req.body.genre,
      URLimage: req.body.URLimage,
      videofile: binary(req.files.uploadedFileMP3.data),
      path: req.body.path,
      lyrics:req.body.lyrics}
    insertFile(file, res)
  })
 
  router.get('/listAllUsers',async (req,res)=>{
    const con =await User.find({})
    arr = new Array(con.length)
    for(let i=0 ;i < con.length;i++){
      arr[i] = new Array(2)
    }
    console.log(arr)
    for(let i =0;i < arr.length;i++){
      arr[i][0] = con[i].name
      arr[i][1] = con[i].username
    }
    console.log(arr)
    arr.sort()
    console.log(arr)
    res.render('listAllUser',{arr})
  }) 
  
  router.post('/deleteUser/:username',async (req,res)=>{
    const {username} = req.params
    console.log(username)
    await User.findOneAndDelete({username: username})
    const de = await Fav.find({name:username})
    for(let i = 0;i < de.length;i++){
      await Fav.findOneAndDelete({name:username})
    }
    for(let i =0;i < arr.length;i++){
      if(arr[i][1] === username){
        arr.splice(i,1)
      }
    }
    res.render('listAllUser',{arr})
  })

  router.post('/searchUser',async (req,res)=>{
    const {search} = req.body
    const con =await User.find({})
   
    if(search === ''){
      arr = [] 
      arr = new Array(con.length)
      for(let i=0 ;i < con.length;i++){
        arr[i] = new Array(2)
      }
      console.log(arr)
      for(let i =0;i < arr.length;i++){
        arr[i][0] = con[i].name
        arr[i][1] = con[i].username
      }
      console.log(arr)
      arr.sort()
      console.log(arr)
      res.render('listAllUser',{arr})
    }else{
      var cu = 0
      for(let i =0;i < con.length;i++){
        if(search === con[i].username || search === con[i].name){
          cu++
        }
      }
      arr = new Array(cu)
      for(let i=0;i < arr.length;i++){
        arr[i] = new Array(2)
      }
      var d1 =0
      var d2 =0
      for(let i=0;i < con.length;i++){
        if(search === con[i].username || search === con[i].name){
          arr[d1][0] = con[i].name
          arr[d2][1] = con[i].username
          d1++
          d2++
        }
      }
      res.render('listAllUser',{arr})
    }
  })

  router.get('/sortByUsername', async (req,res)=>{
    const con =await User.find({})
    var dog = []
    dog = new Array(con.length)
    for(let i=0 ;i < con.length;i++){
      dog[i] = new Array(2)
    }
    arr = new Array(con.length)
    for(let i=0 ;i < con.length;i++){
      arr[i] = new Array(2)
    }
    for(let i =0;i < dog.length;i++){
      dog[i][0] = con[i].username
      dog[i][1] = con[i].name
    }
    dog.sort()
    for(let i =0;i < arr.length;i++){
      arr[i][0] = dog[i][1]
      arr[i][1] = dog[i][0]
    }
    res.render('listAllUser',{arr})
  })
  
  router.get('/register',(req,res)=>{
    res.render('register',{regisResult:''});
  })

  function insertFile(file, res) {
    mongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('test')
            let collection = db.collection('files')
            try {
                collection.insertOne(file)
                console.log('File Inserted')
            }
            catch (err) {
                console.log('Error while inserting:', err)
            }
            client.close()
            res.render('upsong')
        }
  
    })
  }  

function listSong(res){
    mongoClient.connect('mongodb://localhost:27017',{useNewUrlParser: true},(err, client)=>{
      if (err) {
        return err
      }else{
        let db = client.db('test')
        let collection = db.collection('files')
        collection.find({}).toArray((err,doc)=>{
          if (err) {
            console.log('err in finding doc:', err)
          }else{console.log(doc.length)
            songdel = new Array(doc.length)
            for(let j =0 ;j <songdel.length;j++){
              songdel[j] = new Array(3)
            }
            for(let i =0;i< doc.length;i++){
              songdel[i][0] = doc[i].songname
              songdel[i][1] = doc[i].namesinger
              songdel[i][2] = doc[i].URLimage
            }
            songdel.sort()
            res.render('delsong',{songdel})
          }
        })
      }  
    })
  }

module.exports = router;