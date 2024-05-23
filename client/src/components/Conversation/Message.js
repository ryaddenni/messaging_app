import React from 'react';
import { Box, Stack } from '@mui/material';
import { DocMsg, LinkMsg, MediaMsg, TextMsg , ReplyMsg, TimeLine } from './MsgTypes';
import {Chat_History} from '../../data'
import { fetchConversationMessages} from '../../services/conversationdata';
import { useQuery} from 'react-query';
import { useEffect, useState,useRef } from 'react';
import { useSelector } from 'react-redux';
const Message = ({ user,menu, data,selectedRoomId }) => {
  const userId = "6626b9ee6bd62e977623db98";
  const room_id = useSelector((state) => state.app.room_id);
  console.log("displayingroomid",room_id);
  console.log("msgrendtest")
  console.log("userfrommessage",user);
  console.log("msgroomid",room_id);
  
  
  const [messages_in_conversation, setMessagesInConversation] = useState(null);
  // reminder to put everything inside a usequery
  useEffect(() => {
    if (room_id) {
      fetchConversationMessages(room_id)
        .then(messages => {
          console.log("fetching from room id:", room_id);
          console.log("chat_history", messages);
          setMessagesInConversation(messages);
          console.log('convmsg',messages_in_conversation)
        });
    }
  }, [room_id]);

  //const { data: result, isLoading } = useQuery(['messages', room_id], () => fetchConversationMessages(room_id), {
    //enabled: !!room_id,
  //});
  const messageListRef = useRef(null);

  
    useEffect(() => {
      // Scroll to the bottom of the message list when new messages are added
      messageListRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

  
  
  return (
    <Box p={3}>
        <Stack  ref={messageListRef} spacing={3}>
            {messages_in_conversation && messages_in_conversation.map((message) => (
          <TextMsg
              key={message._id}
            el={{
              message: message.Content, 
              incoming: message.SenderId !== userId
              
            }}
            menu={menu}
          />
        ))}
        </Stack>
    </Box>
  )
}

export default Message;
