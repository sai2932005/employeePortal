const axios = require("axios");

let cachedToken = null ;
let tokenExpiresAt=  0 ;

const getZohoAccessToken  = async()=>{


    const now = Date.now() ;
    if(cachedToken && now < tokenExpiresAt){
        return cachedToken ; 
    }


    try{
        const response = await axios.post(`${process.env.ZOHO_ACCOUNTS_BASE_URL}/oauth/v2/token`,null,
            {
                params:{
                    refresh_token : process.env.ZOHO_REFRESH_TOKEN,
                    client_id : process.env.ZOHO_CLIENT_ID,
                    client_secret : process.env.ZOHO_CLIENT_SECRET,
                    grant_type : "refresh_token"
                },
            }
        );

        cachedToken = response.data.access_token ;

        tokenExpiresAt = now + (response.data.expires_in * 1000) - 60000 ; // Subtract 1 minute for safety
        return cachedToken ;
            
    } catch(err){
        console.error("Error fetching Zoho access token:",err.response ? err.response.data : err.message);
        throw new Error("Failed to fetch Zoho access token");
    }
}


const ZOHO_APP_MAP = {
    access_zoho_people : {name: "Zoho People" , url: process.env.ZOHO_PEOPLE_URL},
    access_zoho_crm : {name: "Zoho CRM" , url: process.env.ZOHO_CRM_URL},
    access_zoho_desk : {name: "Zoho Desk" , url: process.env.ZOHO_DESK_URL},
    access_zoho_books : {name: "Zoho Books" , url: process.env.ZOHO_BOOKS_URL}
}



async function fetchZohoData(appKey) {
  const accessToken = await getZohoAccessToken();

  // Real Zoho REST API calls, authenticated with our service-account token.
  // Only CRM is wired up as the proof-of-pattern; extending to People/Desk/Books
  // follows the same shape, just different endpoints per Zoho's API docs.

  if (appKey === 'access_zoho_crm') {
    const response = await axios.get(
      `${process.env.ZOHO_API_BASE_URL}/crm/v3/Leads`,
      {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        params: { fields: 'Last_Name,Company,Email,Lead_Status' },
      }
    );
    return response.data.data || [];
  }


  throw new Error(`Live data fetch not implemented for ${appKey}`);
}

module.exports = {getZohoAccessToken, ZOHO_APP_MAP , fetchZohoData };