import { Link } from 'wouter';
import { Button } from './ui/button';
import { Snowflake, Leaf } from 'lucide-react';
import type { Season } from '../App';

interface UIOverlayProps {
  season: Season;
  onSeasonChange: (season: Season) => void;
}

export function UIOverlay({ season, onSeasonChange }: UIOverlayProps) {
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
                  ? 'bg-white/80 hover:bg-white/90 text-gray-800 border border-gray-300 shadow-lg backdrop-blur-sm' 
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm'
              }`}
            >
              Imagine a world...
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
