import { useEffect } from "react"

const Receiver = () => {
    
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        startReceiving(socket);
    }, []);

    function startReceiving(socket: WebSocket) {
        const page = document.querySelector("#page")
        const video = document.createElement('video');
        video.classList.add("border")
        video.classList.add("rounded")
        page?.appendChild(video);

        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            video.srcObject = new MediaStream([event.track]);
            video.play();
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }
    }

  return (
    <div id="page" className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-3xl">Receiver</h1>
        {/* <video ref={videoRef} autoPlay playsInline className="border rounded"></video> */}
        {/* <button 
        // onClick={startSendingVideo}
        className="border rounded px-3 py-1.5 text-3xl bg-black text-white border-black hover:bg-white hover:text-black transition-all ease-linear">
            Receiver
        </button> */}
    </div>
  )
}

export default Receiver