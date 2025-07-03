import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VerificationBadge from './VerificationBadge';

interface UserProfileLinkProps {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  userId?: string;
  className?: string;
  verificationType?: number | null;
}

const UserProfileLink = ({
  username,
  fullName,
  avatarUrl,
  userId,
  className = "",
  verificationType
}: UserProfileLinkProps) => {
  const displayName = fullName || username || 'Неизвестный пользователь';
  
  // Исправляем маршрутизацию: если есть username, используем его, иначе используем userId
  const linkPath = username ? `/users/${username}` : (userId ? `/users/id/${userId}` : '#');
  
  return (
    <Link 
      to={linkPath}
      className={`flex items-center hover:text-primary transition-colors ${className}`}
    >
      <Avatar className="h-8 w-8 mr-2">
        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
        <AvatarFallback>
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1">
        <span>{displayName}</span>
        {verificationType && <VerificationBadge verificationType={verificationType} />}
      </div>
    </Link>
  );
};

export default UserProfileLink;