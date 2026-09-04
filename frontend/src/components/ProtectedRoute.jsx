import { Navigate } from 'react-router-dom';
import { getToken, hasPermission } from '../utils/auth';
 

const ProtectedRoute = ({children,requires}) =>{
    const token = getToken() ;
    if(!token) return <Navigate to="/login" replace />
    if(requires && !hasPermission){
        return <Navigate to="/dashboard" replace />
    }

    return children ;
} 

export default ProtectedRoute   