import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Smile, 
  Type, 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Wand2, 
  Layers,
  Heart,
  Briefcase,
  SmilePlus,
  Crown,
  Zap
} from 'lucide-react';
import { Celebrant, WishTone, WishTemplate } from '../types';
import { DEFAULT_TEMPLATES, resolveMessage } from '../utils/templates';
import { generateAIEnhancedWish } from '../utils/aiGenerator';

interface Props {
  celebrant: Celebrant;
  messageText: string;
  onUpdateMessage: (text: string) => void;
  senderName: string;
  onUpdateSenderName: (name: string) => void;
}

export const MessageEditor: React.FC<Props> = ({
  celebrant,
  messageText,
  onUpdateMessage,
  senderName,
  onUpdateSenderName,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [showAiPromptBox, setShowAiPromptBox] = useState(false);

  // Filter templates by current occasion
  const availableTemplates = DEFAULT_TEMPLATES.filter(
    (t) => t.occasion === celebrant.occasion
  );

  const handleSelectTemplate = (template: WishTemplate) => {
    setSelectedTemplateId(template.id);
    const resolved = resolveMessage(celebrant, template.template, senderName);
    onUpdateMessage(resolved);
  };

  const handleInsertToken = (token: string) => {
    onUpdateMessage(messageText + ` ${token} `);
  };

  const handleInsertEmoji = (emoji: string) => {
    onUpdateMessage(messageText + ` ${emoji} `);
  };

  const handleWrapFormat = (prefix: string, suffix: string) => {
    onUpdateMessage(messageText + `${prefix}text${suffix}`);
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const generated = await generateAIEnhancedWish(
        celebrant,
        'heartfelt and celebratory',
        aiCustomPrompt,
        senderName
      );
      onUpdateMessage(generated);
      setShowAiPromptBox(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const emojis = celebrant.occasion === 'birthday' 
    ? ['🎂', '🎉', '🎈', '🥳', '🍰', '🎁', '🥂', '✨', '🌟', '❤️']
    : ['💍', '🥂', '🍾', '🌹', '💐', '❤️', '✨', '🎉', '🕊️', '🍰'];

  const getToneIcon = (tone: WishTone) => {
    switch (tone) {
      case 'heartfelt': return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'playful': return <SmilePlus className="w-3.5 h-3.5 text-amber-400" />;
      case 'professional': return <Briefcase className="w-3.5 h-3.5 text-sky-400" />;
      case 'milestone': return <Crown className="w-3.5 h-3.5 text-purple-400" />;
      case 'short': return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Message Customizer</span>
          <span className="text-slate-500">·</span>
          <span className="capitalize text-slate-400">{celebrant.occasion} Wish</span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (availableTemplates.length > 0) {
              handleSelectTemplate(availableTemplates[0]);
            }
          }}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Reset message to default template"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Template Quick Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Curated Templates ({availableTemplates.length})
            </label>
            <span className="text-[11px] text-slate-400">Click to apply template</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl)}
                className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium transition-all border ${
                  selectedTemplateId === tmpl.id
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-xs'
                    : 'bg-slate-950/50 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                {getToneIcon(tmpl.tone)}
                <span className="truncate">{tmpl.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sender Name Setting */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/70 text-xs">
          <label className="text-slate-400 whitespace-nowrap font-medium">Your Signature / Name:</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => onUpdateSenderName(e.target.value)}
            placeholder="e.g. Amrendra, or Team Nexus"
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Message Textarea + Formatting Bar */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              WhatsApp Message Text
            </label>
            <div className="text-[11px] text-slate-400">
              {messageText.length} characters · WhatsApp Markdown
            </div>
          </div>

          {/* Markdown & Token Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950 rounded-t-lg border border-b-0 border-slate-800 text-xs">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Style:</span>
            <button
              type="button"
              onClick={() => handleWrapFormat('*', '*')}
              className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
              title="Bold text with *asterisks*"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleWrapFormat('_', '_')}
              className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
              title="Italic text with _underscores_"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleWrapFormat('~', '~')}
              className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
              title="Strikethrough with ~tildes~"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleWrapFormat('```', '```')}
              className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
              title="Monospace code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <span className="h-3 w-px bg-slate-700 mx-1" />

            <span className="text-[11px] text-slate-500 font-medium mr-1">Insert:</span>
            <button
              type="button"
              onClick={() => handleInsertToken('{name}')}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono rounded"
            >
              {'{name}'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertToken('{years}')}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono rounded"
            >
              {'{years}'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertToken('{relationship}')}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono rounded"
            >
              {'{relationship}'}
            </button>
          </div>

          {/* Text Area */}
          <textarea
            value={messageText}
            onChange={(e) => onUpdateMessage(e.target.value)}
            rows={7}
            className="w-full flex-1 min-h-[160px] p-3 bg-slate-950/70 border border-slate-800 rounded-b-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-mono leading-relaxed resize-none"
            placeholder="Write or edit your WhatsApp celebration wish..."
          />
        </div>

        {/* Emoji Quick Picker */}
        <div>
          <div className="text-[11px] text-slate-400 mb-1.5 font-medium flex items-center gap-1.5">
            <Smile className="w-3 h-3 text-amber-400" />
            <span>Quick Emojis</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded text-base transition-transform active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* AI Enhancement Section */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-400" />
              <div>
                <h5 className="text-xs font-semibold text-slate-200">AI Personalized Polish</h5>
                <p className="text-[11px] text-slate-400">Generate a custom wish tailored to {celebrant.name}</p>
              </div>
            </div>

            <button
              type="button"
              disabled={isGeneratingAI}
              onClick={() => {
                if (!showAiPromptBox) {
                  setShowAiPromptBox(true);
                } else {
                  handleGenerateAI();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAI ? 'Generating...' : showAiPromptBox ? 'Generate Now' : 'AI Wish'}</span>
            </button>
          </div>

          {showAiPromptBox && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2">
              <input
                type="text"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="Optional instruction: e.g. Make it nostalgic, add a funny gym joke, or poetic..."
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiPromptBox(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isGeneratingAI}
                  onClick={handleGenerateAI}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded transition-colors"
                >
                  {isGeneratingAI ? 'Crafting wish...' : 'Run Generation'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
