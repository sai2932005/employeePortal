
const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const requirePermission = require("../middlewares/rbac");

const {getMyApps , accessZohoApp} = require("../controllers/dashboardController");


router.use(authenticate) ; // Apply authentication middleware to all routes below   


router.get("/apps" , getMyApps) ;  
router.get("/access/:appKey" , (req,res,next) =>{
    return requirePermission(req.params.appKey)(req,res,next);
}, accessZohoApp) ;

module.exports = router ;