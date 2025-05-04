
import { AlertTriangle } from 'lucide-react';

interface DebugInfoProps {
  message: string | null;
  type?: 'warning' | 'error' | 'info';
}

const DebugInfo = ({ message, type = 'warning' }: DebugInfoProps) => {
  if (!message) return null;
  
  const styles = {
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    error: "bg-red-50 border-red-300 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };
  
  return (
    <div className={`mt-4 p-3 border rounded-md text-sm ${styles[type]}`}>
      <AlertTriangle className="inline-block w-4 h-4 mr-1" /> 
      {message}
    </div>
  );
};

export default DebugInfo;
