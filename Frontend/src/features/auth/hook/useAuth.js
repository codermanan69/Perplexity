import { useDispatch } from "react-redux"

import {register, login , getMe, resendVerification} from "../service/auth.api"
import { setUser, setLoading, setError } from "../auth.slice"

export function useAuth() {
    const dispatch = useDispatch() 

    async function handleRegister({email, username , password}){
        try {
            dispatch(setLoading(true))
            const data = await register({email , username , password})
            dispatch(setUser(data.user))
            return true;
        }
        catch(error) {
            console.error("Registration error details:", error.response?.data);
            dispatch(setError(error.response?.data?.message || "Registration failed"))
            return false;
        }finally{
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({email , password}){
        try{
            dispatch(setLoading(true))
            const data = await login({email , password})
            dispatch(setUser(data.user))
            return true;
        }
        catch(error){
            console.error("Login error details:", error.response?.data);
            dispatch(setError(error.response?.data?.message || "Login failed"))
            return false;
        }
        finally{
            dispatch(setLoading(false))
        }
    }

    async function handlegetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe() 
            dispatch(setUser(data.user))
        }
        catch(error){
            // Silent catch: unauthenticated initial load is not a user-facing error
        }
        finally{
            dispatch(setLoading(false))
        }
    }

    async function handleResendVerification({ email }) {
        try {
            dispatch(setLoading(true));
            await resendVerification({ email });
            return { success: true, message: "Verification email sent!" };
        } catch (error) {
            console.error("Resend error details:", error.response?.data);
            return { success: false, message: error.response?.data?.message || "Failed to resend email" };
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handlegetMe,
        handleResendVerification
    }
}