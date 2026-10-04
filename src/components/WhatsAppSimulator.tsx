import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  QrCode, 
  Share2, 
  Phone, 
  Video, 
  MoreVertical, 
  Sun, 
  Moon, 
  CheckCheck, 
  Sparkles, 
  ExternalLink, 
  MessageCircle, 
  Eye, 
  EyeOff,
  PhoneOff,
  Mic,
  MicOff,
  Camera,
  Play,
  Pause,
  Film,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Celebrant, OccasionType } from '../types';
import { buildWhatsAppLink, buildWhatsAppWebLink, generateWhatsAppQRCode, maskPhoneNumber } from '../utils/whatsapp';
import { APP_ASSETS, handleImageError } from '../utils/assets';

interface Props {
  celebrant: Celebrant;
  messageText: string;
  onToggleStatus: (id: string) => void;
  senderName: string;
}

export const WhatsAppSimulator: React.FC<Props> = ({
  celebrant,
  messageText,
  onToggleStatus,
  senderName
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [revealPhone, setRevealPhone] = useState(false);
  
  // Interactive Call Simulator State
  const [activeCall, setActiveCall] = useState<'video' | 'voice' | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoWishPlaying, setIsVideoWishPlaying] = useState(false);

  const waLink = buildWhatsAppLink(celebrant.phone, messageText, celebrant.countryCode);
  const waWebLink = buildWhatsAppWebLink(celebrant.phone, messageText, celebrant.countryCode);

  useEffect(() => {
    if (qrModalOpen && waLink) {
      generateWhatsAppQRCode(waLink).then(setQrCodeUrl);
    }
  }, [qrModalOpen, waLink]);

  useEffect(() => {
    let interval: any;
    if (activeCall) {
      setCallSeconds(0);
      interval = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const formatCallDuration = (secs: number) => {
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    const rem = (secs % 60).toString().padStart(2, '0');
    return `${mins}:${rem}`;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(waLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleLaunchWhatsApp = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#25D366', '#128C7E', '#FFD700', '#FF69B4']
    });
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  const formatWhatsAppMarkdown = (text: string) => {
    const parts = text.split('\n');
    return parts.map((line, idx) => {
      let formatted: React.ReactNode = line;
      if (line.includes('*')) {
        const segs = line.split('*');
        formatted = segs.map((seg, i) => (i % 2 === 1 ? <strong key={i}>{seg}</strong> : seg));
      }
      return (
        <span key={idx} className="block min-h-[1.25em]">
          {formatted}
        </span>
      );
    });
  };

  const isDark = theme === 'dark';
  const occasionAsset = APP_ASSETS[celebrant.occasion] || APP_ASSETS.other;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Simulator Control Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-white">Live WhatsApp Preview</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{celebrant.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title="Toggle WhatsApp theme"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isDark ? 'Light App' : 'Dark App'}</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Device Mockup */}
      <div className="flex-1 flex flex-col min-h-[480px]">
        {/* WhatsApp App Bar */}
        <div 
          className={`flex items-center justify-between px-4 py-3 transition-colors ${
            isDark ? 'bg-[#1f2c34] text-slate-100 border-b border-[#2a3942]' : 'bg-[#008069] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-inner text-sm">
                {celebrant.name.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>

            <div>
              <h4 className="text-sm font-semibold tracking-tight leading-tight flex items-center gap-1.5">
                {celebrant.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className={`text-[11px] leading-tight font-mono-nums ${isDark ? 'text-slate-400' : 'text-emerald-100'}`}>
                  {maskPhoneNumber(celebrant.phone, revealPhone)}
                </p>
                <button
                  type="button"
                  onClick={() => setRevealPhone(!revealPhone)}
                  className="opacity-75 hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                  title={revealPhone ? 'Hide phone number' : 'Show phone number'}
                >
                  {revealPhone ? (
                    <EyeOff className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Eye className="w-3 h-3 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Voice and Video Call Triggers */}
          <div className="flex items-center gap-2 opacity-90">
            <button 
              type="button" 
              onClick={() => setActiveCall('voice')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer" 
              title="Start WhatsApp Voice Call Simulation"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={() => setActiveCall('video')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer" 
              title="Start WhatsApp Video Call Simulation"
            >
              <Video className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={() => setQrModalOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer" 
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WhatsApp Chat Canvas */}
        <div 
          className={`flex-1 p-4 overflow-y-auto flex flex-col justify-end ${
            isDark ? 'wa-wallpaper-pattern text-slate-100' : 'wa-wallpaper-light text-slate-800'
          }`}
        >
          {/* Date Divider */}
          <div className="flex justify-center mb-4">
            <span className={`text-[11px] font-medium px-3 py-1 rounded-md shadow-xs ${
              isDark ? 'bg-[#182229] text-slate-400 border border-[#222e35]' : 'bg-white/80 text-slate-600 shadow-xs'
            }`}>
              TODAY
            </span>
          </div>

          {/* Outgoing Message Bubble with Image & Video Wish Preview */}
          <div className="flex justify-end mb-2">
            <div 
              className={`max-w-[85%] rounded-2xl p-2.5 text-sm shadow-md relative leading-relaxed transition-all ${
                isDark 
                  ? 'bg-[#005c4b] text-slate-100 rounded-tr-none' 
                  : 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
              }`}
            >
              {/* Celebration Picture / Video Card */}
              <div 
                onClick={() => {
                  setIsVideoWishPlaying(!isVideoWishPlaying);
                  confetti({ particleCount: 35, spread: 60 });
                }}
                className="relative rounded-xl overflow-hidden mb-2 shadow-xs group cursor-pointer border border-black/10"
                title="Celebration Greeting Card (Click to play/confetti)"
              >
                <img 
                  src={occasionAsset} 
                  alt="Celebration greeting card"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, celebrant.occasion)}
                  className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Floating Media Badges */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Celebration Card</span>
                </div>

                {/* Video Play Indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-lg border border-white/20 transform group-hover:scale-110 transition-transform">
                    {isVideoWishPlaying ? (
                      <Pause className="w-5 h-5 text-amber-300 fill-amber-300" />
                    ) : (
                      <Play className="w-5 h-5 text-amber-300 fill-amber-300 ml-0.5" />
                    )}
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono-nums px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Film className="w-3 h-3 text-amber-300" />
                  <span>0:15 HD</span>
                </div>
              </div>

              {/* Message Content with WhatsApp markdown */}
              <div className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed px-1">
                {formatWhatsAppMarkdown(messageText)}
              </div>

              {/* Message Meta Info (Time + Blue Ticks) */}
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] select-none text-slate-300">
                <span className="opacity-75">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            {/* Direct Open in WhatsApp button */}
            <button
              type="button"
              onClick={handleLaunchWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send in WhatsApp</span>
            </button>

            {/* WhatsApp Web alternative */}
            <a
              href={waWebLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Web</span>
            </a>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggleStatus(celebrant.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                celebrant.status === 'wished'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{celebrant.status === 'wished' ? 'Marked Wished' : 'Mark as Wished'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive WhatsApp Video / Audio Call Modal */}
      {activeCall && (
        <div className="absolute inset-0 z-50 bg-[#111b21] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-white">
          {/* Video stream backdrop */}
          {activeCall === 'video' ? (
            <div className="relative flex-1 overflow-hidden flex flex-col justify-between p-6">
              <img 
                src={occasionAsset} 
                alt="Video Stream"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, celebrant.occasion)}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/70" />

              {/* Call Top Details */}
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{celebrant.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono-nums mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>WhatsApp Video Call · {formatCallDuration(callSeconds)}</span>
                  </div>
                </div>

                {/* Picture in picture selfie frame */}
                <div className="w-24 h-32 rounded-xl border-2 border-white/60 overflow-hidden shadow-2xl bg-slate-900 relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-[10px]">
                    <Camera className="w-5 h-5 text-white/80 mb-1" />
                    <span>Your Camera</span>
                  </div>
                </div>
              </div>

              {/* Celebration Animation Banner Overlay */}
              <div className="relative z-10 self-center text-center py-4 px-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 animate-bounce" />
                <div className="text-sm font-bold text-white">Sending Celebration Video Greeting</div>
                <div className="text-xs text-pink-200 mt-0.5">High definition audio & video connected</div>
              </div>

              {/* Call Controls Bar */}
              <div className="relative z-10 flex items-center justify-center gap-6 pb-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-full transition-colors ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    confetti({ particleCount: 40, spread: 60 });
                  }}
                  className="p-3.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  title="Send live celebration sparkles"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </button>

                {/* End Call Button */}
                <button
                  type="button"
                  onClick={() => setActiveCall(null)}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg transition-colors cursor-pointer"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            /* WhatsApp Voice Call Interface */
            <div className="flex-1 flex flex-col justify-between p-8 text-center bg-gradient-to-b from-[#1f2c34] to-[#121b22]">
              <div className="pt-6">
                <h3 className="text-2xl font-bold tracking-tight">{celebrant.name}</h3>
                <p className="text-sm text-slate-400 font-mono-nums mt-1">
                  {maskPhoneNumber(celebrant.phone, revealPhone)}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono-nums bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Call in progress · {formatCallDuration(callSeconds)}</span>
                </div>
              </div>

              {/* Pulsing Avatar */}
              <div className="flex justify-center items-center my-8">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white text-3xl shadow-2xl">
                    {celebrant.name.charAt(0)}
                  </div>
                  <div className="absolute -inset-2 rounded-full border border-emerald-400/30 animate-ping pointer-events-none" />
                </div>
              </div>

              {/* Voice Call Controls Bar */}
              <div className="flex items-center justify-center gap-6 pb-4">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-full transition-colors ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* End Call Button */}
                <button
                  type="button"
                  onClick={() => setActiveCall(null)}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg transition-colors cursor-pointer"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl flex flex-col items-center">
            <h4 className="text-sm font-bold text-white mb-1">Scan WhatsApp QR Code</h4>
            <p className="text-xs text-slate-400 mb-4">
              Scan with your mobile camera to instantly open this chat on WhatsApp
            </p>

            {qrCodeUrl ? (
              <div className="bg-white p-3 rounded-xl shadow-inner mb-4">
                <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-44 h-44" />
              </div>
            ) : (
              <div className="w-44 h-44 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-xs text-slate-500">
                Generating QR...
              </div>
            )}

            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
