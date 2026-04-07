export type Profile = {
  id: string;
  display_name: string;
  email: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  participant_one: string;
  participant_two: string;
  created_at: string;
};

/** Row as stored in DB — ciphertext only; plaintext is never persisted. */
export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  mode: "symmetric" | "asymmetric";
  shift_key: number | null;
  encrypted_text: string;
  created_at: string;
};

export type MessageWithSender = Message & {
  sender: Profile;
};
