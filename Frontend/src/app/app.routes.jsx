import { createBrowserRouter, Navigate } from 'react-router';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import Dashboard from '../features/chat/pages/Dashboard.jsx';
import VerifyEmail from '../features/auth/pages/VerifyEmail.jsx';
import Protected from '../features/auth/components/Protected.jsx';


export const router = createBrowserRouter([
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/verify-email',
        element: <VerifyEmail />
    },
    {
        path: '/',
        element: <Protected><Dashboard /></Protected> 
    },
    {
        path : '/dashboard',
        element : <Navigate to="/" replace/>
    }
]);