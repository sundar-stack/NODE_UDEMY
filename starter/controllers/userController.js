///route handler functions
const fs = require('fs');

let tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server issue api in production build',
  });
};

exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server issue api in production build',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server issue api in production build',
  });
};
exports.modifyUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server issue api in production build',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server issue api in production build',
  });
};
