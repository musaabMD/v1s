"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import ButtonSignin from "@/components/ButtonSignin";

// Default logo
const logo = "/logo.png";

const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Links displayed in the navbar
  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "My Exams" },
    
  ];

  // CTA displayed in the navbar
  const cta = <ButtonSignin />;

  // setIsOpen(false) when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and website name */}
          <div className="flex items-center">
            <Link
              className="flex items-center gap-3"
              href="/"
              title={`${config.appName} homepage`}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white font-bold text-xl rounded-lg">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">{config.appName}</span>
            </Link>
          </div>

          {/* Navigation links - visible on desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA - visible on desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {cta}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md focus:outline-none"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Toggle menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-base font-medium text-gray-600 hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4">
              {cta}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
