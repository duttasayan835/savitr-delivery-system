"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogOut, Package, Home } from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16 items-center">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <div className="relative h-20 w-20">
            <Image
              src="https://files.catbox.moe/jsrjbj.png"
              layout="fill"
              objectFit="contain"
              alt="Savitr-AI Logo"
            />
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900">Savitr-AI</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  <Home className="h-5 w-5" />
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                    <User className="h-5 w-5" />
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
