const mongoose = require('mongoose');
const Validator = require('validator');
const bcrypt = require('bcryptjs')

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  userName: {
    type: String,
    required: [true, 'Username Required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'email Required'],
    unique: true,
    lowercase: true,
    validate: [Validator.isEmail, 'Please provide a valid EMAIL'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password Required'],
    maxLength: [15, 'Password should be below 15 characters'],
    minLength: [8, 'Password must be above or equal to 8 characters'],
    trim: true,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Password Confirmation Required'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: `Confirmation Password is incorrect please enter correct password`,
    },
    trim: true,
  },
});

/////ENCRYPTING THE PASSWORD
UsersSchema.pre('save',async function(next){
  ///Only runs this function if password was actually modified
   if(!this.isModified('password')) return next()

   ///Hash the password with the cost of 12
   this.password = await bcrypt.hash(this.password,12)

   //Delete passwordConfirm Field
   this.confirmPassword = undefined

   next()
})

module.exports = mongoose.model('Users', UsersSchema);
