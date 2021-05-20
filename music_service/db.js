const mongoose = require('mongoose')

const option = {
    useNewUrlParser :true,
    useUnifiedTopology:true
}

mongoose.connect('mongodb://localhost:27017/test',option)

