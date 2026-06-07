/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  RotateCw,
  Smile,
  Compass,
  Gift,
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';
import { PigSprite, POSES } from './components/PigSprite';
import { BackpackCabinet, SNACKS, SnackItem, TreasureItem } from './components/BackpackCabinet';
import { playSynthSound } from './utils/audio';

export default function App() {
  // --- Game Engine State ---
  const [pose, setPose] = useState<keyof typeof POSES>('happy');
  const [energy, setEnergy] = useState<number>(85);
  const [happiness, setHappiness] = useState<number>(75);
  const [points, setPoints] = useState<number>(180); // Start with some bonus points to let user play with it immediately!
  
  // --- Outfit Boutique States ---
  const [activeOutfit, setActiveOutfit] = useState<string>(() => {
    return localStorage.getItem('piggy_active_outfit') || 'classic';
  });
  const [unlockedOutfits, setUnlockedOutfits] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('piggy_unlocked_outfits');
      return saved ? JSON.parse(saved) : ['classic'];
    } catch {
      return ['classic'];
    }
  });

  useEffect(() => {
    localStorage.setItem('piggy_active_outfit', activeOutfit);
  }, [activeOutfit]);

  useEffect(() => {
    localStorage.setItem('piggy_unlocked_outfits', JSON.stringify(unlockedOutfits));
  }, [unlockedOutfits]);

  const handleWearOutfit = (id: string) => {
    setActiveOutfit(id);
    playSynthSound('success');
    
    // Funny custom descriptive audio feedback lines:
    switch (id) {
      case 'classic':
        speakWithSqueakyVoice("Oink! Fresh pink look. Back to nature!", 'happy');
        break;
      case 'farmer':
        speakWithSqueakyVoice("Oink! I'm ready to plant some sweet carrots on the farm! Let's get dirty, snort! 👩‍🌾🌻", 'laughing');
        break;
      case 'party':
        speakWithSqueakyVoice("Woohooo squeeeeeal! Look at my neon star party shades! Let's party loud! 🎉⭐", 'laughing');
        break;
      case 'detective':
        speakWithSqueakyVoice("Oink, elementary my dear friend! I spy a hidden acorn in your backpack! 🕵️🔍", 'confused');
        break;
      case 'royal':
        speakWithSqueakyVoice("All hail the supreme Majesty of the mud pastures! Bow before my crown, snort! 👑🦁", 'happy');
        break;
      case 'astronaut':
        speakWithSqueakyVoice("Squeeal!! Zero gravity activated! Lunar space landing in 3... 2... oink! 🚀🪐", 'scared');
        break;
    }
  };

  const handleUnlockOutfit = (id: string, cost: number, name: string) => {
    if (points < cost) {
      playSynthSound('poke');
      speakWithSqueakyVoice(`Oink, squeal! I need ${cost - points} more treasure points to afford this premium ${name} fashion! Keep feeding or playing with me!`, 'crying');
      return;
    }
    
    setPoints(prev => prev - cost);
    setUnlockedOutfits(prev => [...prev, id]);
    setActiveOutfit(id);
    playSynthSound('success');
    speakWithSqueakyVoice(`Squeeeal! Thank you for the dapper new outfit! I look absolutely gorgeous in my brand new ${name}! 😍🎈`, 'laughing');
  };
  
  // --- Mode State ---
  // If true: Piggy speaks using smart Gemini chatbot on the backend.
  // If false: Piggy simply echos back whatever you say or type in a high squeaky pitch!
  const [aiMode, setAiMode] = useState<boolean>(true);
  
  // --- Speech Engine State ---
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>("");
  const [piggySpeech, setPiggySpeech] = useState<string>("Oink! Hello friend! I'm Piggy. Type something or tap my mic to talk to me!");
  const [micError, setMicError] = useState<string | null>(null);
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isRummaging, setIsRummaging] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const speechIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setPose('listening');
        playSynthSound('squeak');
        setMicError(null);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          handleInputSubmission(resultText);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setMicError(`Mic error: ${event.error}. Feel free to use the text bar!`);
        setIsListening(false);
        setPose('happy');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      setMicError("Speech recognition is not natively supported in this browser frame. Use the textbox instead!");
    }

    // Load custom voices on mount to prime sound engine
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [aiMode]);

  // --- Voice Squeaker playback ---
  const speakWithSqueakyVoice = (text: string, customEmotion?: keyof typeof POSES) => {
    if (!window.speechSynthesis) {
      // Offline fallback: update speech logs visually
      setPiggySpeech(text);
      if (customEmotion) setPose(customEmotion);
      return;
    }

    // Cancel current speaking
    window.speechSynthesis.cancel();
    if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);

    setPiggySpeech(text);
    const utterance = new SpeechSynthesisUtterance(text);

    // Turn up pitch and speed for adorable squeaky retro piggy voice!
    utterance.pitch = 1.75;
    utterance.rate = 1.22;

    // Search for young/high pitch voice
    const voices = window.speechSynthesis.getVoices();
    const desiredVoice = voices.find(v =>
      v.name.toLowerCase().includes('google us english') ||
      v.name.toLowerCase().includes('kid') ||
      v.name.toLowerCase().includes('child') ||
      v.name.toLowerCase().includes('girl') ||
      v.name.toLowerCase().includes('zira') ||
      v.name.toLowerCase().includes('clara')
    );
    if (desiredVoice) {
      utterance.voice = desiredVoice;
    }

    // Animate mouth during text reading by cycling talking and laughing poses
    utterance.onstart = () => {
      setIsSpeaking(true);
      setPose('talking');
      if (soundEnabled) playSynthSound('squeak');

      speechIntervalRef.current = setInterval(() => {
        setPose(prev => {
          if (prev === 'talking') return 'laughing';
          if (prev === 'laughing') return 'happy';
          return 'talking';
        });
      }, 190);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      // Settle on custom emotion matching backend or falling back to happy
      setPose(customEmotion || 'happy');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      setPose('happy');
    };

    window.speechSynthesis.speak(utterance);
  };

  // --- Master Input Submission Handler ---
  const handleInputSubmission = async (input: string) => {
    if (!input.trim()) return;
    setSpeechText("");

    if (!aiMode) {
      // Classic Echo Mode: Squeal exactly what user said!
      const echoMessage = `Oink! "${input}" oink, squeal!`;
      speakWithSqueakyVoice(echoMessage, 'laughing');
      setHappiness(prev => Math.min(100, prev + 2));
      return;
    }

    // AI Smart Partner mode
    setIsThinking(true);
    setPose('confused');
    setPiggySpeech("Oink? Let me think...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      
      setIsThinking(false);
      if (data.response) {
        speakWithSqueakyVoice(data.response, data.reaction || 'happy');
        setEnergy(prev => Math.max(10, prev - 3));
        setHappiness(prev => Math.min(100, prev + 5));
        setPoints(prev => prev + 10);
      } else {
        throw new Error("Invalid backend format");
      }
    } catch (e) {
      console.error("AI Communication error:", e);
      setIsThinking(false);
      speakWithSqueakyVoice("Squeeal! My oink-link failed! Oink, oink!", 'scared');
    }
  };

  // --- Interactive Microphone Toggler ---
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        // Cancel active speaking to avoid self-hearing
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setIsSpeaking(false);
        recognitionRef.current.start();
      } else {
        setMicError("Microphone not available. Feel free to type in the chat box!");
      }
    }
  };

  // --- Head petting action ---
  const handleHeadPet = () => {
    if (isSpinning) return;
    playSynthSound('pet');
    setPose('petted_head');
    setPiggySpeech("Ahhh! That feels so nice, oink! 🌸");
    setHappiness(prev => Math.min(100, prev + 8));
    setEnergy(prev => Math.min(100, prev + 2));
    setPoints(prev => prev + 15);
    
    setTimeout(() => {
      if (!isSpeaking) setPose('happy');
    }, 1500);
  };

  // --- Belly poking action ---
  const handleBellyPoke = () => {
    if (isSpinning) return;
    playSynthSound('poke');
    setPose('poke_belly');
    
    // Funny food obsessed comments
    const pokes = [
      "Oof! My belly is packed with acorns oink! 🌰",
      "Hehehe, that tickles snort! Don't push my buttons!",
      "Stop it! I'm digesting my morning milk, squeal!",
      "Oink! Target acquired. Initiating pig sneeze in 3... 2...",
    ];
    const comment = pokes[Math.floor(Math.random() * pokes.length)];
    setPiggySpeech(comment);
    
    setHappiness(prev => Math.max(0, prev - 3));
    setEnergy(prev => Math.max(0, prev - 4));
    setPoints(prev => prev + 5);

    setTimeout(() => {
      if (!isSpeaking) setPose('happy');
    }, 1500);
  };

  // --- 3D Spin sequence ---
  const handleFullSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setPiggySpeech("Whoooooaaaa!!! Look at me spin, oink! 🌀");

    const spinSequence: (keyof typeof POSES)[] = [
      'angle_45',
      'angle_90',
      'angle_180',
      'angle_225',
      'angle_270',
      'angle_0',
    ];

    let step = 0;
    playSynthSound('squeak');
    
    const interval = setInterval(() => {
      if (step < spinSequence.length) {
        setPose(spinSequence[step]);
        playSynthSound('poke');
        step++;
      } else {
        clearInterval(interval);
        setIsSpinning(false);
        setPose('happy');
        setPoints(p => p + 30);
        setHappiness(h => Math.min(100, h + 10));
      }
    }, 200);
  };

  // --- Feed Snack Event handler ---
  const handleFeedSnack = (snack: SnackItem) => {
    if (isSpinning) return;
    playSynthSound('eat');
    setPose('opening_bag');
    setPiggySpeech(`Om nom nom crunch! Munching on ${snack.name}... 🍲`);

    setTimeout(() => {
      playSynthSound('success');
      setPoints(p => p + 25);
      
      switch (snack.effect) {
        case 'joy':
          setPose('laughing');
          setPiggySpeech("Oinks of pure joy! Acorns are heaven! 🌰✨");
          setHappiness(h => Math.min(100, h + 20));
          setEnergy(e => Math.min(100, e + 15));
          break;
        case 'blush':
          setPose('petted_head');
          setPiggySpeech("Blushing cheeks! This berry is so sweet oink! 🍓");
          setHappiness(h => Math.min(100, h + 15));
          setEnergy(e => Math.min(100, e + 10));
          break;
        case 'talk':
          setPose('talking');
          setPiggySpeech("Sweet golden corn energy! Let's run around farm, snort! 🌽");
          setEnergy(e => Math.min(100, e + 30));
          break;
        case 'squeak':
          setPose('scared');
          setPiggySpeech("Oink! Sssspizz fizzy soda made my nose sneeze! *Burp!* 🥤");
          setHappiness(h => Math.min(100, h + 10));
          setEnergy(e => Math.min(100, e + 5));
          break;
      }
      
      setTimeout(() => {
        if (!isSpeaking) setPose('happy');
      }, 2000);
    }, 1000);
  };

  // --- Rummage Bag Event handler ---
  const handleRummageTreasure = (item: TreasureItem) => {
    setIsRummaging(true);
    setPose('opening_bag');
    setPiggySpeech(`Rummaging shoulder bag... What did I find? 🎒`);

    setTimeout(() => {
      setIsRummaging(false);
      setPose('laughing');
      setPiggySpeech(`Woohoo! Squeeeal! I found a [${item.rarity}] ${item.name} ${item.emoji}!`);
      setPoints(p => p + item.points);
      setHappiness(h => Math.min(100, h + 12));
      
      setTimeout(() => {
        if (!isSpeaking) setPose('happy');
      }, 2500);
    }, 1200);
  };

  // Predefined prompts for easy desktop taping
  const quickPrompts = [
    "Do you prefer carrots or sweet acorns?",
    "Tell me a hilarious corn joke! 🌽",
    "Let's dance a beautiful pig pirouette!",
    "Are we best friends forever, Piggy?",
  ];

  return (
    <div id="app-root-container" className="min-h-screen bg-gradient-to-b from-[#FFF5F5] to-[#FFEBEB] text-gray-800 font-sans p-3 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* --- Header / Telemetry panel alternative (Stylized high contrast board) --- */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row items-center justify-between bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-pink-200/60 shadow-xs mb-2">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-pink-100 rounded-xl border border-pink-200">
              <span className="text-2xl">🐷</span>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center bg-pink-500 rounded-full text-[8px] text-white font-mono animate-pulse">★</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-pink-700 font-sans">Talking Piggy Go!</h1>
              <p className="text-xs text-gray-500">Your cheeky, food-obsessed AI pet companion</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0 font-mono text-xs">
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 text-amber-800">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-gray-600">Treasures:</span>
              <span className="font-bold">{points} pts</span>
            </div>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-pink-50 border-pink-200 text-pink-600'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
              title={soundEnabled ? "Mute interactive oinks" : "Unmute interactive oinks"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* --- Left Column: Interactive Piggy Stage and Gym --- */}
        <div className="lg:col-span-6 space-y-6">
          <div id="pig-stage-card" className="w-full flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-pink-200/80 shadow-md p-4 sm:p-6 overflow-hidden relative min-h-[500px]">
          
          {/* Farm garden beautiful background behind character */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#E0F2FE] via-[#F0FDF4] to-[#DCFCE7] opacity-65 pointer-events-none" />
          
          {/* Interactive Cloud element */}
          <div className="absolute top-6 left-6 flex items-center gap-1 text-white/90 text-2xl animate-pulse font-bold tracking-widest select-none select-none opacity-40">
            ☁️ ☁️
          </div>

          {/* Status meters at top of visual scene */}
          <div className="w-full grid grid-cols-2 gap-3 mb-6 relative z-10">
            <div className="bg-white/85 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex justify-between text-[10px] font-bold text-emerald-800 mb-1">
                <span>⚡ Energy Level</span>
                <span>{energy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  style={{ width: `${energy}%` }}
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div className="bg-white/85 px-3 py-1.5 rounded-xl border border-pink-200 shadow-2xs">
              <div className="flex justify-between text-[10px] font-bold text-pink-800 mb-1">
                <span>💖 Happiness Meter</span>
                <span>{happiness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  style={{ width: `${happiness}%` }}
                  className="bg-pink-500 h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* Sassy Floating Speech Bubble above pig head */}
          <div className="w-full max-w-md relative z-10 mb-2 min-h-[90px] flex items-end justify-center px-4">
            <div className="w-full bg-white text-gray-800 border-2 border-pink-200 rounded-2xl px-4 py-3 shadow-md relative text-sm text-center">
              {isThinking ? (
                <div className="flex items-center justify-center gap-1.5 text-pink-600 font-medium py-1 animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-400 rotate-animation" />
                  <span>Piggy is processing acorns...</span>
                </div>
              ) : (
                <p className="font-medium text-pink-900 leading-relaxed italic">
                  "{piggySpeech}"
                </p>
              )}
              {/* Talk status indicator mini badge */}
              <div className="absolute -bottom-2 right-4 bg-pink-100 text-[8px] font-bold text-pink-600 scale-90 tracking-wide uppercase px-1.5 rounded border border-pink-200">
                {pose === 'talking' ? 'Speaking Mouth 🎙️' : pose === 'listening' ? 'Listening...' : 'Idle ✿'}
              </div>
              <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-pink-200 rotate-45" />
            </div>
          </div>

          {/* Central Sprite Component */}
          <div className="relative flex items-center justify-center py-6 z-10 w-full">
            <PigSprite
              pose={pose}
              outfit={activeOutfit as any}
              className="w-60 h-60 sm:w-72 sm:h-72 drop-shadow-lg"
              isBouncing={isSpeaking || isThinking}
              onHeadClick={handleHeadPet}
              onBellyClick={handleBellyPoke}
              onBagClick={() => handleRummageTreasure({ name: 'Fresh Apple', emoji: '🍎', rarity: 'Common', points: 15 })}
            />
          </div>

          {/* Active view indication badge */}
          <div className="relative z-10 bg-white/95 px-3 py-1 rounded-xl border border-pink-100 text-[10px] font-medium text-pink-700/80 mt-2 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            <span>State: <strong className="font-bold text-pink-800">{POSES[pose]?.label}</strong></span>
          </div>
          
          <p className="text-[10px] text-pink-700/40 text-center mt-3 z-10 select-none">
            🖱️ Tap Piggy's <strong>head</strong> to pat, <strong>belly</strong> to tickle, or <strong>crossbody bag</strong> to rummage.
          </p>

        </div>

        {/* Card Module 3: Manual Piggy Controller - Spin Carousel and Reactions */}
        <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-pink-100 pb-2">
            <span className="text-xl">🕹️</span>
            <h2 className="text-base font-bold text-gray-800">Piggy Interactive Gym</h2>
          </div>

          {/* Quick angle rotaters */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-pink-800">Facing perspective angles:</span>
              <button
                onClick={handleFullSpin}
                disabled={isSpinning}
                className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 font-bold px-2 py-1 rounded-lg border border-amber-200 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>360° Spin Machine!</span>
              </button>
            </div>

            <div className="grid grid-cols-6 gap-1 font-mono">
              {(['angle_0', 'angle_45', 'angle_90', 'angle_180', 'angle_225', 'angle_270'] as const).map((angle) => (
                <button
                  key={angle}
                  onClick={() => {
                    if (!isSpinning) {
                      playSynthSound('poke');
                      setPose(angle);
                      setPiggySpeech(`Turning to my ${POSES[angle]?.label}! Oink, snort!`);
                    }
                  }}
                  disabled={isSpinning}
                  className={`p-1 text-[9px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                    pose === angle
                      ? 'bg-pink-600 border-pink-600 text-white font-extrabold'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {angle === 'angle_0' ? 'Front 0°' : angle === 'angle_45' ? '45°' : angle === 'angle_90' ? 'R 90°' : angle === 'angle_180' ? 'Back 180°' : angle === 'angle_225' ? '225°' : 'L 270°'}
                </button>
              ))}
            </div>
          </div>

          {/* Force instant emotions */}
          <div className="space-y-1.5 border-t border-pink-100/50 pt-3">
            <span className="text-xs font-semibold text-pink-800 block">Trigger interactive mood reaction:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['happy', 'laughing', 'crying', 'angry', 'scared', 'confused'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    if (!isSpinning) {
                      playSynthSound('squeak');
                      setPose(m);
                      
                      const commentMap = {
                        happy: "Oink! I feel great under the farm sun! ☀️",
                        laughing: "Hahaha squeeeeeal! Acorn tickles! 😂",
                        crying: "Squee-squee... I dropped my apple on the muddy floor... 😭",
                        angry: "Grrr! Snort! Angry pig rage mode! 😡",
                        scared: "Weee! Is that a giant wolf over the fence? Squeal! 😱",
                        confused: "Oink? Where did my backpack coins go? Do you know? 🧐",
                      };
                      setPiggySpeech(commentMap[m]);
                    }
                  }}
                  disabled={isSpinning}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    pose === m
                      ? 'bg-pink-100 border-pink-300 text-pink-700 font-extrabold shadow-2xs'
                      : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <span>{
                    m === 'happy' ? '😊 Happy' :
                    m === 'laughing' ? '😂 Joy' :
                    m === 'crying' ? '😭 Sad' :
                    m === 'angry' ? '😡 Anger' :
                    m === 'scared' ? '😱 Fear' :
                    '🧐 Surprise'
                  }</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Column: Speech & Actions Console Panel --- */}
      <div className="lg:col-span-6 space-y-6">
          
          {/* Card Module 1: Sassy Talk with Piggy */}
          <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <h2 className="text-base font-bold text-gray-800">Speak / Sound Echo Board</h2>
              </div>
              
              {/* Toggle switch: Smart AI vs basic squeaky echo */}
              <div className="flex items-center gap-1.5 bg-pink-50/70 p-1.5 rounded-xl border border-pink-100">
                <button
                  onClick={() => {
                    setAiMode(false);
                    playSynthSound('squeak');
                    setPiggySpeech("Oink! Switch to Echo Mode! Say anything, and I will squeal it back!");
                  }}
                  className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    !aiMode 
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-pink-700 hover:bg-pink-100/40'
                  }`}
                >
                  🎙️ Echo Mode
                </button>
                <button
                  onClick={() => {
                    setAiMode(true);
                    playSynthSound('success');
                    setPiggySpeech("Oink! Switch to Smart AI Mode! Ask me anything about farms, apples, or piggy magic!");
                  }}
                  className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    aiMode 
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-pink-700 hover:bg-pink-100/40'
                  }`}
                >
                  🤖 Smart AI
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <div className="space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInputSubmission(speechText);
                }}
                className="flex gap-2"
              >
                {/* Voice Toggle microphone button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    isListening 
                      ? 'bg-red-500 border-red-600 text-white animate-pulse'
                      : 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-600 active:scale-95'
                  }`}
                  title={isListening ? "Stop listening" : "Tap and speak to microphone"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  placeholder={
                    isListening 
                      ? "Listening to your voice..." 
                      : aiMode 
                        ? "Ask smart Piggy something sassy..." 
                        : "Type something for Piggy to mimic..."
                  }
                  disabled={isListening}
                  className="flex-1 bg-gray-50 border border-pink-200 outline-hidden focus:border-pink-400 focus:bg-white text-sm rounded-xl px-4 py-2 text-gray-800 placeholder-gray-400 transition-all font-medium"
                />

                <button
                  type="submit"
                  disabled={isListening || !speechText.trim()}
                  className="bg-pink-600 border border-pink-700 text-white hover:bg-pink-700 active:scale-95 transition-all text-xs font-bold px-4 rounded-xl flex items-center gap-1 shrink-0 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:scale-100 cursor-pointer"
                >
                  <span>Say</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {micError && (
                <p className="text-[10px] text-red-500 text-center font-medium bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">
                  ⚠️ {micError}
                </p>
              )}
            </div>

            {/* Predefined prompt tags */}
            {aiMode && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-pink-800/60 font-semibold tracking-wider uppercase block">
                  💡 Tap quick conversation items:
                </span>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-xs font-medium text-pink-800">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInputSubmission(p)}
                      className="bg-pink-50 hover:bg-pink-100 rounded-lg px-2.5 py-1.5 border border-pink-100 text-[11px] cursor-pointer text-left transition-all hover:scale-101 active:scale-98"
                    >
                      🗣️ "{p}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card Module 2: The Backpack & Snack Cabinet Cabinet component */}
          <BackpackCabinet
            onFeed={handleFeedSnack}
            onRummage={handleRummageTreasure}
            isRummaging={isRummaging}
          />

          {/* Card Module 2.5: Piggy's Fashion Boutique Closet */}
          <div className="bg-white rounded-3xl border border-pink-200/80 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧥</span>
                <h2 className="text-base font-bold text-gray-800">Piggy's Fashion Boutique</h2>
              </div>
              <span className="text-[10px] bg-pink-100 text-pink-700 font-extrabold px-2 py-0.5 rounded-full border border-pink-200">
                ⭐ Oink Couture
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Play with Piggy by chatting, patting her head (+15 pts), spinning (+30 pts), or feeding sweet acorns to win points and buy gorgeous clothing outfits!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { id: 'classic', name: 'Classic Pink', cost: 0, icon: '🐷', desc: 'Standard sweet oink pasture style' },
                { id: 'farmer', name: 'Cozy Farmer', cost: 50, icon: '👩‍🌾', desc: 'Denim overalls and straw sun hat' },
                { id: 'party', name: 'Party Sensation', cost: 150, icon: '🎉', desc: 'Cone hat, bowtie and star shades' },
                { id: 'detective', name: 'Sherlock Holmes', cost: 220, icon: '🕵️', desc: 'Tweed capelet, cap & gold monocle' },
                { id: 'royal', name: 'Pasture Royalty', cost: 300, icon: '👑', desc: 'Sovereign crown and red velvet cape' },
                { id: 'astronaut', name: 'Astro-Piggy', cost: 400, icon: '🚀', desc: 'Air bubble helmet & space pad suit' },
              ].map((outfitItem) => {
                const isUnlocked = unlockedOutfits.includes(outfitItem.id);
                const isActive = activeOutfit === outfitItem.id;
                const canAfford = points >= outfitItem.cost;
                
                return (
                  <div
                    key={outfitItem.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-gradient-to-br from-pink-50/60 to-pink-50 border-pink-400 shadow-2xs'
                        : isUnlocked
                          ? 'bg-amber-50/20 hover:bg-amber-50/40 border-amber-100'
                          : 'bg-gray-50/50 border-gray-100 hover:border-gray-200 opacity-95'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="text-2xl p-2 bg-white rounded-xl border border-pink-100 shadow-3xs shrink-0 flex items-center justify-center w-11 h-11">
                        {outfitItem.icon}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-xs font-extrabold text-pink-950 flex items-center gap-1">
                          <span>{outfitItem.name}</span>
                          {isActive && (
                            <span className="text-[8px] bg-pink-600 text-white font-extrabold px-1 rounded-full uppercase leading-3 animate-pulse">Worn</span>
                          )}
                        </h3>
                        <p className="text-[10px] text-gray-400 leading-snug">{outfitItem.desc}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      {isActive ? (
                        <div className="w-full text-center text-[10px] bg-pink-100 text-pink-700 font-extrabold py-1.5 rounded-xl border border-pink-200/60 font-mono">
                          ★ Currently Outfitted ★
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleWearOutfit(outfitItem.id)}
                          className="w-full text-xs bg-gray-800 text-white hover:bg-black font-extrabold py-1.5 rounded-xl border border-gray-700 active:scale-95 transition-all text-center cursor-pointer font-sans"
                        >
                          Wear Outfit 👚
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlockOutfit(outfitItem.id, outfitItem.cost, outfitItem.name)}
                          className={`w-full text-xs font-extrabold py-1.5 rounded-xl transition-all cursor-pointer text-center border font-sans ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 active:scale-95'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          Unlock (⭐ {outfitItem.cost} pts)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* --- Card Module 4: Simple, humble game instructions --- */}
        <div className="lg:col-span-12 bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-pink-200/40 text-center space-y-2 mt-2">
          <div className="flex items-center justify-center gap-2 text-pink-700 font-bold text-sm">
            <BookOpen className="w-4 h-4 text-pink-500" />
            <span>How to play with Piggy:</span>
          </div>
          <p className="text-xs text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Talking Piggy Go! is an interactive digital companion. Tap directly on <strong>Piggy's body</strong> inside the pasture to pat her head or tickle her tummy. Feed delicious snacks to boost Piggy's metrics, turn them around with different angles, or rummage their crossbody bag pocket for magical findings to increase your treasure score points. Toggle **Smart AI mode** for real Gemini interactions and hear Piggy speak back with genuine voice-bouncing mouth talking lips!
          </p>
        </div>

      </div>
    </div>
  );
}
