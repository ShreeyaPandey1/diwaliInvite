import React, { useEffect, useState } from 'react';

export default function FloatingPetals({ count = 18 }) {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    // Generate random marigold petals and sparkles
    const items = [];
    const colors = ['#ff7a1a', '#ffd43b', '#ff4d6d', '#ff9e00', '#f7c948'];

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        left: Math.random() * 100, // percentage
        delay: Math.random() * 8, // seconds
        duration: Math.random() * 7 + 8, // 8-15 seconds
        size: Math.random() * 12 + 8, // px
        rotate: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        isPetal: i % 3 !== 0, // 2/3 petals, 1/3 sparkles
      });
    }
    setElements(items);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((item) => (
        <div
          key={item.id}
          className="absolute top-[-40px]"
          style={{
            left: `${item.left}%`,
            animation: `petalFall ${item.duration}s linear ${item.delay}s infinite`,
            opacity: 0.7,
          }}
        >
          {item.isPetal ? (
            // Marigold petal shape
            <div
              style={{
                width: `${item.size}px`,
                height: `${item.size * 1.5}px`,
                backgroundColor: item.color,
                borderRadius: '50% 50% 50% 10% / 60% 60% 40% 10%',
                transform: `rotate(${item.rotate}deg)`,
                boxShadow: `0 0 10px ${item.color}55`,
                filter: 'blur(0.4px)',
              }}
            />
          ) : (
            // Twinkling star sparkle
            <div
              className="animate-pulse"
              style={{
                width: `${item.size * 0.6}px`,
                height: `${item.size * 0.6}px`,
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                boxShadow: `0 0 12px #ffe082`,
              }}
            />
          )}
        </div>
      ))}

      <style>{`
        @keyframes petalFall {
          0% {
            transform: translateY(0px) rotate(0deg) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(25px);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(105vh) rotate(360deg) translateX(-20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
