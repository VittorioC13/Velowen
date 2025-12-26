import { useLocation } from 'wouter';
import { Snowflake, Leaf } from 'lucide-react';
import type { Season } from '../App';

interface UIOverlayProps {
  season: Season;
  onSeasonChange: (season: Season) => void;
}

export function UIOverlay({ season, onSeasonChange }: UIOverlayProps) {
  const [, setLocation] = useLocation();

  const toggleSeason = () => {
    onSeasonChange(season === 'winter' ? 'spring' : 'winter');
  };

  const handleSearchFocus = () => {
    setLocation('/image-to-3d');
  };

  const isWinter = season === 'winter';

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top bar - minimalist like marble */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold ${
                isWinter ? 'bg-gray-800 text-white' : 'bg-white/10 text-white'
              }`}>
                W
              </div>
            </div>

            {/* Search bar - minimalist */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Imagine a world..."
                onFocus={handleSearchFocus}
                className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-300 text-base ${
                  isWinter
                    ? 'bg-white/40 border-white/30 text-gray-800 placeholder:text-gray-500 focus:bg-white/60 focus:border-white/50'
                    : 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30'
                } focus:outline-none focus:ring-0`}
              />
            </div>

            {/* Season toggle */}
            <button
              onClick={toggleSeason}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isWinter 
                  ? 'text-gray-600 hover:text-gray-800 hover:bg-white/20' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={isWinter ? 'Switch to Spring' : 'Switch to Winter'}
            >
              {isWinter ? (
                <Snowflake className="w-5 h-5" strokeWidth={1} />
              ) : (
                <Leaf className="w-5 h-5" strokeWidth={1} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Centered branding - minimal */}
      <div className="flex flex-col items-center justify-center h-full pointer-events-none">
        <div className="text-center pointer-events-none">
          <h1 className={`text-6xl sm:text-7xl font-light mb-2 tracking-wider transition-colors duration-300 ${
            isWinter ? 'text-gray-800/90' : 'text-white/90'
          }`}>
            VELOWEN
          </h1>
          <p className={`text-sm sm:text-base transition-colors duration-300 font-light ${
            isWinter ? 'text-gray-600/80' : 'text-white/70'
          }`}>
            zen in world model
          </p>
        </div>
      </div>
    </div>
  );
}
