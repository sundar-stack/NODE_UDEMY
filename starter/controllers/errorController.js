module.exports = (err, req, res, next) => {
    // console.log(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    res.status(err.statusCode).send({
      status: err.status,
      message: err.message,
    });
  }

