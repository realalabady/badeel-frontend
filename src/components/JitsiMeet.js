import { useState } from "react";
import { Video, VideoOff, Maximize, Minimize } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function JitsiMeet({ roomName, userName, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useTranslation();

  const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(roomName)}#userInfo.displayName="${encodeURIComponent(userName)}"`;

  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 bg-black"
          : "relative w-full rounded-lg overflow-hidden border border-border"
      }`}
      data-testid="jitsi-container"
    >
      {/* Controls bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-white text-sm">
          <Video className="w-4 h-4" />
          <span>{t("assignments.videoCall")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            {t("assignments.endClass")}
          </button>
        </div>
      </div>

      {/* Jitsi iframe */}
      <iframe
        src={jitsiUrl}
        title="Jitsi Video Call"
        className={`w-full ${isFullscreen ? "h-screen" : "h-[500px]"}`}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        style={{ border: "none" }}
      />
    </div>
  );
}
