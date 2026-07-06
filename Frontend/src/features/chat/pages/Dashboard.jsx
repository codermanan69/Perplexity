import React,{useEffect} from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../../auth/hook/useChat'

const Dashboard = () => {

  const chat = useChat()

  const { user } = useSelector(state => state.auth)
  
  
  useEffect(()=>{
    chat.initializedSocketConnection();
  },[])
  console.log(user);
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard