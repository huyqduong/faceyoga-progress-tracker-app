import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center text-gray-600 hover:text-gray-800 ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );
};

export default BackButton;
