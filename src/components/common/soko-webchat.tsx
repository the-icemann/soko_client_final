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
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

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

const FAB_SIZE = 64;
const FAB_MARGIN = 12; // min distance from viewport edge
const STORAGE_KEY = "soko-fab-position";

type FabSide = "left" | "right";

interface FabPosition {
  side: FabSide;
  /** Distance from the bottom of the viewport (px). Clamped on load. */
  bottom: number;
}

function loadFabPosition(): FabPosition {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FabPosition;
      if (
        (parsed.side === "left" || parsed.side === "right") &&
        typeof parsed.bottom === "number"
      ) {
        return parsed;
      }
    }
  } catch (_) {
    // ignore
  }
  return { side: "right", bottom: 20 };
}

function saveFabPosition(pos: FabPosition) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch (_) {
    // ignore
  }
}

function SokoChatWidget({ onNewChat }: { onNewChat: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Draggable FAB state ──────────────────────────────────────────────────
  const [fabPos, setFabPos] = useState<FabPosition>(loadFabPosition);
  // While dragging we track absolute x/y for smooth movement
  const [dragging, setDragging] = useState(false);
  const [dragXY, setDragXY] = useState<{ x: number; y: number } | null>(null);
  const dragStart = useRef<{
    pointerX: number;
    pointerY: number;
    fabX: number;
    fabY: number;
  } | null>(null);
  const hasDragged = useRef(false);
  const fabWrapRef = useRef<HTMLDivElement>(null);

  // Bottom offset that accounts for the mobile bottom nav
  const defaultBottom = isMobile ? 80 : 20;

  const clampBottom = useCallback((bottom: number) => {
    const maxBottom = window.innerHeight - FAB_SIZE - FAB_MARGIN;
    return Math.max(FAB_MARGIN, Math.min(bottom, maxBottom));
  }, []);

  // Resolve the FAB's fixed left/right CSS value for the snapped position
  function fabEdgeStyle(pos: FabPosition): React.CSSProperties {
    const edgeDist = FAB_MARGIN + (isMobile ? 8 : 8); // consistent margin from edge
    if (pos.side === "right") return { right: `${edgeDist}px`, left: "unset" };
    return { left: `${edgeDist}px`, right: "unset" };
  }

  // During drag, compute pixel position from dragXY
  function fabDragStyle(): React.CSSProperties {
    if (!dragXY) return {};
    return {
      left: `${dragXY.x}px`,
      top: `${dragXY.y}px`,
      right: "unset",
      bottom: "unset",
    };
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fabX = fabPos.side === "right" ? vw - FAB_SIZE - (FAB_MARGIN + 8) : FAB_MARGIN + 8;
      const fabY = vh - clampBottom(fabPos.bottom) - FAB_SIZE;

      dragStart.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        fabX,
        fabY,
      };
      hasDragged.current = false;

      const onMove = (ev: PointerEvent) => {
        if (!dragStart.current) return;
        const dx = ev.clientX - dragStart.current.pointerX;
        const dy = ev.clientY - dragStart.current.pointerY;

        if (!hasDragged.current && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        hasDragged.current = true;

        const newX = Math.max(
          FAB_MARGIN,
          Math.min(dragStart.current.fabX + dx, vw - FAB_SIZE - FAB_MARGIN)
        );
        const newY = Math.max(
          FAB_MARGIN,
          Math.min(dragStart.current.fabY + dy, vh - FAB_SIZE - FAB_MARGIN)
        );

        setDragging(true);
        setDragXY({ x: newX, y: newY });
      };

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);

        if (!hasDragged.current) {
          // It was a tap/click — toggle chat
          setDragging(false);
          setDragXY(null);
          setIsOpen((o) => !o);
          return;
        }

        // Snap to nearest horizontal edge
        const currentX = dragStart.current!.fabX + (ev.clientX - dragStart.current!.pointerX);
        const currentY = dragStart.current!.fabY + (ev.clientY - dragStart.current!.pointerY);
        const clampedX = Math.max(FAB_MARGIN, Math.min(currentX, vw - FAB_SIZE - FAB_MARGIN));
        const clampedY = Math.max(FAB_MARGIN, Math.min(currentY, vh - FAB_SIZE - FAB_MARGIN));

        const side: FabSide = clampedX + FAB_SIZE / 2 > vw / 2 ? "right" : "left";
        const bottom = vh - clampedY - FAB_SIZE;
        const newPos: FabPosition = { side, bottom: clampBottom(bottom) };

        saveFabPosition(newPos);
        setFabPos(newPos);
        setDragging(false);
        setDragXY(null);
        dragStart.current = null;
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [fabPos, clampBottom]
  );

  // ── Auth / conversation wiring (unchanged) ───────────────────────────────
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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
          // malformed URL — fall through to original open
        }
      }
      return originalOpen(url, target, features);
    };
    return () => {
      window.open = originalOpen;
    };
  }, [navigate]);

  // ── Chat container positioning relative to FAB ───────────────────────────
  // Place the chat window on whichever side has more room
  const chatContainerStyle = (): React.CSSProperties => {
    const edgeDist = FAB_MARGIN + 8;
    const bottomOffset = clampBottom(fabPos.bottom) + FAB_SIZE + 8;

    const base: React.CSSProperties = {
      width: isMobile ? "calc(100vw - 16px)" : "400px",
      height: isMobile ? "calc(100dvh - 220px)" : "600px",
      display: isOpen ? "flex" : "none",
      position: "fixed",
      bottom: `${bottomOffset}px`,
      zIndex: 1000,
    };

    if (dragging && dragXY) {
      // While dragging, keep chat anchored to saved position
      return {
        ...base,
        ...(fabPos.side === "right" ? { right: `${edgeDist}px` } : { left: `${edgeDist}px` }),
      };
    }

    return {
      ...base,
      ...(fabPos.side === "right" ? { right: `${edgeDist}px` } : { left: `${edgeDist}px` }),
    };
  };

  return (
    <>
      <div ref={chatRef}>
        <Container
          connected={status === "connected"}
          uploadFile={uploadFile}
          style={chatContainerStyle()}
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

      {/* Draggable FAB wrapper */}
      <div
        ref={fabWrapRef}
        onPointerDown={onPointerDown}
        style={{
          position: "fixed",
          width: `${FAB_SIZE}px`,
          height: `${FAB_SIZE}px`,
          zIndex: 1001,
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          // Snap-state uses bottom/side; drag-state uses top/left
          ...(dragging && dragXY
            ? fabDragStyle()
            : {
                bottom: `${clampBottom(fabPos.bottom)}px`,
                ...fabEdgeStyle(fabPos),
              }),
          // Smooth snap animation — disabled while dragging
          transition: dragging
            ? "none"
            : "left 0.25s cubic-bezier(0.34,1.56,0.64,1), right 0.25s cubic-bezier(0.34,1.56,0.64,1), bottom 0.2s ease",
        }}
      >
        <Fab
          onClick={() => {
            // clicks are handled via onPointerDown/Up tap detection
          }}
          style={{
            position: "static",
            width: `${FAB_SIZE}px`,
            height: `${FAB_SIZE}px`,
            // Slight scale when dragging for tactile feedback
            transform: dragging ? "scale(1.1)" : "scale(1)",
            transition: dragging ? "transform 0.1s ease" : "transform 0.2s ease",
            pointerEvents: "none", // wrapper handles all pointer events
          }}
        />
      </div>
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
