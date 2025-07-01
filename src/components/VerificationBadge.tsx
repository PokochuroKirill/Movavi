
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface VerificationBadgeProps {
  verificationType: number;
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verificationType,
  className = ""
}) => {
  const [open, setOpen] = useState(false);

  const getVerificationInfo = (type: number) => {
    switch (type) {
      case 1:
        return {
          gradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
          text: 'Эта учетная запись имеет статус подтвержденной'
        };
      case 2:
        return {
          gradient: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          text: 'Эта учетная запись имеет статус подтвержденной так как принадлежит крупному медийному лицу'
        };
      case 3:
        return {
          gradient: 'bg-gradient-to-r from-gray-700 to-gray-900',
          text: 'Эта учетная запись имеет статус подтвержденной так как принадлежит крупной организации или бизнесу'
        };
      case 4:
        return {
          gradient: 'bg-gradient-to-r from-orange-500 to-red-500',
          text: 'Эта учетная запись имеет статус подтвержденной, так как принадлежит почетному участнику команды DevHub'
        };
      case 5:
        return {
          gradient: 'bg-gradient-to-r from-red-500 to-violet-500',
          text: 'Эта учетная запись имеет статус подтвержденной, так как принадлежит мопасу'
        };
      default:
        return null;
    }
  };

  const verificationInfo = getVerificationInfo(verificationType);

  if (!verificationInfo) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${verificationInfo.gradient} ${className}`}
          onClick={() => setOpen(!open)}
        >
          <Check className="w-3 h-3 text-white" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="flex items-start space-x-3">
          <div className={`w-6 h-6 rounded-full ${verificationInfo.gradient} flex items-center justify-center flex-shrink-0`}>
            <Check className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {verificationInfo.text}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VerificationBadge;
