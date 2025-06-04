
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfileLinkProps {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  userId?: string;
  className?: string;
  showAvatar?: boolean;
}

const UserProfileLink = ({
  username,
  fullName,
  avatarUrl,
  userId,
  className = "",
  showAvatar = true
}: UserProfileLinkProps) => {
  const displayName = fullName || username || 'Неизвестный пользователь';
  
  // Use userId for navigation if username is not available
  const linkPath = userId 
    ? (username ? `/user/${username}` : `/user/id/${userId}`) 
    : '#';
  
  return (
    <Link 
      to={linkPath}
      className={`flex items-center hover:text-devhub-purple transition-colors ${className}`}
    >
      {showAvatar && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback>
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="font-medium">{displayName}</span>
    </Link>
  );
};

export default UserProfileLink;
