module.exports = {
	isLoggedIn: (req, res, next) => {
		if (!req.isAuthenticated()) {
      res.status(401);
			return res.redirect("/login");
		}
		next();
  },
  secureAPI: (req,res,next) =>{
    if (!req.isAuthenticated()) {
      res.status(401);
      return res.redirect("/login");
		}
    next();
  },
};