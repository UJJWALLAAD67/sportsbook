"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const getNavItems = () => {
    if (!isAuthenticated || !user) {
      return [
        { name: "Home", href: "/" },
        { name: "Venues", href: "/venues" },
        { name: "Login", href: "/login" },
      ];
    }

    const commonItems = [{ name: "Dashboard", href: "/dashboard" }];

    // Assuming user.role comes from session.user.role
    switch ((user as any)?.role) {
      case "user":
        return [
          ...commonItems,
          { name: "Venues", href: "/venues" },
          { name: "My Bookings", href: "/bookings" },
        ];
      case "facility_owner":
        return [
          ...commonItems,
          { name: "My Facilities", href: "/facilities" },
          { name: "Bookings", href: "/owner/bookings" },
          { name: "Analytics", href: "/owner/analytics" },
        ];
      case "admin":
        return [
          ...commonItems,
          { name: "Users", href: "/admin/users" },
          { name: "Facilities", href: "/admin/facilities" },
          { name: "Reports", href: "/admin/reports" },
        ];
      default:
        return commonItems;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">
                SportsBook
              </h1>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {getNavItems().map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8" />
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {getNavItems().map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {isAuthenticated && user && (
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
