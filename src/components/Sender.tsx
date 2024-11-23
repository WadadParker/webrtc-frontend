import { useEffect, useState } from "react"

const Sender = () => {
    const [socket,setSocket] = useState<WebSocket | null>(null);

    const startSendingVideo = async () => {
        // Create an offer
        const pc = new RTCPeerConnection();
        const offer = await pc.createOffer(); // sdp
        await pc.setLocalDescription(offer);
        socket?.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription}));
    }


    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'sender'}))
        }
    },[]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-3xl">Sender</h1>
        <button 
        onClick={startSendingVideo}
        className="border rounded px-3 py-1.5 text-3xl bg-black text-white border-black hover:bg-white hover:text-black transition-all ease-linear">
            Sender
        </button>
    </div>
  )
}

export default Sender