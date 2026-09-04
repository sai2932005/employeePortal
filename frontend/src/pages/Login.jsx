import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { saveSession } from '../utils/auth';



const Login = ()=>{
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error,setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setError('');

        try{
            const res = await api.post("/auth/login" , {email,password});
            saveSession(res.data.token,res.data.user);
            navigate('/dashboard') ;


        }catch(err){
            setError(err?.response?.data?.message || "Login Failed")
        }

    }


    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '80px auto' }}>
            <h2>Employee Portal Login</h2>
            <input placeholder='Enter Your Email' value={email} onChange = {(e)=> setEmail(e.target.value)} required/>  <br/> <br/>
            <input placeholder='Enter Your Password' value={password} onChange={(e)=>setPassword(e.target.value)} required /> <br/> <br/>

            {error && <p style ={{color:"red"}}>{error}</p>}
            <button type="submit"> Login</button>



        </form>
    )




}


export default Login ;