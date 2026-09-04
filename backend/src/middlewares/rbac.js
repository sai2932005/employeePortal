

function requirePermission(permissionKey) {
    return (req,res,next) =>{
        const userPermissions = req.user?.permissions || [];
        console.log('Required:', permissionKey);
        console.log('User has:', userPermissions);
        if(!userPermissions.includes(permissionKey)){
            return res.status(403).json({message: "Access Denied: Insufficient Permissions"});
        
    }
    next();
}


        
    
}

module.exports = requirePermission;