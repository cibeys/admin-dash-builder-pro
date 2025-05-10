
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BreadcrumbItemType {
  label: string;
  href: string;
}

const generateBreadcrumbs = (pathname: string): BreadcrumbItemType[] => {
  const paths = pathname.split('/').filter(Boolean);
  
  // Tambahkan beranda sebagai awal
  const breadcrumbs: BreadcrumbItemType[] = [
    {
      label: 'Beranda',
      href: '/home'
    }
  ];

  // Buat path untuk setiap segment
  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Custom label berdasarkan path
    let label = path.charAt(0).toUpperCase() + path.slice(1);
    
    // Handle case khusus
    if (path === 'blog' && paths[index + 1] === 'category') {
      return;
    }
    
    if (path === 'category' && paths[index + 1]) {
      label = 'Kategori';
    }
    
    if (path === 'templates' && !paths[index + 1]) {
      label = 'Template';
    }
    
    if (path === 'tools' && !paths[index + 1]) {
      label = 'Tools';
    }

    // Hapus ID atau slug di path terakhir
    if (index === paths.length - 1 && (path.includes('-') || path.length > 20)) {
      // Jika ini adalah slug, tampilkan label yang lebih pendek
      label = 'Detail';
    }

    breadcrumbs.push({
      label,
      href: currentPath
    });
  });

  return breadcrumbs;
};

interface BreadcrumbProps {
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className }) => {
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.pathname);
  
  // Jika hanya ada home, jangan tampilkan breadcrumb
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex text-sm", className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap gap-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <React.Fragment key={item.href}>
              <li>
                {isLast ? (
                  <span className="font-medium text-primary">
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    to={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                  >
                    {index === 0 ? (
                      <Home className="h-3.5 w-3.5 mr-1" />
                    ) : null}
                    {item.label}
                  </Link>
                )}
              </li>
              
              {!isLast && (
                <li className="text-muted-foreground">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </motion.nav>
  );
};
