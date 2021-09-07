const mongoose = require('mongoose');
const Validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UsersSchema = new mongoose.Schema({
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
    select: false,
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
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['admin', 'user', 'researcher'],
    default: 'user',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

/////ENCRYPTING THE PASSWORD
UsersSchema.pre('save', async function (next) {
  ///Only runs this function if password was actually modified
  if (!this.isModified('password')) return next();

  ///Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm Field
  this.confirmPassword = undefined;

  next();
});

UsersSchema.pre('save', async function (next) {
  ///isModified and isNew are mongoose methods
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  // console.log(
  //   'PASSWORD CHANGED AT>>>',
  //   new Date(this.passwordChangedAt).toLocaleTimeString()
  // );
});

UsersSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

///password verification
UsersSchema.methods.correctPassword = async function (
  bodyPassword,
  userPassword
) {
  return await bcrypt.compare(bodyPassword, userPassword);
};

UsersSchema.methods.passwordChanged = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // console.log(passChangedTimestamp, JWTTimestamp);

    return passChangedTimestamp > JWTTimestamp;
  }
  ///by default we are setting it to false
  ///false means the password has n't changed
  return false;
};

UsersSchema.methods.createPasswordResetToken = async function () {
  ////encrypt the token and store it in database
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  ///send the normal token to the user's mail

  return resetToken;
};

module.exports = mongoose.model('Users', UsersSchema);
