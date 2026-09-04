
const AuditLog = require("../models/AuditLog");


const logAction = async({userId,action,details,ipAdress}) => {
    try{
        await AuditLog.create({userId,action,details,ipAdress});

    }catch(err){
        console.error("Error logging action:",err);
    }



}


module.exports = {logAction};
