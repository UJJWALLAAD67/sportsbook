import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Role, BookingStatus } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    // Check if user is admin
    if (!token || token.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Get current date for calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Fetch all statistics in parallel
    const [
      totalUsers,
      totalFacilityOwners,
      totalVenues,
      approvedVenues,
      totalBookings,
      pendingApprovals,
      totalRevenue,
      activeUsers,
      todayBookings,
      thisMonthUsers,
      lastMonthUsers,
      thisMonthBookings,
      lastMonthBookings,
      thisMonthRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Total facility owners count
      prisma.user.count({
        where: { role: Role.OWNER }
      }),
      
      // Total venues count
      prisma.venue.count(),
      
      // Approved venues count
      prisma.venue.count({
        where: { approved: true }
      }),
      
      // Total bookings count
      prisma.booking.count(),
      
      // Pending venue approvals
      prisma.venue.count({
        where: { approved: false }
      }),
      
      // Total revenue (sum of all succeeded payments)
      prisma.payment.aggregate({
        where: { status: "SUCCEEDED" },
        _sum: { amount: true }
      }),
      
      // Active users (users with bookings in last 30 days)
      prisma.user.count({
        where: {
          bookings: {
            some: {
              createdAt: { gte: thirtyDaysAgo }
            }
          }
        }
      }),
      
      // Today's bookings
      prisma.booking.count({
        where: {
          createdAt: { gte: todayStart }
        }
      }),
      
      // This month users
      prisma.user.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      
      // Last month users
      prisma.user.count({
        where: {
          createdAt: { 
            gte: startOfLastMonth,
            lt: startOfMonth
          }
        }
      }),
      
      // This month bookings
      prisma.booking.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      
      // Last month bookings
      prisma.booking.count({
        where: {
          createdAt: { 
            gte: startOfLastMonth,
            lt: startOfMonth
          }
        }
      }),
      
      // This month revenue
      prisma.payment.aggregate({
        where: { 
          status: "SUCCEEDED",
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      
      // Last month revenue
      prisma.payment.aggregate({
        where: { 
          status: "SUCCEEDED",
          createdAt: { 
            gte: startOfLastMonth,
            lt: startOfMonth
          }
        },
        _sum: { amount: true }
      })
    ]);

    // Calculate growth percentages
    const userGrowth = lastMonthUsers > 0 ? 
      Math.round(((thisMonthUsers) / lastMonthUsers) * 100) : 
      thisMonthUsers > 0 ? 100 : 0;
    
    const bookingGrowth = lastMonthBookings > 0 ? 
      Math.round(((thisMonthBookings) / lastMonthBookings) * 100) : 
      thisMonthBookings > 0 ? 100 : 0;

    const revenueGrowth = (lastMonthRevenue._sum.amount || 0) > 0 ? 
      Math.round(((thisMonthRevenue._sum.amount || 0) / (lastMonthRevenue._sum.amount || 0)) * 100) : 
      (thisMonthRevenue._sum.amount || 0) > 0 ? 100 : 0;

    const totalRevenueValue = totalRevenue._sum.amount || 0;

    const stats = {
      totalUsers,
      totalFacilityOwners,
      totalVenues,
      totalBookings,
      pendingApprovals,
      totalRevenue: totalRevenueValue,
      activeUsers,
      reportedIssues: 0, // Mock for now - can implement reports table later
      todayBookings,
      userGrowth,
      bookingGrowth,
      revenueGrowth,
      // Additional calculated metrics
      approvedVenues,
      venueApprovalRate: totalVenues > 0 ? 
        Math.round((approvedVenues / totalVenues) * 100) : 0,
      averageRevenuePerBooking: totalBookings > 0 ? 
        Math.round(totalRevenueValue / totalBookings) : 0
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
