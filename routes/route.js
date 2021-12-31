const user = require('../api/user_index');

const routes = (app) => {
  app.use('/user', user);
};

module.exports = routes;
