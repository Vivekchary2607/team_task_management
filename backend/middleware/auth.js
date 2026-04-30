const jwt = require("jsonwebtoken");

exports.auth = (req,res,next)=>{
  const token = req.headers.authorization;
  if(!token) return res.sendStatus(401);

  const decoded = jwt.verify(token,process.env.JWT_SECRET);
  req.user = decoded;
  next();
};

exports.admin = (req,res,next)=>{
  if(req.user.role !== "admin") return res.sendStatus(403);
  next();
};