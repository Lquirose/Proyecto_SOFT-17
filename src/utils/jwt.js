const jwt = require('jsonwebtoken');
const secret = require('./secret');
module.exports = (user) => jwt.sign({ id: user._id, rol: user.rol }, secret(), { expiresIn: '7d' });
