import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from '../models/chat.model.js'
import messageModel from '../models/message.model.js'


export async function sendMessage(req, res) {
    const startTime = performance.now();
    const { message, chat: chatId } = req.body;
    let title = null, chat = null;
    let titleTime = 0;
    let aiTime = 0;

    let activeChatId = chatId;

    if (!chatId) {
        chat = await chatModel.create({
            user: req.user.id,
            title: message.substring(0, 50) || 'New Chat'
        });
        activeChatId = chat._id;
    }

    const userMessage = await messageModel.create({
        chat: activeChatId,
        content: message,
        role: "user"
    })

    const messages = await messageModel.find({ chat: activeChatId })

    const aiStart = performance.now();
    const titlePromise = !chatId ? generateChatTitle(message) : Promise.resolve(null);
    const responsePromise = generateResponse(messages);

    const [result, generatedTitle] = await Promise.all([
        responsePromise,
        titlePromise
    ]);
    aiTime = performance.now() - aiStart;

    const aiMessage = await messageModel.create({
        chat : activeChatId,
        content : result,
        role : "ai"
    })

    if (generatedTitle) {
        title = generatedTitle;
        chat.title = generatedTitle;
        await chat.save();
    }

    const endTime = performance.now();
    const totalBackendTime = endTime - startTime;

    res.status(201).json({
        aiMessage: result,
        title,
        chat,
        aiMessage,  
        timings: {
            aiProviderWait: aiTime,
            backendExecution: totalBackendTime,
            dbOperations: totalBackendTime - aiTime
        }
    })
}

export async function getChats(req, res){
    const user = req.user

    const chats = await chatModel.find({user: user.id})

    res.status(200).json({
        message : "chats fetched successfully",
        chats,
    })
}

export async function getMessages(req,res){
    const { chatId } = req.params

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id,
    }) 

    if(!chat){
        return res.status(404).json({
          message : "chat not found"  
        })
    }

    const messages = await messageModel.find({
        chat : chatId
    })

    res.status(200).json({
        message : "Messages retrived successfully"
        ,messages,
    })
}

export async function deleteChat(req, res ){
    const { chatId } = req.params

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id,
    })

    await messageModel.deleteMany({
        chat : chatId
    })

    if(!chat){
        return res.status(404).json({
            message : "chat not found"
        })
    }
    res.status(200).json({
        message: "Chat deleted successfully"
    })
}

