import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { ADD_IMAGE_MESSAGE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";

const CaptureAudio = dynamic(() => import("../common/CaptureAudio"), {
  ssr: false,
});

function MessageBar() {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [garbPhoto, setGarbPhoto] = useState(false);
  const [showAudioRecoder, setShowAudioRecoder] = useState(false);
  const photoPickerChange = async (e) => {
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(ADD_IMAGE_MESSAGE, formData, {
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

  const emojiPickerRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "emoji-open") {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target)
        ) {
          setShowEmojiPicker(false);
        }
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  useEffect(() => {
    if (garbPhoto) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGarbPhoto(false);
        }, 1000);
      };
    }
  }, [garbPhoto]);
  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiCLick = (emoji) => {
    setMessage((prevMessage) => (prevMessage += emoji.emoji));
  };
  const handleSendMessage = async () => {
    try {
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        to: currentChatUser?.id,
        from: userInfo?.id,
        message,
      });
      console.log(data.message);
      socket.current.emit("send-msg", {
        to: currentChatUser?.id,
        from: userInfo?.id,
        message: data.message,
      });
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: { ...data.message },
        fromSelf: true,
      });
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className=" bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
      {!showAudioRecoder && (
        <>
          <div className="flex gap-6">
            <BsEmojiSmile
              title="emoji"
              className="text-panel-header-icon cursor-pointer text-xl"
              id="emoji-open"
              onClick={handleEmojiModal}
            />
            {showEmojiPicker && (
              <div
                className=" absolute bottom-24 left-16 z-40"
                ref={emojiPickerRef}
              >
                <EmojiPicker onEmojiClick={handleEmojiCLick} theme="dark" />
              </div>
            )}
            <ImAttachment
              title="attachment"
              className="text-panel-header-icon cursor-pointer text-xl"
              onClick={() => setGarbPhoto(true)}
            />
          </div>
          <div className="w-full rounded-lg h-10 items-center">
            <input
              type="text"
              placeholder="Type a message"
              className=" bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
          </div>
          <div className=" flex w-10 items-center justify-center">
            <button>
              {message.length ? (
                <MdSend
                  onClick={handleSendMessage}
                  title="send message"
                  className="text-panel-header-icon cursor-pointer text-xl"
                />
              ) : (
                <FaMicrophone
                  title="record"
                  className="text-panel-header-icon cursor-pointer text-xl"
                  onClick={() => setShowAudioRecoder(true)}
                />
              )}
            </button>
          </div>
        </>
      )}
      {garbPhoto && <PhotoPicker onChange={photoPickerChange} />}
      {showAudioRecoder && <CaptureAudio hide={setShowAudioRecoder} />}
    </div>
  );
}

export default MessageBar;
