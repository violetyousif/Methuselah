// logger.js: middleware file in backend

// Name: Violet
// Date: 5/31/2025
// Description: logs the HTTP method and path of incoming requests.
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

export default logger;
