
import { AlertTriangle } from 'lucide-react';

interface DebugInfoProps {
  message: string | null;
}

const DebugInfo = ({ message }: DebugInfoProps) => {
  if (!message) return null;
  
  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-sm text-yellow-800">
      <AlertTriangle className="inline-block w-4 h-4 mr-1" /> 
      {message}
    </div>
  );
};

export default DebugInfo;
