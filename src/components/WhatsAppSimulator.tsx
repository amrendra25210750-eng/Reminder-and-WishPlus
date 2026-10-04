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
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Celebrant, OccasionType } from '../types';
import { buildWhatsAppLink, buildWhatsAppWebLink, generateWhatsAppQRCode, maskPhoneNumber } from '../utils/whatsapp';

const OCCASION_ASSETS: Record<string, string> = {
  birthday: '/src/assets/images/birthday_celebration_1791088804123.jpg',
  anniversary: '/src/assets/images/anniversary_celebration_1791088816279.jpg',
  combo: '/src/assets/images/anniversary_celebration_1791088816279.jpg',
  other: '/src/assets/images/festive_milestone_1791088827841.jpg',
};

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

  const waLink = buildWhatsAppLink(celebrant.phone, messageText, celebrant.countryCode);
  const waWebLink = buildWhatsAppWebLink(celebrant.phone, messageText, celebrant.countryCode);

  useEffect(() => {
    if (qrModalOpen && waLink) {
      generateWhatsAppQRCode(waLink).then(setQrCodeUrl);
    }
  }, [qrModalOpen, waLink]);

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
    // Celebrate!
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#25D366', '#128C7E', '#FFD700', '#FF69B4']
    });

    // Open WhatsApp
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  // Helper to format WhatsApp markdown into rich text HTML
  const formatWhatsAppMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold *text*
      let formatted = line.replace(/\*(.*?)\*/g, '<strong class="font-bold text-white">$1</strong>');
      // Italic _text_
      formatted = formatted.replace(/_(.*?)_/g, '<em class="italic opacity-90">$1</em>');
      // Strike ~text~
      formatted = formatted.replace(/~(.*?)~/g, '<del class="line-through opacity-75">$1</del>');
      // Code ```text```
      formatted = formatted.replace(/```(.*?)```/g, '<code class="font-mono bg-black/20 px-1 py-0.5 rounded text-xs">$1</code>');

      return (
        <span 
          key={idx} 
          className="block min-h-[1.25rem]"
          dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} 
        />
      );
    });
  };

  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Simulator Control Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">WhatsApp Live Preview</span>
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
                  className="opacity-75 hover:opacity-100 transition-opacity p-0.5"
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

          <div className="flex items-center gap-3 opacity-90">
            <button 
              type="button" 
              onClick={() => alert(`Calling ${celebrant.name} (${celebrant.phone}) via WhatsApp...`)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors" 
              title="Voice call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={() => alert(`Video calling ${celebrant.name} (${celebrant.phone}) via WhatsApp...`)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors" 
              title="Video call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors" 
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
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

          {/* Outgoing Message Bubble */}
          <div className="flex justify-end mb-2">
            <div 
              className={`max-w-[85%] rounded-2xl p-2.5 text-sm shadow-md relative leading-relaxed transition-all ${
                isDark 
                  ? 'bg-[#005c4b] text-slate-100 rounded-tr-none' 
                  : 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
              }`}
            >
              {/* Attached Occasion Photo Greeting Card */}
              <div 
                onClick={() => confetti({ particleCount: 35, spread: 60 })}
                className="relative rounded-xl overflow-hidden mb-2 shadow-xs group cursor-pointer border border-black/10"
                title="Celebration Greeting Photo Attached (Click for confetti)"
              >
                <img 
                  src={OCCASION_ASSETS[celebrant.occasion] || OCCASION_ASSETS.other} 
                  alt="Celebration greeting card"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Celebration Card</span>
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
              title="Open in WhatsApp Web in browser"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>WA Web</span>
            </a>

            {/* QR Code trigger */}
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
              title="Scan QR Code to open on mobile"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Quick Copy & Status Bar */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied Text!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleStatus(celebrant.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  celebrant.status === 'wished'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Check className={`w-3 h-3 ${celebrant.status === 'wished' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{celebrant.status === 'wished' ? 'Wished' : 'Mark Wished'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Phone Scanner */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1">Scan to Send in WhatsApp</h3>
            <p className="text-xs text-slate-400 mb-4">
              Point your smartphone camera to open WhatsApp with the message for <strong className="text-slate-200">{celebrant.name}</strong> ready to send.
            </p>

            <div className="flex justify-center p-3 bg-white rounded-lg inline-block shadow-inner mx-auto mb-4">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="WhatsApp QR Code" 
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR Code...
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800 mb-4 text-left font-mono">
              <span className="text-emerald-400 font-semibold">Recipient:</span> {celebrant.name} ({celebrant.phone})
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
