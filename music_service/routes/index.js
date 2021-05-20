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

router.get('/start',(req,res)=>{
  res.render('upsong')
})



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


router.get('/findlistsong/:artist',async (req,res)=>{
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

router.post('/listsearch/:artist',async (req,res)=>{
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

router.get('/favlist/:artistDB/:song',async (req,res)=>{
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
    res.render('showlistsongVer2',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
})


router.get('/favlistdel/:artistDB/:song',async (req,res)=>{
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
    res.render('showlistsongVer2',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
})



router.get('/gobacklistsong/:name/:artist',async (req,res)=>{
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
    res.render('showlistsongVer2',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
})


router.get('/downloadformlistsong/:artist/:song',async (req,res)=>{
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
    res.render('showlistsongVer2',{artistDB,name2,preOrNot2,arrsong2,artistimage,tf,genre,singfav})
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




var bl
router.get('/detail/:artist/:song', async(req,res)=>{
  const {artist,song} = req.params;
  if(req.session.user){
    var name = req.session.user;
    var checkpre = await User.findOne({name:name})
    var preOrNot = checkpre.premiumAccount
    var username = checkpre.username
  }else{
    var name = 'undefined';
    var preOrNot = false
  }
  const star = await Fav.findOne({name:username,artist:artist,song:song})
  console.log(star)
  if(star === null){
    bl = false
  }else{
    bl = true
  }
  console.log(bl)
  getDetailSong(name,preOrNot,artist,song,bl,res)
})

router.get('/favdetail/:name1/:artist/:song', async (req,res)=>{
  const {name1,artist,song} = req.params
  var check = await User.findOne({name:name1})
  const name = check.username
  const fav = new Fav({
    name,
    artist,
    song
  })
  if(name === 'undefined'){
    var preOrNot = false 
  }else{
    const checkpre = await User.findOne({name:name1})
    var preOrNot = checkpre.premiumAccount
    await fav.save()
    bl = true
  }
  getDetailSong(name,preOrNot,artist,song,bl,res)
})

router.get('/delfavdetail/:name/:artist/:song',async (req,res)=>{
  const {name,artist,song} = req.params
  var check = await User.findOne({name:name})
  const username = check.username
  await Fav.findOneAndDelete({name:username,artist:artist,song:song})
  bl = false
  const checkpre = await User.findOne({name:name})
  const preOrNot = checkpre.premiumAccount
  getDetailSong(name,preOrNot,artist,song,bl,res)
})

function getDetailSong(name,preOrNot,artist,song,bl,res){
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
          var detail = ''
          var artimg = ''
          var artname = ''
          var genre1 = ''
          var singfav = ''
          for(let i=0;i <doc.length;i++){
            if(doc[i].songname === song && doc[i].namesinger === artist){
              artimg = doc[i].URLimage
              detail = doc[i].lyrics
              artname = doc[i].namesinger
              genre1 = doc[i].genre
              singfav = doc[i].path
              break;
            }
          }
          res.render('lyrics',{song,genre1,name,preOrNot,detail,artimg,artist,bl,singfav})
        }
      })
    }
  })
}

router.get('/delsong', async(req,res)=>{
  listSong(res)
})
var songdel =[]

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

router.post('/searchsongback',async (req,res)=>{
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

router.get('/sortbyart', async (req,res)=>{
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


router.get('/favorite', async(req,res)=>{
  var name
  var preOrNot
  var username
  var email
  var artistfav = []
  var songfav = []
  var imgfav = []
  var singfav = []
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
  for(let i = 0;i < fav.length;i++){
    artistfav[i] = fav[i].artist
    songfav[i] = fav[i].song
  }
  for(let i =0;i < artistfav.length;i++){
    const de = await mp3DB.findOne({namesinger: artistfav[i],songname:songfav[i]})
    singfav[i] = de.path
  }
  for(let i =0;i < artistfav.length;i++){
    const test = await mp3DB.findOne({namesinger: artistfav[i]})
    imgfav[i] = test.URLimage
  }

  console.log(username)
  res.render('favpage',{name,preOrNot,artistfav,songfav,username,email,imgfav,singfav})
})


router.get('/allgenresong/:type/:genre/:img', async (req,res)=>{
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

router.get('/genredownloadsong/:type/:genre/:img/:artist/:song', async (req,res)=>{
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
  fs.writeFileSync('public/download/'+song+'.mp3', buffer)
  res.render('genreSongVer2',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav})
})


router.get('/genreadd/:name/:artist/:song/:img/:type',async(req,res)=>{
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
  res.render('genreSongVer2',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav}) 
})

router.get('/genredel/:name/:artist/:song/:img/:type', async(req,res)=>{
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
  res.render('genreSongVer2',{name,preOrNot,artistgen,songgen,tf,type,genre,img,imgdd,singfav}) 
})


router.get('/favoritedel/:name1/:artist/:song', async (req,res)=>{
  const {name1,artist,song} = req.params
  const check = await User.findOne({name:name1})
  const name2 = check.username
  await Fav.findOneAndDelete({name:name2,artist:artist,song:song})
  var name
  var preOrNot
  var username
  var email
  var artistfav = []
  var songfav = []
  var imgfav = []
  var singfav = []
  name = req.session.user
  const checkpre = await User.findOne({name:name})
  preOrNot = checkpre.premiumAccount
  username = checkpre.username
  email = checkpre.email
  const fav = await Fav.find({name:name2})
  for(let i = 0;i < fav.length;i++){
    artistfav[i] = fav[i].artist
    songfav[i] = fav[i].song
  }
  for(let i =0;i < artistfav.length;i++){
    const de = await mp3DB.findOne({namesinger: artistfav[i],songname:songfav[i]})
    singfav[i] = de.path
  }
  for(let i =0;i < artistfav.length;i++){
    const test = await mp3DB.findOne({namesinger: artistfav[i]})
    imgfav[i] = test.URLimage
  }
  res.render('favpage2',{name,preOrNot,artistfav,songfav,username,email,imgfav,singfav})
})

router.get("/downloadfav/:artist/:song",async (req, res) => {
  const {artist,song} = req.params;
  var username
  var email
  var artistfav = []
  var songfav = []
  var imgfav = []
  var singfav = []
  const name = req.session.user
  const checkpre = await User.findOne({name:name})
  const preOrNot = checkpre.premiumAccount
  username = checkpre.username
  email = checkpre.email
  const fav = await Fav.find({name:username})
  for(let i = 0;i < fav.length;i++){
    artistfav[i] = fav[i].artist
    songfav[i] = fav[i].song
  }
  for(let i =0;i < artistfav.length;i++){
    const test = await mp3DB.findOne({namesinger: artistfav[i]})
    imgfav[i] = test.URLimage
  }
  for(let i =0;i < artistfav.length;i++){
    const de = await mp3DB.findOne({namesinger: artistfav[i],songname:songfav[i]})
    singfav[i] = de.path
  }
  const db = await mp3DB.findOne({namesinger:artist,songname:song})
  var buffer = db.videofile
  fs.writeFileSync('public/download/'+song+'.mp3', buffer)

  res.render('favpage2',{name,preOrNot,artistfav,songfav,username,email,imgfav,singfav})
})

router.get('/login',(req,res)=>{
    res.render('login',{resultText:''});
  
})

router.get('/logout',(req,res)=>{
  req.session.user = false
  return res.render('home',{name:'undefined'})
})

router.get('/backEnd',(req,res)=>{
  res.render('backEnd')
})

router.post('/del/:username',async (req,res)=>{
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

router.get('/all',async (req,res)=>{
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

router.post('/usersearch',async (req,res)=>{
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

router.get('/sortusername', async (req,res)=>{
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

router.get('/poppular', async (req,res)=>{
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



router.get('/popfav/:artist/:song', async (req,res)=>{
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
  res.render('popularV2',({name,preOrNot,result,tf}))
})

router.get('/popdel/:artist/:song', async (req,res)=>{
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
  res.render('popularV2',({name,preOrNot,result,tf}))
})

router.get('/popdown/:artist/:song', async (req,res)=>{
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
  res.render('popularV2',({name,preOrNot,result,tf}))
})


router.post('/favoritesearch', async (req,res)=>{
  const {search} = req.body
  console.log(search)
  if(search === ''){
    var name
    var preOrNot
    var username
    var email
    var artistfav = []
    var songfav = []
    var imgfav = []
    var singfav = []
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
    for(let i = 0;i < fav.length;i++){
      artistfav[i] = fav[i].artist
      songfav[i] = fav[i].song
    }
    for(let i =0;i < artistfav.length;i++){
      const de = await mp3DB.findOne({namesinger: artistfav[i],songname:songfav[i]})
      singfav[i] = de.path
    }
    for(let i =0;i < artistfav.length;i++){
      const test = await mp3DB.findOne({namesinger: artistfav[i]})
      imgfav[i] = test.URLimage
    }

    console.log(username)
    res.render('favpage',{name,preOrNot,artistfav,songfav,username,email,imgfav,singfav})
  }else{
    var name
    var preOrNot
    var username
    var email
    var artistfav = []
    var songfav = []
    var imgfav = []
    var singfav = []
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
      
      res.render('favpage',{name,preOrNot,artistfav,songfav,username,email,imgfav,singfav})
    }else{
      if(dog1 === true){
        
        const bb = await mp3DB.find({namesinger:search})
        const dd = await Fav.find({name:username,artist:search})
        for(let i =0;i < bb.length;i++){
          for(let j=0;j < dd.length;j++){
            if(bb[i].namesinger === dd[j].artist && bb[i].songname === dd[j].song){
              artistfav.push(bb[i].namesinger)
              songfav.push(bb[i].songname)
              imgfav.push(bb[i].URLimage)
              singfav.push(bb[i].path)
              break
            }
          }
        }
        res.render('favpage',{name,preOrNot,artistfav,songfav,username,email,imgfav,singfav})
      }else{
        const bb = await mp3DB.find({songname:search})
        const dd = await Fav.find({name:username,song:search})
        for(let i =0;i < bb.length;i++){
          for(let j=0;j < dd.length;j++){
            if(bb[i].namesinger === dd[j].artist && bb[i].songname === dd[j].song){
              artistfav.push(bb[i].namesinger)
              songfav.push(bb[i].songname)
              imgfav.push(bb[i].URLimage)
              singfav.push(bb[i].path)
              break
            }
          }
        }
        res.render('favpage',{name,preOrNot,artistfav,songfav,username,email,imgfav,singfav})
      }
    }
  }
})

router.post('/genresearch/:genre/:img/:type',async (req,res)=>{
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


module.exports = router;
