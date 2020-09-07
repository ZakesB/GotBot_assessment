const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
     user_fname: {
           type: String,
           required: true
     },
     user_lname: {
          type: String,
          required: true
     },
    user_pro_pic: {
         type: String,
         required: true
    },
    user_msg_id: {
        type: Number,
        required: false
    }
});

module.exports = user = mongoose.model('users', UserSchema);
