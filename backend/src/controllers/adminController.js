
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

const Permission = require('../models/Permission');
const { logAction } = require('../services/auditService');



const listPermissions= async(req, res)=> {
  const permissions = await Permission.find();
  res.json({ permissions });
}




const listUsers = async(req,res) =>{
    const users = await User.find().select('name email roleIds').populate('roleIds', 'name');
    res.json({users});
}

const listRoles = async(req,res) =>{
    const roles = await Role.find() ;
    res.json({roles});
}

const deleteUser = async(req, res)=> {
  const { userId } = req.params;
  const user = await User.findByIdAndDelete(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await logAction({
    userId: req.user.id,
    action: 'USER_DELETED',
    details: `${req.user.email} deleted user ${user.email}`,
    ipAddress: req.ip,
  });

  res.json({ message: `User ${user.email} deleted` });
}


const createRole= async(req, res) => {
  const { name, permissionKeys } = req.body;
  if (!name || !Array.isArray(permissionKeys)) {
    return res.status(400).json({ message: 'name and permissionKeys[] are required' });
  }

  const existing = await Role.findOne({ name });
  if (existing) return res.status(409).json({ message: 'Role already exists' });

  const role = await Role.create({ name, permissionKeys });

  await logAction({
    userId: req.user.id,
    action: 'ROLE_CREATED',
    details: `${req.user.email} created role '${name}' with permissions: ${permissionKeys.join(', ')}`,
    ipAddress: req.ip,
  });

  res.status(201).json(role);
}



const createUser = async(req,res)=>{
    const {name,email,password , roleIds} = req.body ;
    if(!name || !email || !password){
        return res.status(400).json({ message: 'name, email, password are required' })
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({name,email,hashedPassword,roleIds: roleIds || []});


    await logAction({
        userId : req.user.id ,
        action: "USER_CREATED",
        details : `${req.user.email} created user ${email}`,
        ipAdress : req.ip ,

    });
    res.status(201).json({id:user._id , name: user.name , email:user.email});

}

const assignRole = async(req,res) =>{
    const {userId,roleId} = req.body ;
    const user = await User.findById(userId);
    const role = await Role.findById(roleId) ;
    if(!user || !role) return res.status(404).json({message:"User or Role not found"});
    if(!user.roleIds.includes(roleId)){
        user.roleIds.push(roleId);
        await user.save() ;
    }

    await logAction({
        userId  : req.user.id ,
        action: "ROLE_ASSIGNED",
        details : `${req.user.email} assigned role ${role.name} to user #${userId}` ,
        ipAdress : req.ip ,
    });
    res.json({message: `Role '${role.name}' assigned to user #$(userId)`});

}

const getAuditLogs = async(req,res) =>{
    const logs = await AuditLog.find().sort({createdAt : -1}).limit(200);
    res.json({logs});
}

module.exports = {listRoles,listUsers,createUser ,deleteUser, createRole ,assignRole,getAuditLogs,listPermissions}