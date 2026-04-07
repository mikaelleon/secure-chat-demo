export interface Conversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  online: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: "me" | "them";
  senderName: string;
  /** Set for mock/system only; live DB messages omit plaintext — derive from `decrypted` in UI. */
  original?: string;
  encrypted: string;
  decrypted: string;
  mode: "symmetric" | "asymmetric";
  shift?: number;
  timestamp: string;
  type: "message" | "system";
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  mode: "symmetric" | "asymmetric";
  original: string;
  encrypted: string;
  decrypted: string;
  shift?: number;
  partner: string;
}

export const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Alice Chen",
    initials: "AC",
    lastMessage: "The encryption key has been updated...",
    timestamp: "2:34 PM",
    online: true,
  },
  {
    id: "2",
    name: "Bob Wilson",
    initials: "BW",
    lastMessage: "Can you switch to asymmetric mode?",
    timestamp: "1:15 PM",
    online: true,
  },
  {
    id: "3",
    name: "Carol Davis",
    initials: "CD",
    lastMessage: "Got it, message received!",
    timestamp: "Yesterday",
    online: false,
  },
];

export const mockMessages: Message[] = [
  {
    id: "1",
    conversationId: "1",
    sender: "them",
    senderName: "Alice Chen",
    original: "Hey, are you using the new cipher?",
    encrypted: "Khb, duh brx xvlqj wkh qhz flskhu?",
    decrypted: "Hey, are you using the new cipher?",
    mode: "symmetric",
    shift: 3,
    timestamp: "2:30 PM",
    type: "message",
  },
  {
    id: "sys1",
    conversationId: "1",
    sender: "me",
    senderName: "System",
    original: "Switched to Symmetric mode",
    encrypted: "",
    decrypted: "",
    mode: "symmetric",
    timestamp: "2:31 PM",
    type: "system",
  },
  {
    id: "2",
    conversationId: "1",
    sender: "me",
    senderName: "You",
    original: "Yes! Caesar cipher with shift 3",
    encrypted: "Bhv! Fdhvdu flskhu zlwk vkliw 3",
    decrypted: "Yes! Caesar cipher with shift 3",
    mode: "symmetric",
    shift: 3,
    timestamp: "2:32 PM",
    type: "message",
  },
  {
    id: "3",
    conversationId: "1",
    sender: "them",
    senderName: "Alice Chen",
    original: "The encryption key has been updated successfully",
    encrypted: "Wkh hqfubswlrq nhb kdv ehhq xsgdwhg vxffhvvixoob",
    decrypted: "The encryption key has been updated successfully",
    mode: "symmetric",
    shift: 3,
    timestamp: "2:34 PM",
    type: "message",
  },
];

export const mockHistory: HistoryEntry[] = [
  {
    id: "h1",
    timestamp: "2024-01-15 14:34",
    mode: "symmetric",
    original: "The encryption key has been updated successfully",
    encrypted: "Wkh hqfubswlrq nhb kdv ehhq xsgdwhg vxffhvvixoob",
    decrypted: "The encryption key has been updated successfully",
    shift: 3,
    partner: "Alice Chen",
  },
  {
    id: "h2",
    timestamp: "2024-01-15 14:32",
    mode: "symmetric",
    original: "Yes! Caesar cipher with shift 3",
    encrypted: "Bhv! Fdhvdu flskhu zlwk vkliw 3",
    decrypted: "Yes! Caesar cipher with shift 3",
    shift: 3,
    partner: "Alice Chen",
  },
  {
    id: "h3",
    timestamp: "2024-01-15 13:15",
    mode: "asymmetric",
    original: "Can you switch to asymmetric mode?",
    encrypted: "Q2FuIHlvdSBzd2l0Y2ggdG8gYXN5bW1ldHJpYyBtb2RlPw==",
    decrypted: "Can you switch to asymmetric mode?",
    partner: "Bob Wilson",
  },
  {
    id: "h4",
    timestamp: "2024-01-14 16:42",
    mode: "symmetric",
    original: "Got it, message received!",
    encrypted: "Jrw lw, phvvdjh uhfhlyhg!",
    decrypted: "Got it, message received!",
    shift: 3,
    partner: "Carol Davis",
  },
];
