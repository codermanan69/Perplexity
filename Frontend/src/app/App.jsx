import { RouterProvider } from 'react-router';
import { router } from './app.routes';
import { useAuth } from "../features/auth/hook/useAuth"
import { useEffect } from "react"

function App(){ 
   
const auth = useAuth()
useEffect(() => {
  auth.handlegetMe();
  
  // Theme initialization
  const theme = localStorage.getItem('theme') || 'dark';
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
},[])

  return (
    <RouterProvider router={router} />
  )
}

export default App
