import "@/styles/sokobot.css";

import {
  Composer,
  type Configuration,
  Container,
  enrichMessage,
  Fab,
  Header,
  MessageList,
  StylesheetProvider,
  useActiveConversation,
  useUser,
  useWebchatContext,
  WebchatProvider,
} from "@botpress/webchat";
import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/store/auth-store";

const clientId = import.meta.env.VITE_BOTPRESS_CLIENT_ID as string | undefined;

const BOT_NAME = "SokoBot";
const BOT_DESCRIPTION = "Your Soko marketplace assistant — find produce, check prices, get help.";

const headerConfig: Pick<
  Configuration,
  | "botName"
  | "botDescription"
  | "email"
  | "phone"
  | "privacyPolicy"
  | "website"
  | "termsOfService"
  | "botAvatar"
  | "soundEnabled"
> = {
  botName: BOT_NAME,
  botDescription: BOT_DESCRIPTION,
};

function SokoChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const { updateUser } = useUser();
  const { userCredentials } = useWebchatContext();
  const { messages, isTyping, sendMessage, uploadFile, participants, status, saveMessageFeedback } =
    useActiveConversation();

  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const userRole = useAuthStore((s) => s.user?.role);

  // Sync Soko auth into Botpress user attributes so the bot can make authenticated API calls
  useEffect(() => {
    if (!updateUser) return;
    if (token && userId && userRole) {
      updateUser({
        attributes: {
          sokoToken: token,
          sokoUserId: userId,
          sokoRole: userRole,
        },
      }).catch(() => {});
    }
  }, [token, userId, userRole, updateUser]);

  const richMessages = useMemo(
    () => enrichMessage(messages, participants, userCredentials?.userId ?? "", BOT_NAME),
    [messages, participants, userCredentials?.userId]
  );

  return (
    <>
      <Container
        connected={status === "connected"}
        uploadFile={uploadFile}
        style={{
          width: "400px",
          height: "600px",
          display: isOpen ? "flex" : "none",
          position: "fixed",
          bottom: "90px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <Header closeWindow={() => setIsOpen(false)} configuration={headerConfig} />
        <MessageList
          messages={richMessages}
          isTyping={isTyping}
          botName={BOT_NAME}
          botDescription={BOT_DESCRIPTION}
          addMessageFeedback={saveMessageFeedback}
        />
        <Composer
          connected={status === "connected"}
          sendMessage={sendMessage}
          uploadFile={uploadFile}
        />
      </Container>
      <Fab
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          width: "64px",
          height: "64px",
        }}
      />
    </>
  );
}

export function SokoWebchat() {
  const userId = useAuthStore((s) => s.user?.id);

  if (!clientId) return null;

  const storageKey = userId ? `soko-${userId}` : "soko-anon";

  return (
    <>
      <StylesheetProvider />
      <WebchatProvider key={storageKey} clientId={clientId} storageKey={storageKey}>
        <SokoChatWidget />
      </WebchatProvider>
    </>
  );
}
