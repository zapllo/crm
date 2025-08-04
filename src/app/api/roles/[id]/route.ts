import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Role } from "@/models/roleModel";
import { Types } from "mongoose";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";

export async function PATCH(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id

    await connectDB();


    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    // Parse the request body
    const data = await req.json();
    const { name, leadAccess, pages, features, orgId } = data;

    if (!name || !leadAccess || !orgId) {
      return NextResponse.json(
        { error: "Missing required fields (name, leadAccess, orgId)" },
        { status: 400 }
      );
    }

    // Verify user belongs to the organization
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user || user.organization.toString() !== orgId) {
      return NextResponse.json(
        { error: "Not authorized for this organization" },
        { status: 403 }
      );
    }

    // Find the role
    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Check if role belongs to the correct organization
    if (role.organization.toString() !== orgId) {
      return NextResponse.json(
        { error: "Role not found in this organization" },
        { status: 404 }
      );
    }

    // Update role
    role.name = name;
    role.leadAccess = leadAccess;

    // Update permissions
    if (pages) {
      role.pagePermissions = pages.map((p: any) => ({
        page: p.page,
        canView: p.canView,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
        canAdd: p.canAdd,
      }));
    }

    if (features) {
      role.featurePermissions = features.map((f: any) => ({
        feature: f.feature,
        enabled: f.enabled,
      }));
    }

    await role.save();
    return NextResponse.json(role, { status: 200 });
  } catch (error: any) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id

    await connectDB();


    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    // Get orgId from query params
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json(
        { error: "Missing organization ID" },
        { status: 400 }
      );
    }

    // Verify user has permissions
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user || user.organization.toString() !== orgId) {
      return NextResponse.json(
        { error: "Not authorized for this organization" },
        { status: 403 }
      );
    }

    // Find and check the role
    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role.organization.toString() !== orgId) {
      return NextResponse.json(
        { error: "Role not found in this organization" },
        { status: 404 }
      );
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ role: id });
    if (usersWithRole > 0) {
      return NextResponse.json(
        {
          error: "Role is assigned to users",
          message: "This role is currently assigned to one or more users. Please reassign these users before deleting the role."
        },
        { status: 409 }
      );
    }

    // Delete the role
    await role.deleteOne();
    return NextResponse.json({ message: "Role deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting role:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}