import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getUser, clearSession, hasPermission } from '../utils/auth';



const Dashboard = ()=>{

    const [apps, setApps] = useState([]);
    const navigate = useNavigate();
    const user = getUser();


    useEffect(()=>{
        api.get('/dashboard/apps').then((res)=> setApps(res.data.apps))
    },[]);

    const openApp = async(permission)=>{
        const res = await api.get(`/dashboard/access/${permission}`);
        const newTab = window.open(res.data.redirectUrl, "_blank");
        newTab.document.write('Redirecting to Zoho...');
        try {
            const res = await api.get(`/dashboard/access/${permission}`);
            newTab.location.href = res.data.redirectedUrl; 
        } catch (err) {
            newTab.close(); 
            console.error('Failed to access app:', err);
        }

    }

    return (
        <div>
            <h2 style={{textAlign:'center'}}>Welcome {user?.name} ({user?.roles?.join(", ")})</h2>
            {hasPermission('manage_users') && <button onClick={()=> navigate('/admin')}>Admin Panel</button>}
            <button onClick={()=>{clearSession(); navigate("/login")}}>Logout</button>
            <h3 style={{textAlign:'center'}}>Your Zoho apps</h3>

            {apps.length ===0 && <p>No apps are assigned to your role</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {apps.map((app) =>(
                <button key= {app.permission} onClick={()=> openApp(app.permission)}>{app.name}</button>
            ))

            }
            </div>

        </div>
    )



}

export default Dashboard;