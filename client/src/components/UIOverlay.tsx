import { useState } from 'react';
import { Link } from 'wouter';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Snowflake, Leaf } from 'lucide-react';
import type { Season } from '../App';

interface UIOverlayProps {
  season: Season;
  onSeasonChange: (season: Season) => void;
}

export function UIOverlay({ season, onSeasonChange }: UIOverlayProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setInputValue('');
    }, 1500);
  };

  const toggleSeason = () => {
    onSeasonChange(season === 'winter' ? 'spring' : 'winter');
  };

  const isWinter = season === 'winter';

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <button
        onClick={toggleSeason}
        className={`absolute top-6 right-6 pointer-events-auto transition-all duration-300 hover:scale-110 ${
          isWinter ? 'text-gray-600 hover:text-gray-800' : 'text-white/70 hover:text-white'
        }`}
        title={isWinter ? 'Switch to Spring' : 'Switch to Winter'}
      >
        {isWinter ? (
          <Snowflake className="w-5 h-5" strokeWidth={1} />
        ) : (
          <Leaf className="w-5 h-5" strokeWidth={1} />
        )}
      </button>

      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center mb-8 pointer-events-auto">
          <h1 className={`text-7xl font-bold mb-2 tracking-wider transition-colors duration-300 ${
            isWinter ? 'text-gray-800 drop-shadow-sm' : 'text-white'
          }`}>
            VELOWEN
          </h1>
          <p className={`text-xl transition-colors duration-300 ${
            isWinter ? 'text-gray-600' : 'text-gray-300'
          }`}>
            zen in world model
          </p>
          <Link href="/image-to-3d">
            <Button
              className={`mt-6 transition-colors duration-300 ${
                isWinter 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border-none' 
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
              }`}
            >
              Transform Image to 3D
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-2xl px-4 pointer-events-auto">
          <div className={`backdrop-blur-md rounded-lg border p-6 transition-all duration-300 ${
            isWinter 
              ? 'bg-white/60 border-gray-200 shadow-lg' 
              : 'bg-black/40 border-white/20'
          }`}>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email for early access..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                className={`flex-1 text-lg transition-colors duration-300 ${
                  isWinter 
                    ? 'bg-white/80 border-gray-300 text-gray-800 placeholder:text-gray-400' 
                    : 'bg-white/10 border-white/30 text-white placeholder:text-gray-400'
                }`}
              />
              <Button
                onClick={handleSubscribe}
                disabled={isLoading || !inputValue.trim()}
                className={`transition-colors duration-300 ${
                  isWinter 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border-none' 
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                }`}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
