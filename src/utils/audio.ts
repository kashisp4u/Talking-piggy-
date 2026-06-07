/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates adorable cartoon-style synthesizer sound effects for the Talking Piggy game.
 * Uses native Web Audio API oscillators and gain envelopes to create immediate, zero-latency feedback.
 */
export function playSynthSound(type: 'poke' | 'pet' | 'bag' | 'eat' | 'squeak' | 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    switch (type) {
      case 'poke': {
        // High-to-low cartoon oof/grunt
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
        
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.18);
        break;
      }
      
      case 'pet': {
        // Sparkly high pitch giggle chime
        const count = 3;
        for (let i = 0; i < count; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const timeOffset = i * 0.05;
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600 + i * 150, now + timeOffset);
          osc.frequency.exponentialRampToValueAtTime(1000 + i * 200, now + timeOffset + 0.12);
          
          gain.gain.setValueAtTime(0.12, now + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + 0.12);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + timeOffset);
          osc.stop(now + timeOffset + 0.12);
        }
        break;
      }
      
      case 'bag': {
        // Paper crunch / item rummaging zip
        const count = 5;
        for (let i = 0; i < count; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const timeOffset = i * 0.04;
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400 + Math.random() * 400, now + timeOffset);
          gain.gain.setValueAtTime(0.1, now + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + 0.06);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + timeOffset);
          osc.stop(now + timeOffset + 0.06);
        }
        break;
      }
      
      case 'eat': {
        // Crisp bite chewing sounds
        const chews = 4;
        for (let i = 0; i < chews; i++) {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const timeOffset = i * 0.12;
          
          osc1.type = 'square';
          osc1.frequency.setValueAtTime(140 + Math.random() * 60, now + timeOffset);
          
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(80 + Math.random() * 40, now + timeOffset);
          
          gain.gain.setValueAtTime(0.18, now + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + 0.08);
          
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          
          osc1.start(now + timeOffset);
          osc1.stop(now + timeOffset + 0.08);
          osc2.start(now + timeOffset);
          osc2.stop(now + timeOffset + 0.08);
        }
        break;
      }
      
      case 'squeak': {
        // Adorable retro cartoon high pitch squealy oink
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.16);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(now + 0.22);
        break;
      }

      case 'success': {
        // Magical upward chime
        const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const delay = idx * 0.06;
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.12, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.005, now + delay + 0.25);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + delay);
          osc.stop(now + delay + 0.25);
        });
        break;
      }
    }
  } catch (error) {
    console.warn("Web Audio Context not activated or blocked by privacy configs.", error);
  }
}
