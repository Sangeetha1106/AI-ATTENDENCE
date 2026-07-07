const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = err.errors ? err.errors.map(e => e.message).join(', ') : 'Database validation error';
  }

  res.status(statusCode).json({ 
    success: false, 
    message
  });
};

module.exports = errorHandler;
