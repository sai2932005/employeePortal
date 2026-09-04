const express = require("express");
const router = express.Router() ;
const authenticate = require('../middlewares/auth');
const requirePermission = require("../middlewares/rbac");


const {listUsers,listRoles,createUser,assignRole,getAuditLogs,deleteUser,createRole,listPermissions} = require("../controllers/adminController");
router.use(authenticate);

router.get("/users" , requirePermission('manage_users'), listUsers) ;
router.get("/roles",requirePermission('manage_users'), listRoles) ;
router.post("/users",requirePermission("manage_users") , createUser);
router.post("/assign-role",requirePermission('manage_users') , assignRole);
router.get("/audit-logs",requirePermission('view_audit_logs'),getAuditLogs);


router.delete('/users/:userId', requirePermission('manage_users'), deleteUser);
router.post('/roles', requirePermission('manage_users'), createRole);

router.get('/permissions', requirePermission('manage_users'), listPermissions);

module.exports = router ;
