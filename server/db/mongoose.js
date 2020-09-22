const mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/projInstagram', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

//local url
//mongodb://localhost:27017/projInstagram
//cloud url
//mongodb+srv://fypbackup:fypbackup123@cluster0-qedl3.mongodb.net/projInstagram?retryWrites=true&w=majority