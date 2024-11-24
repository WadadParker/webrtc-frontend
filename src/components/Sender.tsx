import { useEffect, useState } from "react"

const Sender = () => {
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [pc,setPC] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender'
            }));
        }
    }, []);

    const initiateConn = async () => {

        if (!socket) {
            alert("Socket not found");
            return;
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createAnswer') {
                await pc.setRemoteDescription(message.sdp);
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }

        const pc = new RTCPeerConnection();
        setPC(pc);
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({
                    type: 'iceCandidate',
                    candidate: event.candidate
                }));
            }
        }

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({
                type: 'createOffer',
                sdp: pc.localDescription
            }));
        }
            
        getCameraStreamAndSend(pc);
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            const page = document.querySelector("#pageOne")
            const video = document.createElement('video');
            video.classList.add("border")
            video.classList.add("rounded")

            video.srcObject = stream;
            video.play();
            // this is wrong, should propogate via a component
            page?.appendChild(video);
            stream.getTracks().forEach((track) => {
                pc?.addTrack(track);
            });
        });
    }


    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'sender'}))
        }
        setSocket(socket)

    },[]);

  return (
    <div id="pageOne" className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-3xl">Sender</h1>
        <button 
        onClick={initiateConn}
        className="border rounded px-3 py-1.5 text-3xl bg-black text-white border-black hover:bg-white hover:text-black transition-all ease-linear">
            Sender
        </button>
    </div>
  )
}

export default Sender


// const startSendingVideo = async () => {
//     if (!socket) return;
//     // Create an offer
//     const pc = new RTCPeerConnection();
//     // We need to call the offer again n again because it would frequently change the sdp
//     pc.onnegotiationneeded = async () => {
//         const offer = await pc.createOffer(); // sdp
//         await pc.setLocalDescription(offer);
//         socket?.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription}));
//     }

//     // add a onicecandiate cb here so that whenever a new ice candidate is found, we send it to ws
//     pc.onicecandidate = (event) => {
//         console.log(event);
//         if (event.candidate) {
//             socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate}))
//         }
//     }

//     socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         if (data.type === 'createAnswer') {
//             pc.setRemoteDescription(data.sdp);
//         }
//         // Catch the iceCandidate event
//         else if(data.type === 'iceCandidate') {
//             pc.addIceCandidate(data.iceCandidate);
//         }
//     }

//     // Add a stream logic here to stream your video
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
//     pc.addTrack(stream.getVideoTracks()[0])

// }