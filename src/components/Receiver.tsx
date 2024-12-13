import { useEffect, useRef } from "react";

const Receiver = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        startReceiving(socket);

    return () => {
        socket.close();
    };
  }, []);

  const startReceiving = (socket: WebSocket) => {
    const pc = new RTCPeerConnection();

    pc.ontrack = (event) => {
        if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createOffer") {
        await pc.setRemoteDescription(message.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: answer,
          })
        );
      } else if (message.type === "iceCandidate") {
        await pc.addIceCandidate(message.candidate);
      }
    };
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-3xl mb-4">Receiver</h1>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="border rounded"
        />
    </div>
  );
};

export default Receiver;
