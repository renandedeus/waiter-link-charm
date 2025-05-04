
import React from 'react';
import WelcomeVideoModal from '@/components/WelcomeVideoModal';

interface WelcomeVideoHandlerProps {
  showWelcomeVideo: boolean;
  onClose: () => void;
}

const WelcomeVideoHandler: React.FC<WelcomeVideoHandlerProps> = ({
  showWelcomeVideo,
  onClose
}) => {
  return (
    <WelcomeVideoModal 
      videoId="Z26ueJM-EGM" 
      isOpen={showWelcomeVideo} 
      onClose={onClose} 
    />
  );
};

export default WelcomeVideoHandler;
