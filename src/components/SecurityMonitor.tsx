import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { securityService } from '../services/securityService';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';

export const SecurityMonitor: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  // Monitor unauthorized access attempts to protected routes
  useEffect(() => {
    const protectedRoutes = ['/admin'];
    const currentPath = location.pathname;

    if (protectedRoutes.includes(currentPath) && user && !isAdmin) {
      securityService.logEvent(
        'unauthorized_access',
        `حاولة دخول غير مصرح بها لصفحة الإدارة: ${currentPath}`,
        currentPath
      );
      toast.error("تنبيه أمني: ليس لديك صلاحية لدخول هذه الصفحة. تم تسجيل المحاولة.", {
        icon: <ShieldAlert className="text-brand-red" />
      });
    }
  }, [location.pathname, user, isAdmin]);

  // Monitor for suspicious input patterns in URL search params (very basic XSS/SQli detection)
  useEffect(() => {
    const search = location.search.toLowerCase();
    const toxicPatterns = ['<script', 'javascript:', 'union select', 'drop table', 'delete from'];
    
    const matchedPattern = toxicPatterns.find(pattern => search.includes(pattern));
    
    if (matchedPattern && user) {
      securityService.logEvent(
        'input_injection_attempt',
        `محاولة حقن بيانات مشبوهة في الرابط: ${matchedPattern}`,
        location.pathname + location.search
      );
    }
  }, [location.search, user]);

  return null; // Invisible component
};
