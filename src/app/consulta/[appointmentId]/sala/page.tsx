"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/supabase/client";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Button, message, Spin } from "antd";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

function VideoCallUI() {
  const router = useRouter();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const handleLeaveCall = () => {
    router.back();
    message.success("Has salido de la consulta");
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <SpeakerLayout />
      <div style={{ 
        position: "fixed", 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: "20px",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        gap: "10px"
      }}>
        <CallControls onLeave={handleLeaveCall} />
      </div>
    </div>
  );
}

export default function SalaPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");
  const user = useUser();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !roomId) return;

    const initializeCall = async () => {
      try {
        // Obtener token de Stream
        const tokenResponse = await fetch("/api/video/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!tokenResponse.ok) {
          throw new Error("Error obteniendo token");
        }

        const { token } = await tokenResponse.json();

        // Crear cliente de Stream Video
        const videoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: user.id,
            name: user.email || "Usuario",
          },
          token,
        });

        setClient(videoClient);

        // Unirse al call
        const videoCall = videoClient.call("default", roomId);
        await videoCall.join({ create: true });
        setCall(videoCall);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing call:", error);
        message.error("Error al conectar con la videollamada");
        router.back();
      }
    };

    initializeCall();

    return () => {
      if (call) {
        call.leave();
      }
      if (client) {
        client.disconnectUser();
      }
    };
  }, [user, roomId]);

  if (loading || !client || !call) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "#000"
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <VideoCallUI />
      </StreamCall>
    </StreamVideo>
  );
}
