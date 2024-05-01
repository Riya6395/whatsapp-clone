import { useStateProvider } from "@/context/StateContext";
import React, { useEffect } from "react";
import { GET_INITIAL_CONTACT_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import { reducerCases } from "@/context/constants";
import ChatLIstItem from "./ChatLIstItem";

function List() {
  const [{ userInfo, userContacts, filteredContacts }, dispatch] =
    useStateProvider();

  // console.log(filteredContacts);

  useEffect(() => {
    const getContacts = async () => {
      try {
        const {
          data: { users, onlineUsers },
        } = await axios(`${GET_INITIAL_CONTACT_ROUTE}/${userInfo.id}`);

        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers,
        });
        dispatch({
          type: reducerCases.SET_USER_CONTACTS,
          userContacts: users,
        });
      } catch (error) {
        console.log(error);
      }
    };
    if (userInfo?.id) getContacts();
  }, [userInfo]);
  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {filteredContacts && filteredContacts.length > 0
        ? filteredContacts.map((contact) => (
            <ChatLIstItem data={contact} key={contact.id} />
          ))
        : userContacts.map((contact) => (
            <ChatLIstItem data={contact} key={contact.id} />
          ))}
    </div>
  );
}

export default List;
