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

module.exports = {getZohoAccessToken, ZOHO_APP_MAP};