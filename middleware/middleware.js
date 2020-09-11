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
  isEditUser: (req,res,next)=>{
    if(req.user.authLevel !== 3 && req.user.authLevel !== 10){
      // TODO: Redirect to not authorized.
      res.status(401);
      return res.redirect("/");
    }
    next();
  },
  isAdmin: (req,res,next)=>{
    if(req.user.authLevel !== 5 && req.user.authLevel !== 10){
      // TODO: Redirect to not authorized.
      res.status(401);
      return res.redirect("/");
    }
    next();
  }
};