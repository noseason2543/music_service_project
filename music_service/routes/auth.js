const express = require('express')
const router = express.Router()


const User = require('../model/User')
const bcrypt = require('bcrypt')

router.post('/register', async (req, res) => {
  const { username, password, name, email } = req.body
  const checkUser = await User.findOne({
    username
  })
  const checkname = await User.findOne({name})
  if(checkUser){
    return res.render('register',{regisResult: 'This UserName is already used'})
  }
  if(checkname){
    return res.render('register',{regisResult: 'This Name is already used'})
  }
  // simple validation
  if (!name || !username || !password || !email) {
    return res.render('register', { regisResult: 'Please try again' })
  }
  const passwordHash = bcrypt.hashSync(password, 10)
  const user = new User({
    name,
    username,
    password: passwordHash,
    email,
    premiumAccount: false
  })
  await user.save()
  res.render('login',{resultText:''})
})


router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({
    username
  })
  if (user) {
    console.log(user);
    const isCorrect = bcrypt.compareSync(password, user.password)
    console.log(isCorrect)
    if (isCorrect) {
      // req.session.name อะไรก็ได้
      req.session.user = user.name
      req.session.username = user.username
      var c = user.name
      module.exports = {c}
      const test = await User.findOne({name:req.session.user})
      req.session.pre = test.premiumAccount
      if(c === 'admin'){
        return res.render('backEnd')
      }
      res.render('home',{name:req.session.user,preOrNot:test.premiumAccount});
    } else {
      return res.render('login', { resultText: 'Username or Password incorrect' })
    }
  } else {
    return res.render('login', { resultText: 'Username does not exist.' })
  }
})
module.exports = router