const jwt=require('jsonwebtoken');
const Signup=require('./app.js');


const authenticate=(req,res,next)=>{
    try{
        const token=req.header('authorization');
        console.log(token);
        const user=jwt.verify(token, 'PRADHAN');
        console.log('userid>>>>',user.Signup.id);
        Signup.findByPk(user.Signup.id).then(user=>
            {

            req.user=user.id;
            next();
        })
    }catch(err){
        console.log(err);
        return res.status(401).json({success:false});
    }
}

module.exports={
    authenticate
}