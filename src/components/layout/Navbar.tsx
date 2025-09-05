"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Role } from "@/generated/prisma";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleSignOut = () => signOut({ callbackUrl: "/auth/login" });

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [{ name: "Home", href: "/", icon: null }];
    if (!session) return baseItems;

    switch (session.user.role) {
      case Role.USER:
        return [
          ...baseItems,
          { name: "Venues", href: "/venues", icon: BuildingOfficeIcon },
          { name: "My Bookings", href: "/bookings", icon: CalendarDaysIcon },
        ];
      case Role.OWNER:
        return [
          ...baseItems,
          { name: "Dashboard", href: "/owner/dashboard", icon: CogIcon },
          {
            name: "My Venues",
            href: "/owner/venues",
            icon: BuildingOfficeIcon,
          },
          { name: "Bookings", href: "/owner/bookings", icon: CalendarDaysIcon },
        ];
      case Role.ADMIN:
        return [
          ...baseItems,
          { name: "Admin Dashboard", href: "/admin/dashboard", icon: CogIcon },
          {
            name: "Facility Approvals",
            href: "/admin/facilities",
            icon: BuildingOfficeIcon,
          },
          {
            name: "User Management",
            href: "/admin/users",
            icon: UserCircleIcon,
          },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  if (status === "loading") {
    return (
      <nav className="bg-green-600 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-green-100">
                  SportsBook
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse w-8 h-8 bg-green-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-green-600 shadow-md text-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold hover:text-green-200">
              SportsBook
            </Link>

            {/* Desktop Navigation */}
            {session && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-green-800 text-green-200"
                            : "hover:bg-green-700 hover:text-green-100"
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4 mr-2" />}
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {session ? (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
                >
                  <span className="sr-only">Open user menu</span>
                  {session.user.avatarUrl ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.avatarUrl}
                      alt={session.user.fullName}
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-green-200" />
                  )}
                  <span className="ml-2 font-medium hidden sm:block">
                    {session.user.fullName}
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-green-50 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-green-800 border-b">
                        <div className="font-medium">
                          {session.user.fullName}
                        </div>
                        <div className="text-xs">{session.user.email}</div>
                        <div className="text-xs capitalize">
                          {session.user.role.toLowerCase()}
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-green-700 hover:bg-green-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-100"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-green-100 hover:text-green-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {session && (
              <button
                onClick={toggleMobileMenu}
                className="md:hidden ml-4 inline-flex items-center justify-center p-2 rounded-md text-green-100 hover:text-green-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {session && isMobileMenuOpen && (
        <div className="md:hidden bg-green-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-green-800 text-green-200"
                      : "hover:bg-green-600 text-green-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="w-5 h-5 mr-3" />}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

