module.exports = function (req, res, next) {
  if (!req.user.roles.includes('ADMIN')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};
