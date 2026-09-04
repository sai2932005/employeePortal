import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getUser, clearSession, hasPermission } from '../utils/auth';



const Dashboard = ()=> {

    const [apps, setApps] = useState([]);
    const [activeApp, setActiveApp] = useState(null);
    const [appData, setAppData] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const user = getUser();


    useEffect(()=>{
        api.get('/dashboard/apps').then((res)=> setApps(res.data.apps))
    },[]);

    const openApp = async(permission, name)=> {
        setActiveApp(name);
        setLoading(true);
        setAppData(null);
        try {
        const res = await api.get(`/dashboard/access/${permission}`);
        setAppData(res.data);
        } finally {
        setLoading(false);
        }
    }

    return (
        <>
        <div style={{ maxWidth: 700, margin: '40px auto' }}>
            <h2 style={{textAlign:'center'}}>Welcome {user?.name} ({user?.roles?.join(", ")})</h2>
            {hasPermission('manage_users') && <button onClick={()=> navigate('/admin')}>Admin Panel</button>}
            <button onClick={()=>{clearSession(); navigate("/login")}}>Logout</button>
            <h3 style={{textAlign:'center'}}>Your Zoho apps</h3>

            {apps.length ===0 && <p>No apps are assigned to your role</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {apps.map((app) =>(
                <button key= {app.permission} onClick={()=> openApp(app.permission,app.name)}>{app.name}</button>
            ))}
            
        </div>
            </div>
            

            {activeApp && (
                <div style={{ marginTop: 24, padding: 16, background: '#fff', borderRadius: 8 }}>
                <h3>{activeApp}</h3>
                {loading && <p>Loading data from Zoho…</p>}
                {!loading && appData?.liveDataAvailable && Array.isArray(appData.data) && (
                    <table>
                    <thead>
                        <tr>{appData.data[0] && Object.keys(appData.data[0]).map((k) => <th key={k}>{k}</th>)}</tr>
                    </thead>
                    <tbody>
                        {appData.data.map((row, i) => (
                        <tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{String(v)}</td>)}</tr>
                        ))}
                    </tbody>
                    </table>
                )}
                {!loading && appData && !appData.liveDataAvailable && (
                    <p style={{ color: '#888' }}>Access granted — live data view not yet implemented for this app in this demo.</p>
             )}
            </div>
            )}
            </>
        

    );
}

export default Dashboard;