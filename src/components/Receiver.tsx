import { useEffect } from "react"

const Receiver = () => {

    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'receiver'}))
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                // create an answer
                const pc = new RTCPeerConnection();
                pc.setRemoteDescription(message.sdp);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({ type: 'createAnswer', sdp: pc.localDescription}));
            }
        }

    },[]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-3xl">Sender</h1>
        <button 
        // onClick={startSendingVideo}
        className="border rounded px-3 py-1.5 text-3xl bg-black text-white border-black hover:bg-white hover:text-black transition-all ease-linear">
            Receiver
        </button>
    </div>
  )
}

export default Receiver