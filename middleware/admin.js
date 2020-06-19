module.exports = (req, res, next) => {
  if (process.env.ADMIN_REQUIRED === "false") return next();

  if (!req.user.isAdmin)
    return res.status(403).send("Access denied. Request Forbidden.");

  return next();
};
