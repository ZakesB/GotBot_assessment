const mongoose = require("mongoose");
const Chat = mongoose.model("chats");
const User = mongoose.model("users");
const request = require('request-promise');

const chat_app = (app, soc_io) => {
   app.post('/webhook', (req, res) => {
      let body = req.body;
      if (body.object === 'page') {
        body.entry.forEach(function(entry) {
          let webhook_event = entry.messaging[0];
          console.log(webhook_event);
          let sender_psid = webhook_event.sender.id;

          console.log('Sender ID: ' + sender_psid);
          if (webhook_event.message) {
            handleMessage(sender_psid, webhook_event.message);
          } else if (webhook_event.postback) {
            handlePostback(sender_psid, webhook_event.postback);
          }

        });
        res.status(200).send('EVENT_RECEIVED');

      } else {
        res.sendStatus(404);
      }

    });

   app.get('/facebook-search/:id', (req, res) => {

   const userFieldSet = 'id, first_name, last_name, picture';
   const user_access_token = 'EAAJQz0aQZAT4BAM7xg60qLc1GEx9kDSonF9KNMurOr2XkhqcbOAZABG48aaccTnvJhyvdqWzUEwbyZAZB8vOhUBNf2ZBdoVjfpZA3rlEKoPRPXMCIET2kgJaYVvB0ZCCQb8opP73nzZBvJfAtluh46IJe7aEeTdaFbReAylpasZB5vfzbluBnXSlWdo0llKAjfv5j61ULUrhffwZDZD';

   const options = {
     method: 'GET',
     uri: `https://graph.facebook.com/v2.8/${req.params.id}`,
     qs: {
       access_token: user_access_token,
       fields: userFieldSet
     }
     };
     request(options)
       .then(fbRes => {res.json(fbRes);})
       .then((json) => {
         var user = new User({ user_fname: json['first_name'], user_lname: json['last_name'], user_pro_pic: json['picture'], user_msg_id: 1 });
         user.save(function (err, _user){
            if (err) return console.error(err);
            console.log("Document inserted succussfully!");
         });
     });
   })

   app.get("/api", async(req, res) => {
      const chatList = await Chat.find()
        .sort({date: -1})
        .limit(6);
      return res.json({chats: chatList});

   });

   app.get("/users", async(req, res) => {
      const userList = await User.find()
        .limit(6);
      return res.json({users: userList});

   });

   app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = "EAAJQz0aQZAT4BAM7xg60qLc1GEx9kDSonF9KNMurOr2XkhqcbOAZABG48aaccTnvJhyvdqWzUEwbyZAZB8vOhUBNf2ZBdoVjfpZA3rlEKoPRPXMCIET2kgJaYVvB0ZCCQb8opP73nzZBvJfAtluh46IJe7aEeTdaFbReAylpasZB5vfzbluBnXSlWdo0llKAjfv5j61ULUrhffwZDZD";

    // Parse params from the webhook verification request
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Check if a token and mode were sent
    if (mode && token) {

      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {

        // Respond with 200 OK and challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);

      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });

   function handleMessage(sender_psid, received_message) {
     let response;

     if (received_message.text) {
       //Save the message to the database
       var chat = new Chat({ msg_id: sender_psid, msg: received_message, date: Date.now() });
        // save model to database
      chat.save(function (err, _chat) {
        if (err) return console.error(err);
        console.log(chat.name + " saved to chat collection.");
      });
       //I am going to put my chats from the agent
     }
     callSendAPI(sender_psid, response);
   }

   function callSendAPI(sender_psid, response) {
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }

    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": "EAAJQz0aQZAT4BAM7xg60qLc1GEx9kDSonF9KNMurOr2XkhqcbOAZABG48aaccTnvJhyvdqWzUEwbyZAZB8vOhUBNf2ZBdoVjfpZA3rlEKoPRPXMCIET2kgJaYVvB0ZCCQb8opP73nzZBvJfAtluh46IJe7aEeTdaFbReAylpasZB5vfzbluBnXSlWdo0llKAjfv5j61ULUrhffwZDZD" },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    });
  }

   soc_io.of("/").on("connect", async socket => {
       console.log("connected");

       socket.on("typing", async socket => {
            console.log(msg);
            socket.broadcast.emit("typing", {msg: msg.name});
       });

   try{
       socket.on("msg", async msg => {
          const chatList = await Chat.find()
            .sort({date: -1})
            .limit(6);
          soc_io.emit("msg", {chats: chatList});

          const chat = new Chat({
             username: msg.name,
             message: msg.msg
          });
          await chat.save();
          const chats = await Chat.find()
            .sort({date: -1})
            .limit(6);
          soc_io.emit("msg", {chats: chats});
          });
    }catch(err) {
      console.error(err.message);
    }

    socket.on("typing", name => {
       soc_io.emit("typing", {name: '${name.name}'});
    });
    socket.on("disconnect", () => {
       console.log("Disconnected");
    });
  });

};

module.exports = chat_app;
