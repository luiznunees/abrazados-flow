import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { RegistrationModal } from './RegistrationModal';

export const VideoHero = () => {
  const [showCTA, setShowCTA] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Show CTA after 5 seconds
    const timer = setTimeout(() => {
      setShowCTA(true);
      // Pause video when CTA appears
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleVideoClick = () => {
    if (isPlaying) {
      // If video is playing, pause it and show modal
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setShowModal(true);
    }
  };

  const handleCTAClick = () => {
    setShowModal(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleMusicEnd = () => {
    // When music ends naturally, loop it
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onClick={handleVideoClick}
      >
        <source
          src="https://lecesunfdmpfabhizcvr.supabase.co/storage/v1/object/public/videos/video.mp4"
          type="video/mp4"
        />
      </video>

      {/* Background Music */}
      <audio
        ref={audioRef}
        autoPlay
        muted={isMuted}
        onEnded={handleMusicEnd}
      >
        <source
          src="https://lecesunfdmpfabhizcvr.supabase.co/storage/v1/object/public/videos/musica.mp3"
          type="audio/mpeg"
        />
      </audio>

      {/* Video Overlay */}
      <div className={`absolute inset-0 video-overlay transition-all duration-500 ${
        showCTA || showModal ? 'backdrop-blur-strong' : ''
      }`} />

      {/* Music Control Button */}
      <button
        onClick={toggleMute}
        className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* CTA Button */}
      {showCTA && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-6">
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-white mb-8 animate-fade-in">
              Abrazados SAP
            </h1>
            <p className="font-inter text-lg md:text-xl text-sap-light mb-8 animate-fade-in animation-delay-300">
              O evento que você não pode perder!
            </p>
            <Button
              variant="festival"
              size="lg"
              onClick={handleCTAClick}
              className="pulse-glow animate-fade-in animation-delay-500"
            >
              Fazer Inscrição
            </Button>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};