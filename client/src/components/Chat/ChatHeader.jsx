import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { MdCall } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";

function ChatHeader() {
  const [{ currentChatUser, onlineUsers }, dispatch] = useStateProvider();
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });

  const showContexMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX - 50, y: e.pageY + 20 });
    setIsContextMenuVisible(true);
  };

  const contextMenuOptions = [
    {
      name: "EXIT",
      callback: async () => {
        dispatch({ type: reducerCases.SET_EXIT_CHAT });
      },
    },
  ];

  const handleVoiceCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "voice",
        roomId: Date.now(),
      },
    });
  };
  const handleVideoCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "video",
        roomId: Date.now(),
      },
    });
  };
  return (
    <div className=" h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background">
      <div className="flex items-center justify-center gap-5">
        <Avatar type="sm" image={currentChatUser?.profilePicture} />
        <div className="flex flex-col">
          <span className="text-primary-strong">{currentChatUser?.name}</span>
          <span className="text-secondary text-sm">
            {/* {currentChatUser?.about} */}
            {onlineUsers.includes(currentChatUser.id) ? "online" : "offline"}
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        <MdCall
          onClick={handleVoiceCall}
          className="text-panel-header-icon cursor-pointer text-xl"
        />
        <IoVideocam
          onClick={handleVideoCall}
          className="text-panel-header-icon cursor-pointer text-xl"
        />
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={() => {
            dispatch({ type: reducerCases.SET_MESSAGES_SEARCH });
          }}
        />
        <BsThreeDotsVertical
          onClick={(e) => showContexMenu(e)}
          id="context-opener"
          className="text-panel-header-icon cursor-pointer text-xl"
        />
        {isContextMenuVisible && (
          <ContextMenu
            options={contextMenuOptions}
            coordinates={contextMenuCordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
