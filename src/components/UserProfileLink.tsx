
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfileLinkProps {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  userId?: string;
  className?: string;
}

const UserProfileLink = ({
  username,
  fullName,
  avatarUrl,
  userId,
  className = ""
}: UserProfileLinkProps) => {
  const displayName = fullName || username || 'Неизвестный пользователь';
  const linkPath = username ? `/user/${username}` : (userId ? `/user/${userId}` : '#');
  
  return (
    <Link 
      to={linkPath}
      className={`flex items-center hover:text-devhub-purple transition-colors ${className}`}
    >
      <Avatar className="h-8 w-8 mr-2">
        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
        <AvatarFallback>
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span>{displayName}</span>
    </Link>
  );
};

export default UserProfileLink;
