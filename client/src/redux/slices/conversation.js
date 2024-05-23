import { createSlice } from "@reduxjs/toolkit";
import { dispatch } from "../store";
import { faker } from "@faker-js/faker";

const user_id = window.localStorage.getItem("user")

const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: null,
    current_messages: [],
    otherUser: null,
  },
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {

      const list = action.payload.conversations.map((el) => {
        const this_user = el.participants.find((elm) => elm._id.toString() !== user_id);
        return {
          id: el._id,
          user_id: this_user._id,
          name: '${this_user.firstName} ${this_user.lastName}',
          online: this_user.status === "online",
          img: faker.image.avatar(),
          msg: faker.music.songName(),
          time: "9:36",
          unread: 0,


        }
      })

      state.direct_chat.conversations = list;
   
    },


    updateDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) => {
          if (el?.id !== this_conversation._id) {
            return el;
          } else {
            const user = this_conversation.participants.find(
              (elm) => elm._id.toString() !== user_id
            );
            return {
              id: this_conversation._id._id,
              user_id: user?._id,
              name: `${user?.firstName} ${user?.lastName}`,
              online: user?.status === "Online",
              img: faker.image.avatar(),
              msg: faker.music.songName(),
              time: "9:36",
              unread: 0,
              pinned: false,
            };
          }
        }
      );
    
    },
    addDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      const user = this_conversation.participants.find(
        (elm) => elm._id.toString() !== user_id
      );
      state.direct_chat.conversations = state.direct_chat.conversations.filter(
        (el) => el?.id !== this_conversation._id
      );
      
      state.direct_chat.conversations.push({
        id: this_conversation._id._id,
        user_id: user?._id,
        name: `${user?.firstName} ${user?.lastName}`,
        online: user?.status === "Online",
        img: faker.image.avatar(),
        msg: faker.music.songName(),
        time: "9:36",
        unread: 0,
        pinned: false,
      });

    },
    setOtherUser: (state, action) => {
      state.direct_chat.otherUser = action.payload;
    },
  },
});
export default slice.reducer;


export const fetchDirectConversations = ({ conversations }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchDirectConversations({ conversations }));
  };
  
}
export const setOtherUserAction = (otherUser) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.setOtherUser(otherUser));
  };
}


export const {setOtherUser} = slice.actions