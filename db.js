const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const connection = {};

module.exports = async () => {
  if (connection.isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }

  console.log('=> using new database connection');
  const db = await mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  connection.isConnected = db.connections[0].readyState;
  return Promise.resolve();
};
