import React from 'react';
import { VideoHero } from '@/components/VideoHero';

const Index = () => {
  return (
    <main className="relative">
      <VideoHero />
      
      {/* Admin Access Link */}
      <div className="fixed bottom-4 right-4 z-50">
        <a 
          href="/admin" 
          className="text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          Admin
        </a>
      </div>
    </main>
  );
};

export default Index;