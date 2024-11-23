import { useEffect } from "react"

const Receiver = () => {

    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'receiver'}))
        }
    },[]);

  return (
    <div>
        <h1 className="text-3xl">Receiver</h1>
    </div>
  )
}

export default Receiver