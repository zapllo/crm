import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import connectDB from '@/lib/db'
import { User } from '@/models/userModel'


/**
 * PATCH /api/members/[id]
 *    => body: { orgId, firstName, lastName, email, password, roleId, ... }
 * DELETE /api/members/[id]?orgId=ORG_ID
 */

export async function PATCH(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB()

        // const { id } = params
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
        }

        // Parse the request body
        const data = await req.json()
        const { orgId, firstName, lastName, email, password, roleId, whatsappNo } = data
        if (!orgId) {
            return NextResponse.json({ error: 'Missing orgId in request body' }, { status: 400 })
        }

        // Find the user
        const user = await User.findById(id)
        if (!user) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        // Check if this user belongs to the same org
        if (user.organization.toString() !== orgId) {
            return NextResponse.json({ error: 'Not authorized for this org' }, { status: 403 })
        }

        // Update fields if provided
        if (firstName !== undefined) user.firstName = firstName
        if (lastName !== undefined) user.lastName = lastName
        if (email !== undefined) user.email = email
        if (password !== undefined) user.password = password // user schema pre-save hook re-hashes
        if (roleId !== undefined) user.role = roleId
        if (whatsappNo !== undefined) user.whatsappNo = whatsappNo

        await user.save()
        // Fetch the updated user with populated role
        const updatedUser = await User.findById(id).populate('role')

        return NextResponse.json(updatedUser, { status: 200 })
    } catch (error: any) {
        console.error('Error updating member:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB()

        // const { id } = await params
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
        }

        // orgId might be passed in query string
        const { searchParams } = new URL(req.url)
        const orgId = searchParams.get('orgId')
        if (!orgId) {
            return NextResponse.json({ error: 'Missing orgId in query' }, { status: 400 })
        }

        // Find the user
        const user = await User.findById(id)
        if (!user) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        // Check org
        if (user.organization.toString() !== orgId) {
            return NextResponse.json({ error: 'Not authorized for this org' }, { status: 403 })
        }

        await user.deleteOne();
        return NextResponse.json({ message: 'Member deleted' }, { status: 200 })
    } catch (error: any) {
        console.error('Error deleting member:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
