import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MdOutlineCallEnd } from "react-icons/md";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishSteam, setPublishSteam] = useState(undefined);

  useEffect(() => {
    if (data.type === "out-going") {
      socket.current.on("accept-call", () => {
        setCallAccepted(true);
      });
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { token: returnedToken },
        } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
        setToken(returnedToken);
      } catch (error) {
        console.log(error);
      }
    };
    getToken();
  }, [callAccepted]);

  useEffect(() => {
    const startCall = async () => {
      import("zego-express-engine-webrtc").then(
        async ({ ZegoExpressEngine }) => {
          const zg = new ZegoExpressEngine(
            process.env.NEXT_PUBLIC_ZEGO_APP_ID,
            process.env.NEXT_PUBLIC_ZEGO_SERVER_ID
          );
          setZgVar(zg);
          zg.on(
            "roomStreamUpdate",
            async (roomID, updateType, streamList, extendedData) => {
              if (updateType === "ADD") {
                const rmvideo = document.getElementById("remote-video");
                const vd = document.createElement(
                  data.callType === "video" ? "video" : "audio"
                );
                vd.id = streamList[0].streamID;
                vd.autoplay = true;
                vd.playsInline = true;
                vd.muted = false;
                if (rmvideo) {
                  rmvideo.appendChild(vd);
                }
                zg.startPlayingStream(streamList[0].streamID, {
                  audio: true,
                  video: true,
                }).then((stream) => (vd.srcObject = stream));
                
              } else if (
                updateType === "DELETE" &&
                zg &&
                localStream &&
                streamList[0].streamID
              ) {
                zg.destroyStream(localStream);
                zg.stopPublishingStream(streamList[0].streamID);
                zg.logoutRoom(data.roomId.toString());
                dispatch({ type: reducerCases.END_CALL });
              }
            }
          );
          await zg.loginRoom(
            data.roomId.toString(),
            token,
            { userID: userInfo.id.toString(), userName: userInfo.name },
            { userUpdate: true }
          );
          const localStream = await zg.createStream({
            camera: {
              audio: true,
              video: data.callType === "video" ? true : false,
            },
          });
          const localVideo = document.getElementById("local-video");
          const videoElement = document.createElement(
            data.callType === "video" ? "video" : "audio"
          );
          videoElement.id = "video-local-zego";
          videoElement.className = "h-28 w-32";
          videoElement.autoplay = true;
          videoElement.muted = false;
          videoElement.playsInline = true;
          localVideo.appendChild(videoElement);
          const td = document.getElementById("video-local-zego");
          td.srcObject = localStream;
          const streamID = "758" + Date.now();
          setPublishSteam(streamID);
          setLocalStream(localStream);
          zg.startPublishingStream(streamID, localStream);
        }
      );
    };
    if (token) {
      startCall();
    }
  }, [token]);

  const endcall = () => {
    const id = data.id;
    if (zgVar && localStream && publishSteam) {
      zgVar.distroyStream(localStream);
      zgVar.stopPublishingStream(publishSteam);
      zgVar.logoutRoom(data.roomId.toString());
    }
    if (data.callType === "voice") {
      socket.current.emit("reject-voice-call", {
        from: id,
      });
    } else {
      socket.current.emit("reject-video-call", {
        from: id,
      });
    }
    dispatch({ type: reducerCases.END_CALL });
  };
  return (
    <div className=" border-conversation-border border-1 w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg">
          {callAccepted && data.callType !== "video"
            ? "On going call"
            : "calling"}
        </span>
      </div>
      {!callAccepted && data.callType !== "audio" && (
        <div className="my-24">
          <Image
            src={data.profilePicture}
            alt="avatar"
            height={300}
            width={300}
            className=" rounded-full"
          />
        </div>
      )}
      <div className="my-5 relative" id="remote-video">
        <div className=" absolute bottom-5 right-5" id="local-video"></div>
      </div>
      <div className="h-16 w-16 bg-red-600 items-center flex justify-center rounded-full">
        <MdOutlineCallEnd
          className="text-3xl cursor-pointer"
          onClick={endcall}
        />
      </div>
    </div>
  );
}

export default Container;
