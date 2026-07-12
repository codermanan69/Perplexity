import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, replaceChatId, addNewMessage, addMessages } from "../chat.slice";
import { useDispatch } from "react-redux";


let isFetchingChats = false;

export const useChat = () => {

    const dispatch = useDispatch()


    async function handleSendMessage({ message, chatId }) {
        const isNewChat = !chatId;
        const tempChatId = isNewChat ? "temp-" + Date.now() : chatId;

        try {
            if (isNewChat) {
                // Instantly create local chat representation and show user message
                dispatch(createNewChat({
                    chatId: tempChatId,
                    title: message.substring(0, 30) || "New Chat",
                }));
                dispatch(addNewMessage({
                    chatId: tempChatId,
                    content: message,
                    role: "user",
                }));
                dispatch(setCurrentChatId(tempChatId));
            } else {
                // Instantly show user message in existing chat
                dispatch(addNewMessage({
                    chatId,
                    content: message,
                    role: "user",
                }));
            }

            dispatch(setLoading(true));
            dispatch(setError(null));

            // Call backend API
            const data = await sendMessage({ message, chatId: isNewChat ? null : chatId });
            const { chat, aiMessage } = data;

            if (isNewChat) {
                // Swap temporary ID with database ID and add AI reply
                dispatch(replaceChatId({
                    oldChatId: tempChatId,
                    newChatId: chat._id,
                    title: chat.title,
                }));
                dispatch(addNewMessage({
                    chatId: chat._id,
                    content: aiMessage.content,
                    role: aiMessage.role,
                }));
                dispatch(setCurrentChatId(chat._id));
            } else {
                // Add AI reply to existing chat
                dispatch(addNewMessage({
                    chatId,
                    content: aiMessage.content,
                    role: aiMessage.role,
                }));
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to send message";
            const actualError = error.response?.data?.error;
            
            // Pop an alert so we can instantly see what Gemini/Tavily is complaining about
            alert("BACKEND ERROR DETAILS:\n\n" + errorMsg + "\n\n" + (actualError || "No detailed error provided"));
            
            dispatch(setError(errorMsg));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetChats() {
        if (isFetchingChats) return;
        isFetchingChats = true;
        
        try {
            dispatch(setLoading(true))
            const data = await getChats()
            const { chats } = data
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[ chat._id ] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt,
                }
                return acc
            }, {})))
        } catch (error) {
            console.error("Failed to fetch chats:", error);
        } finally {
            dispatch(setLoading(false))
            isFetchingChats = false;
        }
    }

    async function handleOpenChat(chatId, chats) {

        console.log(chats[ chatId ]?.messages.length)

        if (chats[ chatId ]?.messages.length === 0) {
            const data = await getMessages(chatId)
            const { messages } = data

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        }
        dispatch(setCurrentChatId(chatId))
    }

    async function handleDeleteChat(chatId, chats) {
        try {
            dispatch(setLoading(true));
            await deleteChat(chatId);
            
            // Create a copy of chats and delete the target chatId
            const updatedChats = { ...chats };
            delete updatedChats[chatId];
            dispatch(setChats(updatedChats));
            
            // Reset currentChatId if we deleted the currently active chat
            dispatch(setCurrentChatId(null));
        } catch (error) {
            console.error("Failed to delete chat:", error);
            dispatch(setError(error.message || "Failed to delete chat"));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat
    }

}