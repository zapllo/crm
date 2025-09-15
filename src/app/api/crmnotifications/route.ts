import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/getDataFromToken";
import connectDB from "@/lib/db";
import { getNotifications, markNotificationsAsRead } from "@/lib/notificationService";
import mongoose from "mongoose";
import { User } from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user ID from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");
    const unreadOnly = searchParams.get("unread") === "true";
    const important = searchParams.get("important") === "true";

    // Get notifications
    const { notifications, count } = await getNotifications(
      new mongoose.Types.ObjectId(userId),
      { limit, skip, unreadOnly, important }
    );

    // Return notifications with pagination info
    return NextResponse.json({
      notifications,
      pagination: {
        total: count,
        limit,
        skip,
        hasMore: skip + limit < count
      }
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user ID from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { notificationIds, markAll = false } = body;

    // Mark notifications as read
    const modifiedCount = await markNotificationsAsRead(
      new mongoose.Types.ObjectId(userId),
      markAll ? undefined : notificationIds
    );

    return NextResponse.json({
      success: true,
      modifiedCount
    });
  } catch (error: any) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
