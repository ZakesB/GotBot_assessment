const mongoose = require("mongoose");
const config = require("config");

var db_conf = "mongodb://localhost:27017/chats";

const dbConnect = async () => {
  try {
       await mongoose.connect(db_conf, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
      });
      console.log('Connection to database successfull');
   }catch(err) {
       console.error(err.message);
       process.exit(1);
  }
};

module.exports = dbConnect;
