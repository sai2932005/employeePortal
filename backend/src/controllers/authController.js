const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { logAction } = require('../services/auditService');



const login = async (req,res)=>{
    const {email,password} = req.body ;
    if(!email || !password){
        return res.status(400).json({message: "Email and password are required"});
    }

    const user = await User.findOne({email}).populate('roleIds');

    console.log('Found user:', user ? user.email : 'NONE FOUND');
    if(!user){
        return res.status(401).json({message: "Invalid email or password"});
    }
    console.log('Password received:', JSON.stringify(password));

   

    const isMatch = await bcrypt.compare(password,user.hashedPassword);
    if(!isMatch){
        return res.status(401).json({message: "Invalid email or password"});
    }

    console.log('Populated roles:', JSON.stringify(user.roleIds, null, 2));

    
    const roleNames = user.roleIds.map((r)=>r.name);
    
    const permissionKeys = [...new Set(user.roleIds.flatMap((r)=>r.permissionKeys))];

    const payload = {
        id : user._id,
        email : user.email,
        name : user.name,
        roles : roleNames,
        permissions : permissionKeys
    };

    const token = jwt.sign(payload , process.env.JWT_SECRET , {expiresIn : process.env.JWT_EXPIRES_IN || "8h"});

    await logAction({
        userId : user._id,
        action : "LOGIN",
        details : `${user.email} logged in`,
        ipAdress : req.ip
    })

    res.json({token,user:payload}) ;
    


}


module.exports = {login};