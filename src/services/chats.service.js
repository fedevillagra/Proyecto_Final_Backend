import { Chat } from "../dao/factory/factory.js";
import ChatRepository from "../repositories/chat.repository.js";

export const ChatService = new ChatRepository(new Chat());
