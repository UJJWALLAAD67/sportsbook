"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalVenues: number;
  totalBookings: number;
  totalEarnings: number;
  activeVenues: number;
  todayBookings: number;
  pendingApprovals: number;
}

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalVenues: 0,
    totalBookings: 0,
    totalEarnings: 0,
    activeVenues: 0,
    todayBookings: 0,
    pendingApprovals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    // TODO: Fetch actual stats from API
    // For now, we'll use mock data
    setTimeout(() => {
      setStats({
        totalVenues: 3,
        totalBookings: 127,
        totalEarnings: 45600,
        activeVenues: 3,
        todayBookings: 8,
        pendingApprovals: 1,
      });
      setIsLoading(false);
    }, 1000);
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Venues",
      value: stats.totalVenues,
      icon: BuildingOfficeIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+2 this month",
      changeType: "increase"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarDaysIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+12% from last month",
      changeType: "increase"
    },
    {
      title: "Total Earnings",
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: "+8% from last month",
      changeType: "increase"
    },
    {
      title: "Active Venues",
      value: stats.activeVenues,
      icon: ChartBarIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "All venues active",
      changeType: "neutral"
    },
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: UserGroupIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      change: "6 more than yesterday",
      changeType: "increase"
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: BuildingOfficeIcon,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "1 awaiting approval",
      changeType: "neutral"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.fullName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your sports facilities today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/owner/venues/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add New Venue
            </Link>
            <Link
              href="/owner/venues"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BuildingOfficeIcon className="w-5 h-5 mr-2" />
              Manage Venues
            </Link>
            <Link
              href="/owner/bookings"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CalendarDaysIcon className="w-5 h-5 mr-2" />
              View Bookings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`text-sm ${
                      stat.changeType === "increase"
                        ? "text-green-600"
                        : stat.changeType === "decrease"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">New booking at Court 1 - Badminton Arena</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Payment received - ₹1,200</p>
                <p className="text-xs text-gray-600">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Venue "Tennis Court Pro" is pending approval</p>
                <p className="text-xs text-gray-600">1 day ago</p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/owner/activity"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All Activity →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
