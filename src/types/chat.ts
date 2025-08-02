export interface Message {
  _id: string;
  senderId: { _id: string; name: string };
  content: string;
  timestamp: string;
  messageType: string;
}

export interface Chat {
  _id: string;
  participants: Array<{ _id: string; name: string; email: string }>;
  messages: Message[];
  lastActivity: string;
  sessionId?: { _id: string; skillName: string; status: string };
}
