
import React from 'react';
import { Github, Linkedin, MessageCircle, ExternalLink, Send } from 'lucide-react';

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
      url: github ? (github.startsWith('http') ? github : `https://github.com/${github}`) : null,
      icon: <Github className="h-5 w-5" />,
      name: 'GitHub',
      username: github
    },
    {
      url: twitter ? (twitter.startsWith('http') ? twitter : `https://x.com/${twitter}`) : null,
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>,
      name: 'X (Twitter)',
      username: twitter
    },
    {
      url: linkedin ? (linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`) : null,
      icon: <Linkedin className="h-5 w-5" />,
      name: 'LinkedIn',
      username: linkedin
    },
    {
      url: telegram ? (telegram.startsWith('http') ? telegram : `https://t.me/${telegram}`) : null,
      icon: <Send className="h-5 w-5" />,
      name: 'Telegram',
      username: telegram
    },
    {
      url: discord ? (discord.startsWith('http') ? discord : `https://discord.com/users/${discord}`) : null,
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
            </svg>,
      name: 'Discord',
      username: discord
    },
    {
      url: website ? (website.startsWith('http') ? website : `https://${website}`) : null,
      icon: <ExternalLink className="h-5 w-5" />,
      name: 'Website',
      username: website
    }
  ].filter(link => link.url && link.username);

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
