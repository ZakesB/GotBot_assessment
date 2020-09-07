const express = require("express");
const socketIO = require("socket.io");
const dbConnect = require("./config/db_config.js");
const ngrok = require('ngrok');

dbConnect();

const app = express();

app.use(
   express.json({
     extended: true
   })
);

require('./Models/chat.js');
require('./Models/user.js');

app.use(
  express.static(__dirname + "/public")
);

const port = process.env.PORT || 5050;

const expressWebServer = app.listen(port, () => {
   console.log('Chat App running on port ${port}');
});

ngrok.connect({
    proto : 'http',
    addr : process.env.PORT,
}, (err, url) => {
    if (err) {
        console.error('Error while connecting Ngrok',err);
        return new Error('Ngrok Failed');
    }
});

const soc_io = socketIO(expressWebServer);
const chat_app = require("./routes/chat_app.js");

chat_app(app, soc_io);
