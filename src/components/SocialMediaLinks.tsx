
import React from 'react';
import { Github, Twitter, Linkedin, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface SocialMediaLinksProps {
  github?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  telegram?: string | null;
  discord?: string | null;
  website?: string | null;
  className?: string;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  github, 
  twitter, 
  linkedin, 
  telegram, 
  discord, 
  website,
  className = ""
}) => {
  const links = [
    {
      url: github ? `https://github.com/${github}` : null,
      icon: <Github className="h-5 w-5" />,
      name: 'GitHub',
      username: github
    },
    {
      url: twitter ? `https://twitter.com/${twitter}` : null,
      icon: <Twitter className="h-5 w-5" />,
      name: 'Twitter',
      username: twitter
    },
    {
      url: linkedin ? `https://linkedin.com/in/${linkedin}` : null,
      icon: <Linkedin className="h-5 w-5" />,
      name: 'LinkedIn',
      username: linkedin
    },
    {
      url: telegram ? `https://t.me/${telegram}` : null,
      icon: <MessageCircle className="h-5 w-5" />,
      name: 'Telegram',
      username: telegram
    },
    {
      url: discord,
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.09 9.15C8.47 9.15 7.97 9.7 7.97 10.37C7.97 11.05 8.48 11.6 9.09 11.6C9.71 11.6 10.21 11.05 10.21 10.37C10.22 9.7 9.71 9.15 9.09 9.15ZM14.91 9.15C14.29 9.15 13.79 9.7 13.79 10.37C13.79 11.05 14.3 11.6 14.91 11.6C15.53 11.6 16.03 11.05 16.03 10.37C16.03 9.7 15.52 9.15 14.91 9.15Z" fill="currentColor"/>
              <path d="M19.82 0H4.18C2.97 0 2 0.97 2 2.18V18.6C2 19.8 2.97 20.78 4.18 20.78H17.64L17.02 18.6L18.54 20L19.97 21.33L22 23.15V2.18C22 0.97 21.03 0 19.82 0ZM14.94 15.15C14.94 15.15 14.51 14.65 14.15 14.2C15.63 13.76 16.19 12.79 16.19 12.79C15.73 13.09 15.3 13.31 14.94 13.46C14.41 13.7 13.91 13.85 13.42 13.95C12.42 14.17 11.5 14.11 10.71 13.95C10.11 13.82 9.59 13.64 9.16 13.46C8.93 13.36 8.68 13.25 8.42 13.1C8.39 13.08 8.36 13.07 8.33 13.05C8.31 13.04 8.3 13.04 8.29 13.03C8.1 12.92 7.99 12.85 7.99 12.85C7.99 12.85 8.53 13.8 9.97 14.25C9.61 14.7 9.17 15.21 9.17 15.21C6.26 15.12 5.12 13.43 5.12 13.43C5.12 9.77 6.83 6.8 6.83 6.8C8.54 5.53 10.17 5.56 10.17 5.56L10.29 5.71C7.88 6.45 6.78 7.59 6.78 7.59C6.78 7.59 7.06 7.43 7.54 7.22C8.88 6.63 10.15 6.47 10.72 6.42C10.81 6.4 10.89 6.39 10.98 6.39C11.73 6.29 12.59 6.26 13.48 6.35C14.66 6.47 15.91 6.77 17.19 7.59C17.19 7.59 16.14 6.5 13.87 5.76L14.04 5.56C14.04 5.56 15.67 5.53 17.38 6.8C17.38 6.8 19.09 9.77 19.09 13.43C19.09 13.43 17.93 15.12 15.02 15.21L14.94 15.15Z" fill="currentColor"/>
            </svg>,
      name: 'Discord',
      username: discord
    },
    {
      url: website,
      icon: <ExternalLink className="h-5 w-5" />,
      name: 'Website',
      username: website
    }
  ].filter(link => link.url);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((link, index) => (
        link.url && (
          <a 
            key={index} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-gray-800 dark:text-gray-200">
              {link.icon}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              {link.username}
            </span>
          </a>
        )
      ))}
    </div>
  );
};

export default SocialMediaLinks;
