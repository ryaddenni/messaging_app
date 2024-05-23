import { Box, Fab, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import React, { useRef, useState } from 'react';
import { styled, useTheme } from "@mui/material/styles";
import { LinkSimple, PaperPlaneTilt, Smiley, Camera, File, Image, Sticker, User } from 'phosphor-react';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { socket } from "../../socket";
import { Socket } from 'socket.io-client';
import { useSelector } from "react-redux";
import { useMutation } from 'react-query';
import { jwtDecode } from 'jwt-decode';
const userId ="6626b9ee6bd62e977623db98";


const ReceivertmpId = "6626bb106bd62e977623dba2";
const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    paddingTop: '12px',
    paddingBottom: '12px',
  }
}));



const ChatInput = ({ openPicker, setOpenPicker, setValue, value, inputRef }) => {
  

  const [openAction, setOpenAction] = useState(false);
  return (
    <StyledInput inputRef={inputRef}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }} fullWidth placeholder='Write a message...' variant='filled' InputProps={{
        disableUnderline: true,
        startAdornment:
          <Stack sx={{ width: 'max-content' }}>
            <Stack sx={{ position: 'relative', display: openAction ? 'inline-block' : 'none' }}>
              
            </Stack>
            <InputAdornment>
              <IconButton onClick={() => {
                setOpenAction((prev) => !prev)
              }}>
                <LinkSimple />
              </IconButton>
            </InputAdornment>
          </Stack>
        ,
        endAdornment: <InputAdornment>
          <IconButton onClick={() => {
            setOpenPicker(!openPicker);
          }}>
            <Smiley />
          </IconButton>
        </InputAdornment>
      }} />
  )
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
}

const Footer = ({user}) => {
  const theme = useTheme();
  console.log("footer rendered");
  //const { current_conversation } = useSelector((state) => state.conversation.direct_chat);
  //const { otherUser } = useSelector((state) => state.conversation.direct_chat);
  const { current_conversation, otherUser } = useSelector((state) => state.conversation.direct_chat);
  const { room_id } = useSelector((state) => state.app);
  console.log("otheruseridfooter",otherUser);
  
  const user_id = window.localStorage.getItem("user_id");
  const [openPicker, setOpenPicker] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  //handle emoji click
  function handleEmojiClick(emoji) {
    const input = inputRef.current;

    if (input) {
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;

      setValue(
        value.substring(0, selectionStart) +
        emoji +
        value.substring(selectionEnd)
      );

      // Move the cursor to the end of the inserted emoji
      input.selectionStart = input.selectionEnd = selectionStart + 1;
    }
  }

  const sendMessageMutation = useMutation(message =>
    fetch('http://localhost:5000/conversations/sendmessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MjZiOWVlNmJkNjJlOTc3NjIzZGI5OCIsImlhdCI6MTcxNDY3Mjk2Nn0.nTYEUxEmAQ8Ciufzz2dIl6BWD4lik3TnFvG4LZcKiYs'
      },
      body: JSON.stringify(message),
    })
  );
  // map of userid -> socketid
  const socketIdMap = useSelector((state) => state.socketId.socketIdMap);

  const sendMessage = () => {
    console.log("sent", value);

    // Emit the message using socket
    //socket.emit("text_message", {
     // message: linkify(value),
     // conversation_id: room_id,
     // from: user_id,
     // to: current_conversation.user_id,
    //});
    const receiverSocketId = socketIdMap[otherUser];

    if (receiverSocketId) {
    socket.emit("message_sent", {
      to: receiverSocketId,
      message: message
    });
  }

    const message = {
      SenderId: userId,
      Content: value,
      ReceiverId: user._id,
    };
    console.log("messageobject", message);

    // Send the message to the server
    sendMessageMutation.mutate(message);
    //get socket id of receiver if he's online 
    // Send the message to the server
    //sendMessageMutation.mutate({
     // SenderId: user_id,
     // Content: value,
     // ReceiverId: current_conversation.user_id,
    //});

    // Clear the input after sending the message
    setValue("");
  };

  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        backgroundColor:
          theme.palette.mode === "light" ? "#F8FAFF" : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
      }}
    >
      <Stack direction="row" alignItems={"center"} spacing={3}>
        <Stack sx={{ width: "100%" }}>
          {/* Chat Input */}
          <Box
            sx={{
              display: openPicker ? "inline" : "none",
              zIndex: 10,
              position: "fixed",
              bottom: 81,
              right: 100,
            }}
          >
            <Picker
              theme={theme.palette.mode}
              data={data}
              onEmojiSelect={(emoji) => {
                handleEmojiClick(emoji.native);
              }}
            />
          </Box>
          <ChatInput
            inputRef={inputRef}
            value={value}
            setValue={setValue}
            openPicker={openPicker}
            setOpenPicker={setOpenPicker}
          />
        </Stack>

        <Box
          sx={{
            height: 48,
            width: 48,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1.5,
          }}
        >
          <Stack
            sx={{
              height: "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton onClick={sendMessage}>
              <PaperPlaneTilt color="#fff" />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export default Footer;
