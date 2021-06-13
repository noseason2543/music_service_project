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

router.get('/addFav/:name/:artist/:song', async (req,res)=>{
    const {name,artist,song} = req.params
    console.log(name)
    var check = await User.findOne({name:name})
    const name1 = check.username
    const fav = new Fav({
      name:name1,
      artist,
      song
    })
    if(name === 'undefined'){
      var preOrNot = false 
    }else{
      const checkpre = await User.findOne({name:name})
      var preOrNot = checkpre.premiumAccount
      console.log(fav)
      await fav.save()
      bl = true
    }
    getDetailSong(name,preOrNot,artist,song,bl,res)
  })

  router.get('/unFav/:name/:artist/:song',async (req,res)=>{
    const {name,artist,song} = req.params
    var check = await User.findOne({name:name})
    console.log(check)
    const username = check.username
    await Fav.findOneAndDelete({name:username,artist:artist,song:song})
    bl = false
    
    const preOrNot = check.premiumAccount
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

module.exports = router;