import React from "react";
import Chats from "./Chats";
import { Box, Stack, Typography } from "@mui/material";
import Conversation from "../../components/Conversation";
import { useTheme } from "@mui/material/styles";
import Contact from "../../components/Contact";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import SharedMessages from "../../components/SharedMessages";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import NoChat from "../../assets/Illustration/NoChat";
import { fetchConversationMessages, fetchConversations, fetchUserInfo } from "../../services/conversationdata";
import { useState } from "react";
import { useContext } from "react";
import conversation from "../../redux/slices/conversation";
import io from 'socket.io-client';
import { setSocketId , removeSocketId} from "../../redux/slices/socketId";
import { jwtDecode } from "jwt-decode"
import { setCurrentUserId } from "../../redux/slices/app";
import { setOtherUser } from "../../redux/slices/conversation";

const GeneralApp = () => {
  console.log("genapprend")
  //const socket = io('http://localhost:5000');
  const theme = useTheme();

  
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const currentuserId = decoded.id;
  console.log("decoded",currentuserId)

  //const currentUserId;
  var [room_id, setRoomId] = useState(null);
  const [isChatClicked, setIsChatClicked] = useState(false);
  const dispatch = useDispatch();
  const socket = io('http://localhost:5000');

  //listening for client connections
 // socket.on('connect', () => {
  //console.log('clientconnected');
  //dispatch(setSocketId(userId, socket.id));
  //console.log("sockid",socket.id)
  //socket.on('newMessage', (newMessage) => {
      //console.log("emitsocket")
      ////setMessages(prevMessages => [newMessage, ...prevMessages]);
    //});
//});

useEffect(() => {
  // Dispatch action to set current user ID
  dispatch(setCurrentUserId({ current_user_id: currentuserId }));
  console.log("storeid", currentuserId);

  // Create socket connection

  // Handle socket connection
  socket.on('connect', () => {
    console.log('clientconnected');
    dispatch(setSocketId({ userId: currentuserId, socketId: socket.id }));
    console.log("sockid", socket.id);
  });

  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log('clientdisconnected');
    dispatch(removeSocketId({ currentuserId }));
  });

  // Handle new messages
  socket.on('newMessage', (newMessage) => {
    console.log("emitsocket");
    //setMessages(prevMessages => [newMessage, ...prevMessages]);
  });

  // Clean up function to disconnect when the component unmounts
  return () => {
    socket.disconnect();
  };
}, []);

  const socketIdMap = useSelector((state) => state.socketId.socketIdMap);
  console.log("socketidmap:", socketIdMap);

  // Log the content of the socketIdMap in the console


const handleChatElementClick = (Chat_id) => {
    //setRoomId(Chat_id); // Update room_id state when a chat element is clicked
    console.log("dispatching handlechatelementclick")
    setRoomId(prevRoomId => {
    const newRoomId = Chat_id;
    // Update room_id state when a chat element is clicked
    // Do something with newRoomId here if needed
    return newRoomId;
  });
    setIsChatClicked(true);
  };

  //passing room_id to conversation
  const [user,setUser] = useState(null); 
  const result = useQuery(['conversationsAndUserInfo', currentuserId], async () => {
    
    const conversations = await fetchConversations(currentuserId);
    const otherUserIds = conversations.reduce((ids, conversation) => {
      const otherUser = conversation.members.find(memberId => memberId !== currentuserId);
      if (otherUser) {
        ids.push(otherUser);
      }
      return ids;
    }, []);

    const userInfo = await Promise.all(otherUserIds.map(id => fetchUserInfo(id)));
    const messages = await Promise.all(conversations.map(conversation => fetchConversationMessages(conversation._id)));
    const flatmessages = messages.flat()
    const sortedMessages = flatmessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log("sorted",sortedMessages);
    const mostRecentMessageChatId = sortedMessages[0].ChatId;
    console.log("mostrecent",mostRecentMessageChatId)
    setRoomId(mostRecentMessageChatId);
    return { conversations, userInfo, messages,mostRecentMessageChatId };
  });
  console.log("roomidga",room_id)
    //room_id = mostRecentMessageChatId;
    useEffect(() => {

    socket.on('newMessage', (newMessage) => {
      console.log("emitsocket")
      //setMessages(prevMessages => [newMessage, ...prevMessages]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, [room_id]);

  //getting the roomid from the redux store
  const { sidebar, chat_type} = useSelector((store) => store.app);
  //console.log("roomid from redux",room_id);
  //const room_id = null;
  
  return (
    <Stack direction='row' sx={{ width: '100%' }}>
      {/* Chats */}
      <Chats userId={currentuserId} setUser={setUser}  data={result.data} handleChatElementClick={handleChatElementClick} />

      <Box sx={{
        height: '100%', width: sidebar.open ? 'calc(100vw - 740px)' : 'calc(100vw - 420px)',
        backgroundColor: theme.palette.mode === 'light' ? '#F0F4FA' : theme.palette.background.default
      }}>
        {/* Conversation */}
        {isChatClicked && room_id !== null && chat_type === "individual" ?  <Conversation userId={currentuserId} user={user} data={result.data} /> :
          <Stack spacing={2} sx={{ height: "100%", width: "100%" }} alignItems="center" justifyContent={"center"}>
            <NoChat />
            <Typography variant="subtitle2">
              Select a conversation
            </Typography>
          </Stack>
        }
      </Box>
      {/* Contact */}
      {sidebar.open && (() => {
        switch (sidebar.type) {
          case 'CONTACT':
            return <Contact user={user} />
            
            case 'SHARED':
              return <SharedMessages />
              
              default:
                break;
              }
            })()}
    </Stack>
  );
};

const queryClient = new QueryClient();

const GeneralAppWithQueryClient = () => (
  <QueryClientProvider client={queryClient}>
    <GeneralApp />
  </QueryClientProvider>
);

export default GeneralAppWithQueryClient;