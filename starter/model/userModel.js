const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: [true, 'User Name Required'],
  },
  age: {
    type: Number,
    required: [true, 'Age Required'],
  },
  country: {
    type: String,
    default: 'India',
  },
});

module.exports = mongoose.model('Users', UsersSchema);
