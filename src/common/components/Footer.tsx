
import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, Facebook, Mail, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-xl font-bold mb-4">TanoeLuis</h3>
            <p className="text-muted-foreground mb-4">
              Platform belajar web development dan desain dari Indonesia untuk dunia.
              Dapatkan tutorial, template, dan tools terbaik untuk membangun website impianmu.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://github.com" icon={<Github size={18} />} label="Github" />
              <SocialLink href="https://twitter.com" icon={<Twitter size={18} />} label="Twitter" />
              <SocialLink href="https://instagram.com" icon={<Instagram size={18} />} label="Instagram" />
              <SocialLink href="https://facebook.com" icon={<Facebook size={18} />} label="Facebook" />
              <SocialLink href="https://linkedin.com" icon={<Linkedin size={18} />} label="LinkedIn" />
            </div>
          </div>
          
          {/* Column 2: Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                <FooterLink href="/blog">Blog</FooterLink>
                <FooterLink href="/templates">Templates</FooterLink>
                <FooterLink href="/tools">Tools</FooterLink>
                <FooterLink href="/tools/ai-chat">AI Chat</FooterLink>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
                <FooterLink href="/careers">Careers</FooterLink>
                <FooterLink href="/advertise">Advertise</FooterLink>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
                <FooterLink href="/terms">Terms of Service</FooterLink>
                <FooterLink href="/cookies">Cookie Policy</FooterLink>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TanoeLuis. All rights reserved.</p>
          <p className="mt-2">
            Made with ❤️ in Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, label }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-primary transition-colors"
    aria-label={label}
  >
    {icon}
  </a>
);

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children, className }) => (
  <li>
    <Link 
      to={href} 
      className={cn(
        "text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      {children}
    </Link>
  </li>
);
