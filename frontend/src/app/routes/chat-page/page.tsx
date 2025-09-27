"use client";
import { CedarCaptionChat } from "../../../cedar/components/chatComponents/CedarCaptionChat";

export default function ChatPage() {
  return (
    <div>
      <CedarCaptionChat
        dimensions={{
          width: 600,
          maxWidth: 800,
        }}
        showThinking={true}
      />
    </div>
  );
}