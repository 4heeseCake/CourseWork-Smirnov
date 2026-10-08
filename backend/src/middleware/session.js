const session = require('express-session');
const { sessionSecret } = require('../config');
function sessions() {
  const make = (mode) =>
    session({
      name: `sid_${mode}`,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
        secure: false,
        httpOnly: mode === 'protected',
        sameSite: 'lax',
      },
    });
  const stores = {
    vulnerable: make('vulnerable'),
    protected: make('protected'),
  };
  return (req, res, next) => stores[req.mode](req, res, next);
}
module.exports = { sessions };
