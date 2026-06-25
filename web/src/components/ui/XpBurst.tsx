import { useState } from 'react'

interface XpBurstProps {
  xp: number
}

const KEYFRAMES = `
@keyframes xpFloat {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  60%  { opacity: 1; transform: translateY(-40px) scale(1.15); }
  100% { opacity: 0; transform: translateY(-80px) scale(0.9); }
}
@keyframes xpPop {
  0%   { transform: scale(0.6); opacity: 0; }
  50%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
`

export function XpBurst({ xp }: XpBurstProps) {
  const [particles] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: 30 + Math.floor(i * 8),
      delay: i * 0.12,
    }))
  )

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="relative flex items-center justify-center">
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map(p => (
            <span
              key={p.id}
              className="absolute text-green-400 font-bold text-sm select-none"
              style={{
                left: `${p.left}%`,
                top: '50%',
                animation: `xpFloat 1.4s ease-out ${p.delay}s both`,
              }}
            >
              +{Math.floor(xp / 6)}
            </span>
          ))}
        </div>
        {/* Main badge */}
        <div
          className="bg-green-50 border-2 border-green-200 rounded-2xl px-8 py-4 text-center"
          style={{ animation: 'xpPop 0.5s ease-out both' }}
        >
          <p className="text-3xl font-black text-green-600">+{xp} XP</p>
          <p className="text-sm text-green-500 font-medium mt-0.5">earned</p>
        </div>
      </div>
    </>
  )
}
