import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Search,
  MoreVertical,
  Plus, 
  Mic, 
  Send,
  Lock, 
  CheckCheck,
  Zap,
  ChevronDown,
  ChevronLeft,
  Info
} from 'lucide-react';

// --- Custom Styles for Subtle Bounce & Typing Dots ---
const CustomStyles = () => (
  <style>{`
    @keyframes sub-bounce {
      0%, 100% {
        transform: translateY(-15%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }
    .animate-sub-bounce {
      animation: sub-bounce 1.5s infinite;
    }
    @keyframes typing-dot {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-4px);
        opacity: 1;
      }
    }
    .typing-dot-1 { animation: typing-dot 1.4s ease-in-out infinite; }
    .typing-dot-2 { animation: typing-dot 1.4s ease-in-out 0.2s infinite; }
    .typing-dot-3 { animation: typing-dot 1.4s ease-in-out 0.4s infinite; }
  `}</style>
);

// --- Background Component ---
const RoadmapBackground = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none select-none">
     {/* Grid Pattern */}
     <div 
        className="absolute inset-0 opacity-20" 
        style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: '3rem 3rem',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
        }}
     />
     
     {/* Ambient Glows */}
     <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--primary)] opacity-[0.05] rounded-full blur-[120px] animate-pulse" />
     <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-blue-500 opacity-[0.03] rounded-full blur-[100px]" />
  </div>
);

// --- Chat Message Components ---

interface MessageProps {
  isSender: boolean;
  content?: React.ReactNode;
  timestamp?: string;
  isMedia?: boolean;
  isLocked?: boolean;
  delay?: number;
}

const ChatBubble: React.FC<MessageProps> = ({ isSender, content, timestamp, isMedia, isLocked, delay = 0 }) => {
  return (
    <div 
      className={`flex w-full mb-3 ${isSender ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className={`relative ${isMedia ? 'max-w-full' : 'max-w-[90%] sm:max-w-[75%]'} group flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
        
        {/* Lock Overlay */}
        {isLocked && (
           <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg-main)]/60 backdrop-blur-[2px] rounded-[22px]">
              <div className="bg-[var(--bg-input)] p-3 rounded-full border border-[var(--border)] shadow-xl">
                 <Lock className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
           </div>
        )}

        {/* Message Bubble - Inspiration Style (Scaled Up) */}
        <div className={`
            px-6 py-4 text-[17px] leading-relaxed shadow-sm relative transition-all duration-300
            ${isMedia ? 'p-0 bg-transparent shadow-none w-full' : ''}
            ${!isMedia && !isSender ? 'bg-[var(--bg-hover)] text-[var(--text-main)] rounded-[24px] rounded-tl-none border border-[var(--border)]' : ''} 
            ${!isMedia && isSender ? 'bg-[var(--primary)] text-white rounded-[24px] rounded-tr-none shadow-lg shadow-[var(--primary)]/20' : ''}
        `}>
           {content}
        </div>
        
        {/* Status / Time */}
        {!isLocked && timestamp && (
            <div className={`
                flex items-center gap-2 mt-1.5 opacity-80
                ${isSender ? 'justify-end' : 'justify-start'}
            `}>
                 <span className="text-xs text-[var(--text-muted)]">{timestamp}</span>
                {isSender && <CheckCheck className="w-4 h-4 text-[var(--primary)]" />}
            </div>
        )}
      </div>
    </div>
  );
};

// Clean Date Pill like inspiration (Scaled Up)
const DatePill = ({ date }: { date: string }) => (
    <div className="flex justify-center my-4">
        <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg-input)] border border-[var(--border)] px-5 py-1.5 rounded-full shadow-sm">
            {date}
        </span>
    </div>
);

// --- Version Data ---

const versionData = {
  'v1.2.0': {
    version: 'v1.2.0',
    title: 'Genesis Update - V1.2.0',
    description: 'Enhanced experience with theming, exports, and persistence.',
    details: [
      'Dynamic Theme Engine (Matrix & Ocean)',
      'PNG Export System (Regret Reports)',
      'Opportunity Cost Methodology Modal',
      'Interactive Theme Persistence (Local Storage)',
      'Enhanced UI Tooltips & Dynamic Arrows',
    ],
  },
  'v1.0.0': {
    version: 'v1.0.0',
    title: 'Genesis Update',
    description: 'The foundation is set. Calculate compound regret with real-time market data.',
    details: [
      'V1 Regret Algorithm',
      'Market Data Hooks',
      'Compound Engine',
      'Latency -40%',
      'Dark Mode',
    ],
  },
};

type VersionKey = keyof typeof versionData;

// --- Rich Media Cards ---

interface UpdateCardProps {
  versionInfo: typeof versionData['v1.0.0'];
  onViewNotes: () => void;
  onNavigateBack?: () => void;
  showBackArrow: boolean;
}

const UpdateCard = ({ versionInfo, onViewNotes, onNavigateBack, showBackArrow }: UpdateCardProps) => (
    <div className="bg-[var(--bg-input)] rounded-[24px] border border-[var(--border)] overflow-hidden w-full sm:w-[360px] h-[380px] select-none shadow-lg flex-none flex flex-col hover:border-[var(--primary)] transition-all duration-300 group relative z-10">
        {/* Top Image Area */}
        <div className="h-52 bg-gradient-to-br from-indigo-900 to-[var(--bg-card)] relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,var(--primary),transparent)]"></div>
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl z-10 group-hover:scale-110 transition-transform duration-500">
                 <Zap className="w-10 h-10 text-white" />
            </div>
            {/* Version Tag */}
            <div className="absolute top-5 right-5 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs font-mono text-white border border-white/10">
                {versionInfo.version}
            </div>
        </div>
        
        {/* Content Body */}
        <div className="p-6 bg-[var(--bg-card)] flex-1 flex flex-col justify-between">
            <div>
                <h4 className="font-bold text-[var(--text-main)] text-xl mb-2 flex items-center gap-2">
                    {showBackArrow && (
                        <button 
                            onClick={onNavigateBack}
                            className="p-1 -ml-1 hover:bg-[var(--bg-hover)] rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-[var(--text-muted)] hover:text-[var(--primary)]" />
                        </button>
                    )}
                    {versionInfo.title}
                </h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {versionInfo.description}
                </p>
            </div>
            
            <button 
                onClick={onViewNotes}
                className="w-full mt-4 py-3 bg-[var(--bg-hover)] hover:bg-[var(--primary)] hover:text-white text-[var(--text-muted)] rounded-xl text-sm font-semibold transition-colors border border-[var(--border)] border-dashed hover:border-transparent flex items-center justify-center gap-2"
            >
                View Release Notes <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
        </div>
    </div>
);

interface ReleaseNotesDetailsProps {
  details: string[];
}

const ReleaseNotesDetails = ({ details }: ReleaseNotesDetailsProps) => (
    <div className="w-full h-full bg-[var(--bg-input)]/95 backdrop-blur-md rounded-[24px] border border-[var(--border)] p-6 shadow-xl flex flex-col">
        <h4 className="font-bold text-[var(--text-main)] mb-5 flex items-center gap-2 text-base border-b border-[var(--border)] pb-3">
            <Info className="w-5 h-5 text-[var(--primary)]" />
            Details
        </h4>
        <ul className="space-y-4">
            {details.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <CheckCheck className="w-4 h-4 text-[var(--primary)] flex-none" />
                    {item}
                </li>
            ))}
        </ul>
        <div className="mt-auto pt-4 text-xs text-[var(--text-muted)] opacity-60 text-center font-medium">
            Deployed successfully
        </div>
    </div>
);

// --- Main Component ---

export const Roadmap: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [currentVersion, setCurrentVersion] = useState<VersionKey>('v1.2.0');

  // Lock body scroll & typing indicator logic
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
    }

    // Initial typing indicator for 5 seconds
    const initialTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 5000);

    // Flicker every 12 seconds
    const flickerInterval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 5000);
    }, 12000);

    return () => {
      document.body.style.overflow = 'unset';
      clearTimeout(initialTimeout);
      clearInterval(flickerInterval);
    };
  }, []);

  const scrollToNextSection = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight, // Scroll to the very bottom
            behavior: 'smooth'
        });
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-4 py-10 md:py-14">
      <RoadmapBackground />
      <CustomStyles />
      
      {/* 
         Main Container - scaled up look
      */}
      <div className="w-full max-w-5xl h-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up relative">
        
        {/* Header - Scaled Up */}
        <div className="h-24 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-8 shrink-0 z-20 relative">
            
            <div className="flex items-center gap-5">
                {/* Back Button Integrated */}
                <div className="p-2.5 -ml-2 hover:bg-[var(--bg-hover)] rounded-full cursor-pointer transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]">
                    <ArrowLeft className="w-6 h-6" />
                </div>

                {/* Profile Pic & Info */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--primary)] to-purple-800 flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-[var(--bg-card)]">
                            RC
                        </div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--bg-card)]"></div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-lg font-bold text-[var(--text-main)] leading-tight">Regret Calculator</span>
                        <span className="text-xs text-[var(--primary)] font-semibold tracking-wide">Official Updates</span>
                    </div>

                    {/* MOVED PULSING ARROW HERE */}
                    <button 
                        onClick={scrollToNextSection}
                        className="ml-3 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-full shadow-sm hover:border-[var(--primary)] transition-colors group cursor-pointer animate-sub-bounce"
                        title="Jump to latest"
                    >
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
                    </button>
                </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-5 text-[var(--text-muted)]">
                <Search className="w-6 h-6 cursor-pointer hover:text-[var(--text-main)] transition-colors" />
                <MoreVertical className="w-6 h-6 cursor-pointer hover:text-[var(--text-main)] transition-colors" />
            </div>
        </div>

        {/* Scrollable Chat Area */}
        <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-8 py-4 pb-12 custom-scrollbar scroll-smooth bg-[var(--bg-main)]/30"
        >
            {/* Start Content Higher Up (Reduced top spacing) */}
            <DatePill date="Tuesday, 9:41 AM" />
            
            <ChatBubble 
                isSender={false} 
                delay={200}
                timestamp="09:41"
                content={
                    <span>
                        Welcome to the official update channel. 🚀<br/>
                        Here is what we have deployed so far.
                    </span>
                } 
            />

            <ChatBubble 
                isSender={false} 
                isMedia 
                delay={500}
                timestamp="09:41"
                content={
                    <div className="flex items-start">
                        {/* Primary Update Card - Scaled */}
                        <UpdateCard 
                            versionInfo={versionData[currentVersion]}
                            onViewNotes={() => setShowReleaseNotes(!showReleaseNotes)}
                            onNavigateBack={() => setCurrentVersion('v1.0.0')}
                            showBackArrow={currentVersion === 'v1.2.0'}
                        />
                        
                        {/* Animated Details Panel - Scaled */}
                        <div 
                            className={`
                                hidden lg:block overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] h-[380px]
                                ${showReleaseNotes ? 'w-[300px] opacity-100 ml-6' : 'w-0 opacity-0 ml-0'}
                            `}
                        >
                            {/* Fixed width inner container to prevent squashing during transition */}
                            <div className="w-[300px] h-full">
                                <ReleaseNotesDetails details={versionData[currentVersion].details} />
                            </div>
                        </div>
                    </div>
                } 
            />

            {/* Next Section - Compact spacing */}
            <DatePill date="Today" />

            <ChatBubble 
                isSender={true} 
                delay={0}
                timestamp="11:25"
                content="This looks clean! What's coming next?" 
            />

            <ChatBubble 
                isSender={false} 
                delay={500}
                timestamp="11:25"
                content={
                    <div className="flex items-center gap-2 h-7 px-1">
                         <div className="w-2 h-2 bg-[var(--text-muted)] opacity-60 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-[var(--text-muted)] opacity-60 rounded-full animate-bounce delay-100"></div>
                         <div className="w-2 h-2 bg-[var(--text-muted)] opacity-60 rounded-full animate-bounce delay-200"></div>
                    </div>
                } 
            />

            {/* Future Timeline */}
            <div className="mt-16 space-y-4 opacity-90 pb-12">
                 <DatePill date="Future Timeline" />
                 
                 <ChatBubble 
                    isSender={false} 
                    isLocked
                    content="Update 2.0: The Social Compound. Leaderboards, user profiles, and regret sharing." 
                />
                
                <ChatBubble 
                    isSender={false} 
                    isLocked
                    content="Update 3.0: Automated Reality. Bank integration, AI suggestions, Mobile App." 
                />
            </div>

        </div>

        {/* Floating Input Area (Scaled Up) - Added shrink-0 */}
        <div className="p-5 bg-[var(--bg-card)] border-t border-[var(--border)] z-20 shrink-0">
            {/* Typing Indicator */}
            <div 
              className={`flex items-center gap-2 mb-3 ml-2 transition-all duration-300 ${isTyping ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <span className="text-xs font-medium text-[var(--primary)]">Regret Calculator is typing</span>
              <div className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] typing-dot-1"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] typing-dot-2"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] typing-dot-3"></span>
              </div>
            </div>

            <div className="bg-[var(--bg-input)] border border-[var(--border)] rounded-full h-16 px-3 flex items-center shadow-inner transition-colors focus-within:border-[var(--primary)]">
                
                <button className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-hover)] transition-all ml-1">
                    <Plus className="w-6 h-6" />
                </button>

                <input 
                    type="text" 
                    placeholder="Write your message here..." 
                    className="flex-1 bg-transparent border-none outline-none text-[var(--text-main)] px-4 text-lg placeholder:text-[var(--text-muted)]/50 h-full"
                    disabled
                />

                <button className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all">
                    <Mic className="w-6 h-6" />
                </button>

                <button className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all mr-1">
                    <Send className="w-6 h-6" />
                </button>

            </div>
        </div>

      </div>
    </div>
  );
};