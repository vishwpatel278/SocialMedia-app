const jwt = require('jsonwebtoken');
const User = require('./models/user');

const jwtAuthMiddleWare = (req,res,next) => {
    const token = req.cookies.token
    if(!token)return res.status(401).json({error : "unauthorized"});

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        console.log(err);
        res.status(401).json({error : 'invalid token'});
    }
}

const jwtAuthMiddleWareforAdmin = async (req,res,next) => {
    const token = req.cookies.token
    if(!token)return res.status(401).json({error : "unauthorized"});

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        const id = req.user.id;
        const user = await User.findById(id);
        if(!(user.roles==='Admin'))return res.status(403).json('permission denied!!!');
        next();
    }catch(err){
        console.log(err);
        res.status(401).json({error : 'invalid token'});
    }
}

const generateToken = (userdata) => {
    return jwt.sign(userdata,process.env.JWT_SECRET,{ expiresIn: "30d" });
}
module.exports = {jwtAuthMiddleWare,generateToken,jwtAuthMiddleWareforAdmin};