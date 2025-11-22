import fs from 'fs';
import path from 'path';
import morgan from 'morgan';

const logsDir = path.resolve('./src/logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// rotate per day by using date in filename (simple approach)
const getLogStream = (category = 'general') => {
  const fileName = `access-${category}-${new Date().toISOString().slice(0,10)}.log`;
  const fullPath = path.join(logsDir, fileName);
  const stream = fs.createWriteStream(fullPath, { flags: 'a' });
  return stream;
};

morgan.token('client', function (req) {
  return req.headers['x-client-name'] || req.headers['user-agent'] || req.ip;
});

export const morganMiddleware = (format = ':method :url :status :res[content-length] - :response-time ms :client', toConsole = true) => {
  const stream = getLogStream();
  const middlewares = [];
  middlewares.push(morgan(format, { stream }));
  if (toConsole) middlewares.push(morgan(format));
  return (req, res, next) => {
    // execute both morgan middlewares sequentially
    const run = (i) => {
      if (i >= middlewares.length) return next();
      middlewares[i](req, res, (err) => {
        if (err) return next(err);
        run(i + 1);
      });
    };
    run(0);
  };
};

// create a morgan middleware for a specific category (auth/user/message)
export const morganFor = (category = 'general', format = ':method :url :status :res[content-length] - :response-time ms :client', toConsole = true) => {
  const stream = getLogStream(category);
  const middlewares = [];
  middlewares.push(morgan(format, { stream }));
  if (toConsole) middlewares.push(morgan(format));
  return (req, res, next) => {
    const run = (i) => {
      if (i >= middlewares.length) return next();
      middlewares[i](req, res, (err) => {
        if (err) return next(err);
        run(i + 1);
      });
    };
    run(0);
  };
};
