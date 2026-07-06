import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chats: [],
        messages: [],
        loading: false,
        error: null,
    },
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
    }
});

export const { setChats, setMessages } = chatSlice.actions;
export default chatSlice.reducer;
