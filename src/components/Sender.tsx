import { useEffect, useRef } from "react";

const Sender = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  const initiateConn = async () => {
    const socket = socketRef.current;

    if (!socket) {
      alert("Socket not connected");
      return;
    }

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // Handle incoming messages
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createAnswer") {
        await pc.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate") {
        await pc.addIceCandidate(message.candidate);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.send(JSON.stringify({ type: "createOffer", sdp: pc.localDescription }));
      } catch (error) {
        console.error("Error during negotiation:", error);
      }
    };

    getCameraStreamAndSend(pc);
  };

  const getCameraStreamAndSend = async (pc: RTCPeerConnection) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoElement = document.createElement("video");

      videoElement.srcObject = stream;
      videoElement.classList.add("border", "rounded");
      videoElement.play();

      document.querySelector("#pageOne")?.appendChild(videoElement);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  return (
    <div id="pageOne" className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-3xl">Sender</h1>
      <button
        onClick={initiateConn}
        className="border rounded px-3 py-1.5 text-3xl bg-black text-white border-black hover:bg-white hover:text-black transition-all ease-linear"
      >
        Start Sending
      </button>
    </div>
  );
};

export default Sender;
