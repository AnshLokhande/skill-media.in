'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, HelpCircle, Volume2, VolumeX, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingAnimation } from '../components/loading-animation';
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PLANE_SIZE = 70;

export default function AviatorGame() {
  const [balance, setBalance] = useState(5000.0);
  const [betAmounts, setBetAmounts] = useState([10.0, 10.0]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [activeBets, setActiveBets] = useState([null, null]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showCrashAnimation, setShowCrashAnimation] = useState(false);
  const [isWaitingForNextRound, setIsWaitingForNextRound] = useState(true);
  const [countdownTimer, setCountdownTimer] = useState(5);

  const [toggleOption, setToggleOption] = useState(false);
  const [toggleSound, setToggleSound] = useState(false);

  const canvasRef = useRef(null);
  const planeRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const videoRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const planeImage = new Image();
    planeImage.src = '/plane.png';
    planeImage.crossOrigin = 'anonymous';
    planeImage.onload = () => {
      planeRef.current = planeImage;
    };
  }, []);

  const drawPlane = useCallback((ctx, progress, isCrashed = false) => {
    if (!planeRef.current) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Create gradient for the line
    const gradient = ctx.createLinearGradient(0, CANVAS_HEIGHT, CANVAS_WIDTH, 0);
    gradient.addColorStop(0, 'rgba(255, 0, 128, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 0, 128, 1)');

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 20;
    ctx.shadowColor = 'rgba(255, 0, 128, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw curved line
    ctx.moveTo(0, CANVAS_HEIGHT);
    const curvePoints = [];
    for (let x = 0; x <= progress * CANVAS_WIDTH; x += CANVAS_WIDTH / 100) {
      const normalizedX = x / CANVAS_WIDTH;
      const y = CANVAS_HEIGHT - (Math.pow(normalizedX, 1.2) * CANVAS_HEIGHT * 0.95);
      curvePoints.push({ x, y });
    }
    
    if (curvePoints.length > 2) {
      ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
      for (let i = 1; i < curvePoints.length - 2; i++) {
        const xc = (curvePoints[i].x + curvePoints[i + 1].x) / 2;
        const yc = (curvePoints[i].y + curvePoints[i + 1].y) / 2;
        ctx.quadraticCurveTo(curvePoints[i].x, curvePoints[i].y, xc, yc);
      }
      ctx.quadraticCurveTo(
        curvePoints[curvePoints.length - 2].x,
        curvePoints[curvePoints.length - 2].y,
        curvePoints[curvePoints.length - 1].x,
        curvePoints[curvePoints.length - 1].y
      );
    }
    
    ctx.stroke();

    // Reset shadow for plane
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    const x = progress * CANVAS_WIDTH;
    const y = CANVAS_HEIGHT - (Math.pow(progress, 1.2) * CANVAS_HEIGHT * 0.95);
    
    ctx.save();
    ctx.translate(x, y);
    
    const angle = isCrashed ? Math.PI / 2 : Math.atan2(
      (y - (CANVAS_HEIGHT - (Math.pow((progress - 0.01), 1.2) * CANVAS_HEIGHT * 0.95))),
      (0.01 * CANVAS_WIDTH)
    );
    ctx.rotate(-angle);
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    ctx.drawImage(
      planeRef.current,
      -PLANE_SIZE / 2,
      -PLANE_SIZE / 2,
      PLANE_SIZE,
      PLANE_SIZE
    );
    
    ctx.restore();
  }, []);

  const startGame = useCallback(() => {
    setIsGameRunning(true);
    setCurrentMultiplier(1.0);
    setShowCrashAnimation(false);
    setIsWaitingForNextRound(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let progress = 0;
    let crashed = false;
    let lastTimestamp = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;

      if (deltaTime >= frameInterval) {
        progress += 0.003;
        const multiplier = 1 + Math.pow(progress * 5, 1.5);
        setCurrentMultiplier(parseFloat(multiplier.toFixed(2)));

        const crashProbability = Math.pow(progress, 2) * 0.1;
        if (Math.random() < crashProbability || multiplier > 10) {
          crashed = true;
          setIsGameRunning(false);
          setShowCrashAnimation(true);
          setGameHistory(prev => [multiplier, ...prev].slice(0, 10));
          if (isSoundEnabled && audioRef.current) {
            audioRef.current.play();
          }
          drawPlane(ctx, progress, true);
          
          setActiveBets([null, null]);
          
          setIsWaitingForNextRound(true);
          let countdown = 5;
          setCountdownTimer(countdown);
          
          const countdownInterval = setInterval(() => {
            countdown--;
            setCountdownTimer(countdown);
            if (countdown <= 0) {
              clearInterval(countdownInterval);
              setIsWaitingForNextRound(false);
              startGame();
            }
          }, 1000);
          
          return;
        }

        drawPlane(ctx, progress, crashed);
        lastTimestamp = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [drawPlane, isSoundEnabled]);

  useEffect(() => {
    startGame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [startGame]);

  const handleBetClick = (panelIndex) => {
    if (balance >= betAmounts[panelIndex] && !activeBets[panelIndex] && !isWaitingForNextRound) {
      setBalance(prev => prev - betAmounts[panelIndex]);
      setActiveBets(prev => {
        const newBets = [...prev];
        newBets[panelIndex] = betAmounts[panelIndex];
        return newBets;
      });
    }
  };

  const handleCashOut = (panelIndex) => {
    if (activeBets[panelIndex] && isGameRunning) {
      const winnings = activeBets[panelIndex] * (panelIndex === 0 ? currentMultiplier : Math.min(currentMultiplier, 2));
      setBalance(prev => prev + winnings);
      setActiveBets(prev => {
        const newBets = [...prev];
        newBets[panelIndex] = null;
        return newBets;
      });
    }
  };

  const handleAmountChange = (value, panelIndex) => {
    setBetAmounts(prev => {
      const newAmounts = [...prev];
      newAmounts[panelIndex] = Math.max(0, Math.min(value, balance));
      return newAmounts;
    });
  };

  const renderBettingPanel = (panelIndex) => {
    return (
      <div className="bg-[#1a1d29] p-4 rounded-lg relative">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold">
              {panelIndex === 0 ? "Standard Bet" : "Safe Bet (Max 2x)"}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="w-10 h-10 bg-[#2c3140] rounded-md text-xl font-bold hover:bg-[#3a3f50]"
              onClick={() => handleAmountChange(betAmounts[panelIndex] - 10, panelIndex)}
            >
              -
            </button>
            <input
              type="number"
              value={betAmounts[panelIndex]}
              onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0, panelIndex)}
              className="flex-1 bg-[#2c3140] text-white rounded-md text-center text-xl p-2"
            />
            <button
              className="w-10 h-10 bg-[#2c3140] rounded-md text-xl font-bold hover:bg-[#3a3f50]"
              onClick={() => handleAmountChange(betAmounts[panelIndex] + 10, panelIndex)}
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[100, 200, 500, 1000].map((amount) => (
              <button
                key={amount}
                className="bg-[#2c3140] py-2 rounded-md text-sm hover:bg-[#3a3f50] transition-colors"
                onClick={() => handleAmountChange(amount, panelIndex)}
              >
                {amount.toFixed(2)}
              </button>
            ))}
          </div>

          {activeBets[panelIndex] ? (
            <button
              onClick={() => handleCashOut(panelIndex)}
              className="w-full py-3 bg-[#ffc107] text-black rounded-md text-lg font-bold hover:bg-[#ffca28] transition-colors"
              disabled={!isGameRunning}
            >
              CASH OUT {(activeBets[panelIndex] * (panelIndex === 0 ? currentMultiplier : Math.min(currentMultiplier, 2))).toFixed(2)} INR
            </button>
          ) : (
            <button
              onClick={() => handleBetClick(panelIndex)}
              className="w-full py-3 bg-[#4caf50] text-white rounded-md text-lg font-bold hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isWaitingForNextRound}
            >
              {isWaitingForNextRound 
                ? `NEXT ROUND IN ${countdownTimer}s` 
                : `BET ${betAmounts[panelIndex].toFixed(2)} INR`}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans min-h-screen bg-[#1a1d29] text-white flex justify-center items-center p-4">
      <div className="max-w-4xl w-full bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden">
        <audio ref={audioRef} src="/crash-sound.mp3" />

        <header className="flex items-center justify-between p-4 bg-[#1a1d29] border-b border-[#3a3f50]">
          <div className="flex items-center gap-2">
            <div className="text-[#ff4d4d] font-bold text-xl">Skillsmedia</div>
            <button className="px-2 py-1 text-xs border border-[#3a3f50] rounded-md flex items-center gap-1 hover:bg-[#2c3140]">
              <HelpCircle className="w-3 h-3" />
              How to play?
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="text-[#8c91a7] hover:text-white"
            >
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="text-[#00ff00] font-mono text-lg">
              {balance.toFixed(2)} <span className="text-xs">INR</span>
            </div>
            <div className="relative">
              <button
                onClick={handleMenuToggle}
                className="text-[#8c91a7] hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white shadow-lg rounded-md py-2 z-10">
                  <a href="#profile" className="block px-4 py-2 hover:bg-gray-700 transition">
                    My Profile
                  </a>
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span>Sound</span>
                    <button
                      className={`w-10 h-6 flex p-1 items-center rounded-full transition ${
                        toggleOption ? 'bg-green-500': 'bg-gray-300'
                      }`}
                      onClick={() => setToggleOption(!toggleOption)}
                    >
                      <span
                        className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                          toggleOption ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span>Music</span>
                    <button
                      className={`w-10 h-6 flex p-1 items-center rounded-full transition ${
                        toggleSound ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      onClick={() => setToggleSound(!toggleSound)}
                    >
                      <span
                        className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                          toggleSound ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                  <a href="#freebets" className="block px-4 py-2 hover:bg-gray-700 transition">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Free Bets
                    </div>
                  </a>
                  <a href="#history" className="block px-4 py-2 hover:bg-gray-700 transition">
                    Bet History
                  </a>
                  <a href="#limits" className="block px-4 py-2 hover:bg-gray-700 transition">
                    Game Limits
                  </a>
                  <a href="#howtoplay" className="block px-4 py-2 hover:bg-gray-700 transition">
                    How to Play
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 flex flex-col">
          <div className="flex gap-2 overflow-x-auto py-2 mb-4">
            {gameHistory.map((multiplier, index) => (
              <div
                key={index}
                className={`font-mono whitespace-nowrap px-3 py-1 rounded-full text-sm ${
                  multiplier >= 2 ? 'bg-[#1c7857] text-[#00ff00]' : 'bg-[#78242e] text-[#ff4d4d]'
                }`}
              >
                {multiplier.toFixed(2)}x
              </div>
            ))}
          </div>

          <div className="relative w-full h-[30vh] rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              src="/WhatsApp Video 2024-12-08 at 00.58.18_ad6d2290.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="absolute inset-0 w-full h-full"
            />
            <AnimatePresence>
              {showCrashAnimation && (
                <motion.div
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center text-[#ff4d4d] text-4xl font-bold"
                >
                  CRASHED AT {currentMultiplier.toFixed(2)}x
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold text-white drop-shadow-lg">
                {isWaitingForNextRound ? `Next round in ${countdownTimer}s` : `${currentMultiplier.toFixed(2)}x`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map((index) => renderBettingPanel(index))}
          </div>
        </main>

        <footer className="bg-[#1a1d29] border-t border-[#3a3f50] p-4 text-center text-sm text-gray-500">
          © 2024 Aviator Game. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

