/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface PoseInfo {
  label: string;
  category: 'emotions' | 'angles' | 'actions';
}

export const POSES = {
  // Emotions
  happy: { label: "HAPPY (Idle)", category: "emotions" },
  laughing: { label: "LAUGHING (Extreme Joy)", category: "emotions" },
  crying: { label: "CRYING (Sadness)", category: "emotions" },
  angry: { label: "ANGRY (Rage)", category: "emotions" },
  scared: { label: "SCARED (Fear)", category: "emotions" },
  confused: { label: "CONFUSED (Surprise)", category: "emotions" },

  // Angles
  angle_0: { label: "0° (Front)", category: "angles" },
  angle_45: { label: "45° Angle", category: "angles" },
  angle_90: { label: "90° (Right Profile)", category: "angles" },
  angle_225: { label: "225° Angle", category: "angles" },
  angle_180: { label: "180° (Back)", category: "angles" },
  angle_270: { label: "270° (Left Profile)", category: "angles" },

  // Actions
  idle: { label: "Action Idle", category: "actions" },
  talking: { label: "Talking", category: "actions" },
  listening: { label: "Listening", category: "actions" },
  poke_belly: { label: "Poke Belly", category: "actions" },
  petted_head: { label: "Petted Head", category: "actions" },
  opening_bag: { label: "Opening Bag", category: "actions" },
};

export type PigOutfit = 'classic' | 'detective' | 'royal' | 'farmer' | 'astronaut' | 'party';

interface PigSpriteProps {
  pose: keyof typeof POSES;
  outfit?: PigOutfit;
  className?: string;
  isBouncing?: boolean;
  onHeadClick?: () => void;
  onBellyClick?: () => void;
  onBagClick?: () => void;
}

export const PigSprite: React.FC<PigSpriteProps> = ({
  pose,
  outfit = 'classic',
  className = "w-64 h-64 md:w-80 md:h-80",
  isBouncing = false,
  onHeadClick,
  onBellyClick,
  onBagClick,
}) => {
  // Determine if we should show the back of the pig
  const isBackView = pose === 'angle_180' || pose === 'angle_225';
  
  // Calculate character tilt / offsets for 2.5D depth movement
  let faceOffsetX = 0; // shift face left/right
  let faceOffsetY = 0; // shift face up/down
  let bodyRotation = 0; // rotate body
  let eyeScaleY = 1; // blinking
  let mouthScaleY = 1; // talking

  // Apply shifts based on angles
  if (pose === 'angle_45') {
    faceOffsetX = 18;
    bodyRotation = 5;
  } else if (pose === 'angle_90') {
    faceOffsetX = 35;
    bodyRotation = 12;
  } else if (pose === 'angle_270') {
    faceOffsetX = -35;
    bodyRotation = -12;
  } else if (pose === 'angle_225') {
    faceOffsetX = -18;
    bodyRotation = -5;
  }

  // Adjustments based on emotions/actions
  if (pose === 'petted_head') {
    faceOffsetY = 6;
  } else if (pose === 'poke_belly') {
    faceOffsetY = -2;
    bodyRotation = -3;
  } else if (pose === 'talking') {
    mouthScaleY = 1.8;
  }

  return (
    <div className={`relative select-none select-none ${className} flex items-center justify-center`}>
      <motion.svg
        viewBox="0 0 200 220"
        className="w-full h-full"
        animate={{
          y: isBouncing ? [0, -12, 0] : 0,
        }}
        transition={{
          y: isBouncing 
            ? { repeat: Infinity, duration: 0.6, ease: "easeInOut" } 
            : { duration: 0.3 }
        }}
      >
        {/* Ground Shadow */}
        <ellipse cx="100" cy="202" rx="60" ry="8" fill="#E2D0D0" opacity="0.6" />

        <g id="piggy-body-group" style={{ transformOrigin: '100px 140px' }}>
          
          {/* LEFT OUTER EAR (drawn behind body for angles facing back left, otherwise in front) */}
          {!isBackView && (
            <path
              d="M 52,43 C 25,28 32,5 57,11 C 65,13 65,25 58,35"
              fill="#FDF0E9"
              stroke="#451A03"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          )}

          {/* INNER EAR PINK LEFT */}
          {!isBackView && (
            <path
              d="M 46,38 C 34,28 38,15 50,18 C 55,19 55,27 49,33"
              fill="#FCA5A5"
            />
          )}

          {/* RIGHT OUTER EAR */}
          {!isBackView && (
            <path
              d="M 148,43 C 175,28 168,5 143,11 C 135,13 135,25 142,35"
              fill="#FDF0E9"
              stroke="#451A03"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          )}

          {/* INNER EAR PINK RIGHT */}
          {!isBackView && (
            <path
              d="M 154,38 C 166,28 162,15 150,18 C 145,19 145,27 151,33"
              fill="#FCA5A5"
            />
          )}

          {/* BACK VIEW EARS */}
          {isBackView && (
            <>
              {/* Ears seen from behind (fully cream-pink, no pink front innards visible) */}
              <path
                d="M 52,43 C 25,28 32,5 57,11 C 65,13 65,25 58,35"
                fill="#FDF0E9"
                stroke="#451A03"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path
                d="M 148,43 C 175,28 168,5 143,11 C 135,13 135,25 142,35"
                fill="#FDF0E9"
                stroke="#451A03"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* REAR CURLY TAIL (Visible when facing back or profile) */}
          {(isBackView || pose === 'angle_90' || pose === 'angle_270') && (
            <g transform={`translate(${pose === 'angle_90' ? 30 : pose === 'angle_270' ? 170 : 100}, 150)`}>
              {/* Cute curly loop */}
              <motion.path
                d="M 0,0 C -25,-5 -20,-25 -5,-25 C 10,-25 10,-10 0,-10 C -10,-10 -5,0 5,5"
                fill="none"
                stroke="#451A03"
                strokeWidth="3.5"
                strokeLinecap="round"
                animate={{
                  rotate: isBouncing ? [0, 15, -15, 0] : 0
                }}
              />
              {/* Pink tail skin tip */}
              <circle cx="5" cy="5" r="3" fill="#FB7185" />
            </g>
          )}

          {/* FEET / LEGS */}
          <g id="feet">
            {/* Left foot */}
            <rect
              x="72"
              y="172"
              width="18"
              height="20"
              rx="9"
              fill="#FDF0E9"
              stroke="#451A03"
              strokeWidth="3.5"
            />
            {/* Left hoof pink accent split */}
            <path d="M 72,185 L 90,185" stroke="#451A03" strokeWidth="2.5" />
            <path d="M 81,185 L 81,192" stroke="#451A03" strokeWidth="2.5" />

            {/* Right foot */}
            <rect
              x="110"
              y="172"
              width="18"
              height="20"
              rx="9"
              fill="#FDF0E9"
              stroke="#451A03"
              strokeWidth="3.5"
            />
            {/* Right hoof pink accent split */}
            <path d="M 110,185 L 128,185" stroke="#451A03" strokeWidth="2.5" />
            <path d="M 119,185 L 119,192" stroke="#451A03" strokeWidth="2.5" />
          </g>

          {/* MAIN CHUBBY BELLY / BODY */}
          <ellipse
            cx="100"
            cy="134"
            rx="56"
            ry="48"
            fill="#FDF0E9"
            stroke="#451A03"
            strokeWidth="3.5"
          />

          {/* Torso Body Outfits Layer */}
          {outfit === 'farmer' && (
            <g id="outfit-farmer-overalls">
              {/* Overalls Pants & Bib */}
              <path
                d="M 58,136 C 58,158 74,178 100,178 C 126,178 142,158 142,136 L 134,118 L 66,118 Z"
                fill="#2563EB"
                stroke="#451A03"
                strokeWidth="3.2"
              />
              {/* Left suspender strap */}
              <path d="M 68,118 L 54,98" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
              {/* Right suspender strap */}
              <path d="M 132,118 L 146,98" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
              {/* Gold buckle buttons */}
              <circle cx="72" cy="124" r="3" fill="#FBBF24" stroke="#451A03" strokeWidth="1.2" />
              <circle cx="128" cy="124" r="3" fill="#FBBF24" stroke="#451A03" strokeWidth="1.2" />
              {/* Cute front bib pouch pocket */}
              <path d="M 88,136 L 112,136 L 108,152 L 92,152 Z" fill="#1D4ED8" stroke="#451A03" strokeWidth="1.8" />
            </g>
          )}

          {outfit === 'royal' && (
            <g id="outfit-royal-cape">
              {/* Heavy velvet drape red cape over the shoulders */}
              <path
                d="M 46,118 C 24,142 46,182 66,180"
                fill="none"
                stroke="#DC2626"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <path
                d="M 154,118 C 176,142 154,182 134,180"
                fill="none"
                stroke="#DC2626"
                strokeWidth="11"
                strokeLinecap="round"
              />
              {/* Gold neck medallion chain */}
              <path d="M 66,116 Q 100,128 134,116" fill="none" stroke="#FBBF24" strokeWidth="4.5" />
              <circle cx="100" cy="123" r="8.5" fill="#2563EB" stroke="#FBBF24" strokeWidth="2" />
            </g>
          )}

          {outfit === 'detective' && (
            <g id="outfit-detective-suit">
              {/* Dapper tweed vest / collar details */}
              <path
                d="M 74,108 L 100,132 L 126,108"
                fill="none"
                stroke="#78350F"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path d="M 100,114 L 100,135" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
              {/* Tiny gold vest buttons */}
              <circle cx="100" cy="118" r="3.2" fill="#FBBF24" stroke="#451A03" strokeWidth="1" />
              <circle cx="100" cy="128" r="3.2" fill="#FBBF24" stroke="#451A03" strokeWidth="1" />
            </g>
          )}

          {outfit === 'astronaut' && (
            <g id="outfit-astronaut-suit">
              {/* Interstellar steel plates */}
              <path
                d="M 62,128 C 62,154 74,176 100,176 C 126,176 138,154 138,128 Z"
                fill="#E2E8F0"
                stroke="#451A03"
                strokeWidth="3.2"
              />
              {/* Technics glowing logic keypad */}
              <rect x="84" y="136" width="32" height="22" rx="4" fill="#475569" stroke="#451A03" strokeWidth="2.2" />
              <circle cx="92" cy="147" r="3" fill="#EF4444" />
              <circle cx="100" cy="147" r="3" fill="#10B981" />
              <rect x="106" y="145" width="6" height="4.5" fill="#3B82F6" />
            </g>
          )}

          {outfit === 'party' && (
            <g id="outfit-party-bowtie">
              {/* Dashing pink party bow tie at the throat */}
              <path d="M 83,103 L 100,111 L 83,119 Z" fill="#EC4899" stroke="#451A03" strokeWidth="3" />
              <path d="M 117,103 L 100,111 L 117,119 Z" fill="#EC4899" stroke="#451A03" strokeWidth="3" />
              <circle cx="100" cy="111" r="5" fill="#FBBF24" stroke="#451A03" strokeWidth="2" />
            </g>
          )}

          {/* MAIN MASSIVE ROUND HEAD */}
          <ellipse
            cx="100"
            cy="75"
            rx="58"
            ry="48"
            fill="#FDF0E9"
            stroke="#451A03"
            strokeWidth="3.5"
          />

          {/* --- FACE ELEMENTS DESIGN (ONLY IF NOT BACK VIEW) --- */}
          {!isBackView && (
            <motion.g
              id="piggy-face"
              animate={{
                x: faceOffsetX,
                y: faceOffsetY,
              }}
              transition={{ type: "spring", stiffness: 140, damping: 15 }}
            >
              {/* Rosy blush cheeks */}
              <ellipse cx="58" cy="84" rx="10" ry="7" fill="#FDA4AF" opacity="0.85" />
              <ellipse cx="142" cy="84" rx="10" ry="7" fill="#FDA4AF" opacity="0.85" />

              {/* EYE RENDERING (Customized per emotion!) */}
              <g id="piggy-eyes">
                {/* Lazy / Blink / Happy Eye Curves */}
                {(pose === 'happy' || pose === 'petted_head' || pose === 'laughing' || pose === 'idle') && (
                  <>
                    {/* Cute arcs */}
                    <path d="M 70,66 Q 76,60 82,66" fill="none" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 118,66 Q 124,60 130,66" fill="none" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
                  </>
                )}

                {/* Sad / Crying Teary Eyes */}
                {pose === 'crying' && (
                  <>
                    {/* Squeezed wet eyes */}
                    <path d="M 68,68 Q 75,61 82,65" fill="none" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 118,65 Q 125,61 132,68" fill="none" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
                    {/* Drip crying tears */}
                    <motion.circle
                      cx="73"
                      cy="74"
                      r="3.5"
                      fill="#38BDF8"
                      animate={{ y: [0, 20], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeIn" }}
                    />
                    <motion.circle
                      cx="127"
                      cy="74"
                      r="3.5"
                      fill="#38BDF8"
                      animate={{ y: [0, 20], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeIn", delay: 0.4 }}
                    />
                  </>
                )}

                {/* Angry angled eyebrows */}
                {pose === 'angry' && (
                  <>
                    <path d="M 67,58 L 81,64" stroke="#451A03" strokeWidth="3.8" strokeLinecap="round" />
                    <path d="M 133,58 L 119,64" stroke="#451A03" strokeWidth="3.8" strokeLinecap="round" />
                    <circle cx="75" cy="68" r="4" fill="#451A03" />
                    <circle cx="125" cy="68" r="4" fill="#451A03" />
                  </>
                )}

                {/* Scared / Confused wide round eyes */}
                {(pose === 'scared' || pose === 'confused' || pose === 'listening') && (
                  <>
                    {/* Left white backdrop */}
                    <circle cx="74" cy="66" r="8" fill="white" stroke="#451A03" strokeWidth="2.5" />
                    <circle cx="74" cy="66" r="3.5" fill="#451A03" />

                    {/* Right white backdrop */}
                    <circle cx="126" cy="66" r="8" fill="white" stroke="#451A03" strokeWidth="2.5" />
                    <circle cx="126" cy="66" r="3.5" fill="#451A03" />
                  </>
                )}

                {/* Poke Belly squeezed cross eyes (X X) */}
                {pose === 'poke_belly' && (
                  <>
                    {/* X on left */}
                    <path d="M 70,62 L 78,70 M 78,62 L 70,70" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
                    {/* X on right */}
                    <path d="M 122,62 L 130,70 M 130,62 L 122,70" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
                  </>
                )}

                {/* Talking Eyes */}
                {pose === 'talking' && (
                  <>
                    <circle cx="75" cy="65" r="4.5" fill="#451A03" />
                    <circle cx="125" cy="65" r="4.5" fill="#451A03" />
                  </>
                )}
              </g>

              {/* ROSY NOSE / SNOUT */}
              <g id="piggy-snout">
                {/* Snout base border */}
                <rect
                  x="84"
                  y="71"
                  width="32"
                  height="22"
                  rx="11"
                  fill="#FB7185"
                  stroke="#451A03"
                  strokeWidth="3.5"
                />
                {/* Nostrils */}
                <ellipse cx="94" cy="82" rx="2" ry="4" fill="#9F1239" />
                <ellipse cx="106" cy="82" rx="2" ry="4" fill="#9F1239" />
              </g>

              {/* MOUTH (Opening / Animating) */}
              <motion.g
                id="piggy-mouth"
                transform="translate(100, 99)"
                animate={{
                  scaleY: mouthScaleY
                }}
                transition={{ duration: 0.15 }}
              >
                {/* Laughing wide open mouth with pink tongue */}
                {(pose === 'laughing' || pose === 'talking') ? (
                  <path
                    d="M -10,0 C -10,12 10,12 10,0 Z"
                    fill="#9F1239"
                    stroke="#451A03"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                ) : (pose === 'crying' || pose === 'angry' || pose === 'poke_belly') ? (
                  /* Sad frown mouth */
                  <path
                    d="M -8,3 Q 0,-3 8,3"
                    fill="none"
                    stroke="#451A03"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                ) : pose === 'scared' ? (
                  /* Squiggly mouth */
                  <path
                    d="M -8,0 Q -4,3 0,0 Q 4,-3 8,0"
                    fill="none"
                    stroke="#451A03"
                    strokeWidth="3"
                  />
                ) : (
                  /* Cute small smiley line */
                  <path
                    d="M -7,-1 Q 0,4 7,-1"
                    fill="none"
                    stroke="#451A03"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                )}
              </motion.g>

              {/* Floating Confusion Question Mark */}
              {pose === 'confused' && (
                <motion.text
                  x="152"
                  y="48"
                  fontSize="22"
                  fontWeight="bold"
                  fill="#78350F"
                  animate={{ y: [0, -6, 0], scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ?
                </motion.text>
              )}

              {/* Cute heart spark bubble for petted head */}
              {pose === 'petted_head' && (
                <motion.text
                  x="115"
                  y="20"
                  fontSize="20"
                  fill="#EC4899"
                  animate={{ scale: [0, 1.2, 1], y: [10, -10], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🌸
                </motion.text>
              )}

              {/* Sweat droplet for scared */}
              {pose === 'scared' && (
                <motion.path
                  d="M 44,52 C 40,55 36,60 41,63 C 44,65 47,60 44,52 Z"
                  fill="#38BDF8"
                  stroke="#1D4ED8"
                  strokeWidth="1.2"
                  animate={{ y: [0, 8] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}

              {/* Front View Headwear Outfits */}
              {outfit === 'farmer' && (
                <g id="outfit-farmer-hat-head" style={{ transformOrigin: '100px 32px' }}>
                  {/* Broad brim */}
                  <ellipse cx="100" cy="35" rx="66" ry="11" fill="#FCD34D" stroke="#451A03" strokeWidth="3.2" />
                  {/* Hat Crown dome */}
                  <path d="M 64,34 C 64,8 136,8 136,34 Z" fill="#FCD34D" stroke="#451A03" strokeWidth="3.2" />
                  {/* Straw weave red ribbon */}
                  <path d="M 65,31 Q 100,34 135,31" stroke="#DC2626" strokeWidth="3.5" fill="none" />
                </g>
              )}

              {outfit === 'royal' && (
                <g id="outfit-royal-crown-head" style={{ transformOrigin: '100px 30px' }}>
                  {/* Gold Crown */}
                  <path
                    d="M 75,32 L 125,32 L 122,14 L 110,24 L 100,10 L 90,24 L 78,14 Z"
                    fill="#FBBF24"
                    stroke="#451A03"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                  {/* Diamonds/Gems */}
                  <circle cx="85" cy="27" r="2.5" fill="#EF4444" />
                  <circle cx="100" cy="27" r="3" fill="#3B82F6" />
                  <circle cx="115" cy="27" r="2.5" fill="#10B981" />
                  <circle cx="78" cy="11" r="3" fill="#FBBF24" stroke="#451A03" strokeWidth="1" />
                  <circle cx="100" cy="7" r="3.5" fill="#FBBF24" stroke="#451A03" strokeWidth="1" />
                  <circle cx="122" cy="11" r="3" fill="#FBBF24" stroke="#451A03" strokeWidth="1" />
                </g>
              )}

              {outfit === 'detective' && (
                <g id="outfit-detective-hat-and-monocle">
                  {/* Monocle over right eye */}
                  <g id="outfit-detective-monocle">
                    <circle cx="126" cy="66" r="11" fill="rgba(251,191,36,0.15)" stroke="#FBBF24" strokeWidth="3" />
                    <path d="M 137,66 C 143,66 148,84 140,94" fill="none" stroke="#FBBF24" strokeWidth="1.8" strokeDasharray="3,3" />
                  </g>
                  {/* Sherlock Tweed Hat */}
                  <g id="outfit-detective-hat-head" style={{ transformOrigin: '100px 32px' }}>
                    <path d="M 60,34 C 60,-2 140,-2 140,34 Z" fill="#78350F" stroke="#451A03" strokeWidth="3.2" />
                    <path d="M 52,32 C 52,32 46,41 68,37" stroke="#451A03" strokeWidth="3" fill="#9A3412" strokeLinecap="round" />
                    <path d="M 148,32 C 148,32 154,41 132,37" stroke="#451A03" strokeWidth="3" fill="#9A3412" strokeLinecap="round" />
                    <circle cx="100" cy="4" r="5" fill="#9A3412" stroke="#451A03" strokeWidth="1.5" />
                  </g>
                </g>
              )}

              {outfit === 'astronaut' && (
                <g id="outfit-astronaut-helmet-head">
                  {/* Glossy Retro Space Glass Helmet */}
                  <circle cx="100" cy="74" r="58" fill="rgba(14, 165, 233, 0.16)" stroke="#0284C7" strokeWidth="3.5" />
                  <circle cx="42" cy="74" r="6" fill="#F1F5F9" stroke="#451A03" strokeWidth="2.5" />
                  <circle cx="158" cy="74" r="6" fill="#F1F5F9" stroke="#451A03" strokeWidth="2.5" />
                  <path d="M 100,16 L 100,3" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="1" r="3.5" fill="#EF4444" />
                  <path d="M 60,42 A 46 46 0 0 1 112,24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />
                </g>
              )}

              {outfit === 'party' && (
                <g id="outfit-party-hat-and-star-glasses">
                  {/* Star party sunglasses */}
                  <g id="outfit-party-star-glasses">
                    <path
                      d="M 56,66 L 66,66 L 70,56 L 74,66 L 84,66 L 76,72 L 79,81 L 70,75 L 61,81 L 64,72 Z"
                      fill="#FBBF24"
                      opacity="0.9"
                      stroke="#451A03"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M 116,66 L 126,66 L 130,56 L 134,66 L 144,66 L 136,72 L 139,81 L 130,75 L 121,81 L 124,72 Z"
                      fill="#FBBF24"
                      opacity="0.9"
                      stroke="#451A03"
                      strokeWidth="2.2"
                    />
                    <path d="M 84,66 L 116,66" stroke="#451A03" strokeWidth="2.5" />
                  </g>
                  {/* Neon Teal Cone Party Hat */}
                  <g id="outfit-party-hat-head" style={{ transformOrigin: '100px 32px' }}>
                    <path d="M 76,32 L 124,32 L 100,0 Z" fill="#06B6D4" stroke="#451A03" strokeWidth="3.2" strokeLinejoin="round" />
                    <path d="M 86,22 L 102,22 L 100,0 Z" fill="#FBBF24" />
                    <path d="M 94,11 L 106,11 L 100,0 Z" fill="#EC4899" />
                    <circle cx="100" cy="-2" r="6" fill="#FCD34D" stroke="#451A03" strokeWidth="2" />
                  </g>
                </g>
              )}
            </motion.g>
          )}

          {/* BACK VIEW BACK DETAILS */}
          {isBackView && (
            <>
              <g id="backview-details">
                {/* Crossed bag strap on piggy's back */}
                <path
                  d="M 50,110 L 150,150"
                  stroke="#C27D38"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 150,110 L 50,150"
                  stroke="#A16207"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Round back fat folds */}
                <path d="M 85,115 C 95,118 105,118 115,115" stroke="#E2D0D0" strokeWidth="3" fill="none" />
                <path d="M 80,135 C 95,139 105,139 120,135" stroke="#E2D0D0" strokeWidth="3" fill="none" />
              </g>

              {/* Backview Headwear Group matching head spring/tilt offsets */}
              <g id="backview-headwear" transform={`translate(${faceOffsetX}, ${faceOffsetY})`}>
                {outfit === 'farmer' && (
                  <g id="outfit-back-farmer-hat" style={{ transformOrigin: '100px 32px' }}>
                    <ellipse cx="100" cy="35" rx="66" ry="11" fill="#FCD34D" stroke="#451A03" strokeWidth="3.2" />
                    <path d="M 64,34 C 64,8 136,8 136,34 Z" fill="#FCD34D" stroke="#451A03" strokeWidth="3.2" />
                    <path d="M 65,31 Q 100,34 135,31" stroke="#DC2626" strokeWidth="3.5" fill="none" />
                  </g>
                )}

                {outfit === 'royal' && (
                  <g id="outfit-back-royal-crown" style={{ transformOrigin: '100px 30px' }}>
                    <path
                      d="M 75,32 L 125,32 L 122,14 L 110,24 L 100,10 L 90,24 L 78,14 Z"
                      fill="#FBBF24"
                      stroke="#451A03"
                      strokeWidth="3.2"
                      strokeLinejoin="round"
                    />
                    {/* Back side of Crown lacks front gems, but has sovereign metallic structure */}
                    <circle cx="78" cy="11" r="3" fill="#FBBF24" stroke="#451A03" strokeWidth="1" />
                    <circle cx="100" cy="7" r="3.5" fill="#FBBF24" stroke="#451A03" strokeWidth="1" />
                    <circle cx="122" cy="11" r="3" fill="#FBBF24" stroke="#451A03" strokeWidth="1" />
                  </g>
                )}

                {outfit === 'detective' && (
                  <g id="outfit-back-detective-hat" style={{ transformOrigin: '100px 32px' }}>
                    <path d="M 60,34 C 60,-2 140,-2 140,34 Z" fill="#78350F" stroke="#451A03" strokeWidth="3.2" />
                    <path d="M 52,32 C 52,32 46,41 68,37" stroke="#451A03" strokeWidth="3" fill="#9A3412" strokeLinecap="round" />
                    <path d="M 148,32 C 148,32 154,41 132,37" stroke="#451A03" strokeWidth="3" fill="#9A3412" strokeLinecap="round" />
                    <circle cx="100" cy="4" r="5" fill="#9A3412" stroke="#451A03" strokeWidth="1.5" />
                  </g>
                )}

                {outfit === 'astronaut' && (
                  <g id="outfit-back-astronaut-helmet">
                    {/* Translucent bubble is seen around entire head from behind */}
                    <circle cx="100" cy="74" r="58" fill="rgba(14, 165, 233, 0.16)" stroke="#0284C7" strokeWidth="3.5" />
                    <path d="M 100,16 L 100,3" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="100" cy="1" r="3.5" fill="#EF4444" />
                  </g>
                )}

                {outfit === 'party' && (
                  <g id="outfit-back-party-hat" style={{ transformOrigin: '100px 32px' }}>
                    <path d="M 76,32 L 124,32 L 100,0 Z" fill="#06B6D4" stroke="#451A03" strokeWidth="3.2" strokeLinejoin="round" />
                    <path d="M 86,22 L 102,22 L 100,0 Z" fill="#FBBF24" />
                    <circle cx="100" cy="-2" r="6" fill="#FCD34D" stroke="#451A03" strokeWidth="2" />
                  </g>
                )}
              </g>
            </>
          )}

          {/* ARMS (Only drawn in front of body unless holding or behind) */}
          <g id="arms">
            {/* Left Arm waving slightly for talking/listening */}
            <motion.path
              d={
                pose === 'listening'
                  ? "M 48,125 C 25,110 22,88 38,82 C 48,78 52,105 48,125" // wave hand up near neck
                  : pose === 'poke_belly'
                    ? "M 48,125 C 38,135 60,145 52,125" // protective shield
                    : "M 48,125 C 28,135 30,150 42,142" // default resting chubby arm
              }
              fill="#FDF0E9"
              stroke="#451A03"
              strokeWidth="3.5"
              strokeLinejoin="round"
              animate={pose === 'listening' ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />

            {/* Right Arm */}
            <path
              d={
                pose === 'opening_bag'
                  ? "M 152,125 C 135,140 120,155 125,135" // hands on bag rummaging
                  : "M 152,125 C 172,135 170,150 158,142" // default arm
              }
              fill="#FDF0E9"
              stroke="#451A03"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>

          {/* --- CROSSBODY BACKPACK SLING BAG --- */}
          {/* Always located on the bottom left hip of front view */}
          {!isBackView && (
            <g id="shoulder-crossbody-bag" style={{ transformOrigin: '78px 150px' }}>
              {/* Shoulder Strap crossing torso */}
              <path
                d="M 145,95 L 78,142"
                stroke="#C27D38"
                strokeWidth="4.5"
                strokeLinecap="round"
              />

              {/* Brown Leather Bag Body */}
              <motion.g
                animate={pose === 'opening_bag' ? { scale: 1.1, y: -2 } : {}}
                transition={{ duration: 0.2 }}
              >
                {/* Base bag rounded rect */}
                <rect
                  x="60"
                  y="135"
                  width="36"
                  height="28"
                  rx="9"
                  fill="#92400E" // dark brown
                  stroke="#451A03"
                  strokeWidth="3.3"
                />

                {/* Front Leather Pocket cover flap */}
                <motion.path
                  d={
                    pose === 'opening_bag'
                      ? "M 58,135 C 58,122 98,122 98,135" // open flap upwards
                      : "M 58,135 L 98,135 L 90,152 C 85,156 73,156 66,152 Z" // closed flap downwards
                  }
                  fill="#B45309"
                  stroke="#451A03"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* Gold brass lock button */}
                <circle cx="78" cy="148" r="3" fill="#FBBF24" />

                {/* Glittering magic item sparkle if open */}
                {pose === 'opening_bag' && (
                  <motion.circle
                    cx="78"
                    cy="132"
                    r="4"
                    fill="#34D399"
                    animate={{ scale: [0.5, 1.3, 0.5], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                )}
              </motion.g>
            </g>
          )}

          {/* BACK VIEW SADDLE / BAG STRAP RETENTION */}
          {isBackView && (
            <g id="backview-bag">
              {/* Back side of crossbody backpack */}
              <rect
                x="65"
                y="138"
                width="34"
                height="26"
                rx="8"
                fill="#78350F"
                stroke="#451A03"
                strokeWidth="3"
              />
              <circle cx="82" cy="151" r="5" fill="#451A03" opacity="0.4" />
            </g>
          )}

        </g>
      </motion.svg>

      {/* Target Interaction Hotspots overlays (only active when facing front & not spinning) */}
      {!isBackView && pose !== 'angle_90' && pose !== 'angle_270' && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Head Pet Hotspot: top 35% circle */}
          <button
            id="hotspot-head-pet-svg"
            onClick={(e) => {
              e.stopPropagation();
              onHeadClick?.();
            }}
            title="Pat Head"
            className="absolute top-[10%] left-[22%] w-[56%] h-[32%] pointer-events-auto rounded-full 
              hover:bg-pink-300/15 cursor-pointer flex items-center justify-center group"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-pink-100 text-pink-700 text-[10px] px-1.5 py-0.5 rounded border border-pink-200 shadow-sm whitespace-nowrap">
              Pat Head 🌸
            </span>
          </button>

          {/* Belly Poke Hotspot: middle 40%-75% circle on the left side */}
          <button
            id="hotspot-belly-poke-svg"
            onClick={(e) => {
              e.stopPropagation();
              onBellyClick?.();
            }}
            title="Poke Belly"
            className="absolute top-[44%] left-[28%] w-[44%] h-[28%] pointer-events-auto rounded-full 
              hover:bg-red-300/15 cursor-pointer flex items-center justify-center group"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded border border-red-200 shadow-sm whitespace-nowrap">
              Tickle Me!
            </span>
          </button>

          {/* Rummage Bag Hotspot: over the brown leather shoulder sling bag (bottom-left region of torso) */}
          <button
            id="hotspot-bag-svg"
            onClick={(e) => {
              e.stopPropagation();
              onBagClick?.();
            }}
            title="Open Backpack Bag"
            className="absolute top-[65%] left-[24%] w-[30%] h-[18%] pointer-events-auto rounded-xl 
              hover:bg-amber-300/20 hover:border hover:border-amber-400/30 cursor-pointer flex items-center justify-center group"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-100 text-amber-800 text-[9px] scale-90 px-1.5 py-0.5 rounded border border-amber-300 shadow-sm whitespace-nowrap">
              🎒 Rummage
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
