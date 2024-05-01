import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage }) {
  const [hover, setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });

  const [garbPhoto, setGarbPhoto] = useState(false);
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);
  const [showPhotoLib, setShowPhotoLib] = useState(false);
  const showContexMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
  };

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

  const contextMenuOptions = [
    {
      name: "Take a picture",
      callback: () => {
        setShowCapturePhoto(true);
      },
    },
    {
      name: "Choose from library",
      callback: () => {
        setShowPhotoLib(true);
      },
    },
    {
      name: "Upload photo",
      callback: () => {
        setGarbPhoto(true);
      },
    },
    {
      name: "Remove picture",
      callback: () => {
        setImage("/default_avatar.png");
      },
    },
  ];

  const photoPickerChange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const data = document.createElement("img");
    reader.onload = function (event) {
      data.src = event.target.result;
      data.setAttribute("data-src", event.target.result);
    };
    reader.readAsDataURL(file);
    setTimeout(() => {
      // console.log(data.src);
      setImage(data.src);
    }, 100);
  };

  return (
    <>
      <div className="flex items-center justify-start">
        {type === "sm" && (
          <div className="relative h-10 w-10">
            <Image src={image} alt="avatar" className="rounded-full" fill />
          </div>
        )}
        {type === "lg" && (
          <div className="relative h-14 w-14">
            <Image src={image} alt="avatar" className="rounded-full" fill />
          </div>
        )}
        {type === "xl" && (
          <div
            className="relative cursor-pointer z-0"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div
              className={`z-10 bg-photopicker-overlay-background h-60 w-60 absolute top-0 left-0 flex items-center rounded-full justify-center flex-col text-center gap-2
              ${hover ? "visible" : "hidden"}`}
              id="context-opener"
              onClick={(e) => showContexMenu(e)}
            >
              <FaCamera
                className="text-2xl"
                id="context-opener"
                onClick={(e) => showContexMenu(e)}
              />
              <span id="context-opener" onClick={(e) => showContexMenu(e)}>
                Change <br /> profile photo
              </span>
            </div>
            <div className="flex items-center justify-center h-60 w-60 ">
              <Image src={image} alt="avatar" className="rounded-full" fill />
            </div>
          </div>
        )}
      </div>
      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          coordinates={contextMenuCordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}
      {showCapturePhoto && (
        <CapturePhoto setImage={setImage} hide={setShowCapturePhoto} />
      )}
      {showPhotoLib && (
        <PhotoLibrary setImage={setImage} hidePhotoLib={setShowPhotoLib} />
      )}
      {garbPhoto && <PhotoPicker onChange={photoPickerChange} />}
    </>
  );
}

export default Avatar;
