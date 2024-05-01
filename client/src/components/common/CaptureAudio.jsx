import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { ADD_AUDIO_MESSAGE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

function CaptureAudio({ hide }) {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveForm, setWaveForm] = useState(null);
  const [renderedAudio, setRenderedAudio] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currPlaybackTime, setCurrPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const audioRef = useRef(null);
  const mediaRecoderRef = useRef(null);
  const waveFormRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prevDuration) => {
          setTotalDuration(prevDuration + 1);
          return prevDuration + 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
      responsive: true,
    });
    setWaveForm(wavesurfer);
    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  useEffect(() => {
    if (waveForm) handleStartRecording();
  }, [waveForm]);

  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        const mediaRecoder = new MediaRecorder(stream);
        mediaRecoderRef.current = mediaRecoder;
        audioRef.current.srcObject = stream;

        const chunks = [];
        mediaRecoder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecoder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          const audioURL = URL.createObjectURL(blob);
          const audio = new Audio(audioURL);
          setRecordedAudio(audio);
          waveForm.load(audioURL);
        };
        mediaRecoder.start();
      })
      .catch((error) => {
        console.log("error on accessing the mcrophone" + error);
      });
  };
  const handleStopRecording = () => {
    if (mediaRecoderRef.current && isRecording) {
      mediaRecoderRef.current.stop();
      setIsRecording(false);
      waveForm.stop();

      const audioChunks = [];
      mediaRecoderRef.current.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecoderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "recording.mp3");
        setRenderedAudio(audioFile);
      });
    }
  };

  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrPlaybackTime(recordedAudio.currentTime);
      };
      recordedAudio.addEventListener("timeupdate", updatePlaybackTime);
      return () => {
        recordedAudio.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [recordedAudio]);

  const handlePlayRecording = () => {
    if (recordedAudio) {
      waveForm.stop();
      waveForm.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };
  const handlePauseRecording = () => {
    waveForm.stop();
    recordedAudio.pause();
    setIsPlaying(false);
  };

  const sendRecording = async () => {
    try {
      const formData = new FormData();
      formData.append("audio", renderedAudio);
      const res = await axios.post(ADD_AUDIO_MESSAGE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: userInfo.id,
          to: currentChatUser.id,
        },
      });
      if (res.status === 201) {
        socket.current.emit("send-msg", {
          to: currentChatUser?.id,
          from: userInfo?.id,
          message: res.data.message,
        });
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: { ...res.data.message },
          fromSelf: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")} `;
  };

  return (
    <div className="flex text-2xl w-full justify-end items-center">
      <div className="pt-1">
        <FaTrash className=" text-panel-header-icon" onClick={() => hide()} />
      </div>
      <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 animate-pluse w-60 text-center">
            Recording<span>{recordingDuration}s</span>
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <>
                {!isPlaying ? (
                  <FaPlay onClick={handlePlayRecording} />
                ) : (
                  <FaStop onClick={handlePauseRecording} />
                )}
              </>
            )}
          </div>
        )}
        <div className="w-60" ref={waveFormRef} hidden={isRecording} />
        {recordedAudio && isPlaying && (
          <span>{formatTime(currPlaybackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span>{formatTime(totalDuration)}</span>
        )}
        <audio ref={audioRef} hidden />
        <div className="mr-4">
          {!isRecording ? (
            <FaMicrophone
              className="text-red-500"
              onClick={handleStartRecording}
            />
          ) : (
            <FaPauseCircle
              className="text-red-500"
              onClick={handleStopRecording}
            />
          )}
        </div>
        <div>
          <MdSend
            className=" text-panel-header-icon cursor-pointer mr-4 "
            title="send"
            onClick={sendRecording}
          />
        </div>
      </div>
    </div>
  );
}

export default CaptureAudio;
