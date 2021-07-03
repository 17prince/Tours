const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Uncaught Exception
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception, Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Databse Connected');
  });

const app = require('./app');

// console.log(app.get('env'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('Server Started at port 3000');
});

// Unhandel Rejection
process.on('unhandledRejection', (err) => {
  console.log('Unhendel Rejection, Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
