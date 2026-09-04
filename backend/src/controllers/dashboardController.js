const {ZOHO_APP_MAP, getZohoAccessToken} = require("../services/zohoService"); 

const {logAction} = require("../services/auditService");




const getMyApps =  (req,res)=>{
    const userPermissions = req.user.permissions ||[] ;
    const apps = userPermissions
    .filter((key) => ZOHO_APP_MAP[key])
    .map((key)=> ({
        permission : key , ...ZOHO_APP_MAP[key]
    })) ;

    res.json({apps}) ;

} 



const accessZohoApp = async (req,res)=>{

    const {appKey} = req.params ;
    const app = ZOHO_APP_MAP[appKey] ;
    if(!app) return res.status(404).json({message: "App not found"}) ;

    try{
        const accessToken = await getZohoAccessToken() ; 

        await logAction({
            userId : req.user.id ,
            action : `ACCESS_${appKey.toUpperCase()}`,
            details : `${req.user.email} accessed ${app.name}`,
            ipAdress : req.ip

        });

        res.json({
            message : `Access granted to ${app.name}`,
            redirectedUrl :app.url ,
            tokenAcquired : Boolean(accessToken) 

        }) ; 

    }catch(err){
        res.status(502).json({message: "Failed to reach Zoho",error :err.message}) ;

    }



}

module.exports= {getMyApps, accessZohoApp} ;

