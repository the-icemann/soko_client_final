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
  useWebchatContext,
  WebchatProvider,
} from "@botpress/webchat";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

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

function SokoChatWidget({ onNewChat }: { onNewChat: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { userCredentials } = useWebchatContext();
  const { messages, isTyping, sendMessage, uploadFile, participants, status, saveMessageFeedback } =
    useActiveConversation();

  const token = useAuthStore((s) => s.token);

  const sentLinkRef = useRef<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "connected" || !token || !userCredentials?.userId) return;
    const key = `${userCredentials.userId}:${token}`;
    if (sentLinkRef.current === key) return;
    sentLinkRef.current = key;

    fetch("/auth/bot/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ botpress_user_id: userCredentials.userId }),
    }).catch(() => {});
  }, [status, token, userCredentials?.userId]);

  const richMessages = useMemo(
    () => enrichMessage(messages, participants, userCredentials?.userId ?? "", BOT_NAME),
    [messages, participants, userCredentials?.userId]
  );

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    // Botpress uses React's onMouseUp with window.open() — DOM property patches
    // don't stop React's delegated handler. Instead, intercept mouseup at the
    // document capture phase, which fires before React's root-container listener.
    // Botpress stores the URL only in the React onMouseUp closure and calls
    // window.open() directly — the <a> has no href. Intercept window.open
    // for the lifetime of the chat widget and route same-origin URLs in-place.
    const originalOpen = window.open.bind(window);
    window.open = (url?: string | URL, target?: string, features?: string) => {
      if (url) {
        try {
          const parsed = new URL(String(url), window.location.origin);
          if (parsed.origin === window.location.origin) {
            navigate({ to: parsed.pathname + parsed.search + parsed.hash });
            setIsOpen(false);
            return null as unknown as Window;
          }
        } catch (_e) {
          // malformed URL — fall through to original
        }
      }
      return originalOpen(url, target, features);
    };

    return () => {
      window.open = originalOpen;
    };
  }, [navigate]);

  return (
    <>
      <div ref={chatRef}>
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
          <div
            style={{
              position: "absolute",
              top: "125px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1001,
            }}
          >
            <button
              onClick={onNewChat}
              style={{
                padding: "6px 18px",
                borderRadius: "20px",
                border: "none",
                background: "#00c471",
                color: "#0b2618",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "Outfit, sans-serif",
                boxShadow: "0 2px 8px rgba(0,196,113,0.3)",
                whiteSpace: "nowrap",
              }}
            >
              New Chat
            </button>
          </div>
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
      </div>
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
  const [session, setSession] = useState(0);

  if (!clientId) return null;

  const baseKey = userId ? `soko-v2-${userId}` : "soko-v2-anon";
  const storageKey = session === 0 ? baseKey : `${baseKey}-s${session}`;

  const newChat = () => {
    localStorage.removeItem(storageKey);
    setSession((s) => s + 1);
  };

  return (
    <>
      <StylesheetProvider />
      <WebchatProvider key={storageKey} clientId={clientId} storageKey={storageKey}>
        <SokoChatWidget onNewChat={newChat} />
      </WebchatProvider>
    </>
  );
}
