const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
     username: {
           type: String,
           required: true
     },
     message: {
          type: String,
          required: true
     },
    date: {
         type: Date,
         default: Date.now
    }
});

module.exports = chat = mongoose.model('chats', ChatSchema);
