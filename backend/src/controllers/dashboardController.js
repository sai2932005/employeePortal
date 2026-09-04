const {ZOHO_APP_MAP, getZohoAccessToken , fetchZohoData} = require("../services/zohoService"); 

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


const accessZohoApp = async(req, res)=> {
  const { appKey } = req.params;
  const app = ZOHO_APP_MAP[appKey];
  if (!app) return res.status(404).json({ message: 'Unknown Zoho app' });

  try {
    let data = null;
    let liveDataAvailable = false;

    try {
      data = await fetchZohoData(appKey);
      liveDataAvailable = true;
    } catch (fetchErr) {
      console.warn(`No live fetch for ${appKey}:`, fetchErr.message);
    }

    await logAction({
      userId: req.user.id,
      action: `ACCESS_${appKey.toUpperCase()}`,
      details: `${req.user.email} accessed ${app.name}`,
      ipAddress: req.ip,
    });

    res.json({
      message: `Access granted to ${app.name}`,
      appName: app.name,
      liveDataAvailable,
      data, // real Zoho records when available, null otherwise
    });
  } catch (err) {
    res.status(502).json({ message: 'Failed to reach Zoho', error: err.message });
  }
}

module.exports= {getMyApps, accessZohoApp} ;

