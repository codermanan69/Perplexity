import { io }  from "socket.io-client";


export const initializedSocketConnection=() => {
    const socket = io(window.location.origin, {
  withCredentials: true,
});

    socket.on("connect", ()=>{
        console.log("socket connected")
    });

  
}