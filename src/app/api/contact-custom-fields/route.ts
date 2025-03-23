// app/api/contact-custom-fields/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactCustomFieldDefinition from '@/models/contactCustomFieldModel';
import { Types } from 'mongoose';
import contactModel from '@/models/contactModel';

/**
 * GET    /api/contact-custom-fields => returns all definitions
 * POST   /api/contact-custom-fields => creates a new definition
 * PATCH  /api/contact-custom-fields => updates an existing definition by ID
 * DELETE /api/contact-custom-fields => deletes an existing definition by ID
 */

export async function GET() {
    try {
        await connectDB();
        const definitions = await ContactCustomFieldDefinition.find().sort({ createdAt: -1 });
        return NextResponse.json(definitions, { status: 200 });
    } catch (error) {
        console.error('GET contact fields error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const { name, fieldType, mandatory, options } = await request.json();

        const newDef = new ContactCustomFieldDefinition({
            name,
            fieldType,
            mandatory,
            options: fieldType === 'Dropdown' ? options || [] : [],
        });
        await newDef.save();
        return NextResponse.json(newDef, { status: 201 });
    } catch (error) {
        console.error('POST contact fields error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        await connectDB();
        const { id, updates } = await request.json();
        if (!id || !updates) {
            return NextResponse.json({ error: 'ID or updates missing' }, { status: 400 });
        }

        const updatedDef = await ContactCustomFieldDefinition.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        );
        if (!updatedDef) {
            return NextResponse.json({ error: 'Definition not found' }, { status: 404 });
        }

        return NextResponse.json(updatedDef, { status: 200 });
    } catch (error) {
        console.error('PATCH contact fields error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();

        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'No definition ID provided' }, { status: 400 });
        }

        // Remove the custom field from all contacts that have this custom field
        await contactModel.updateMany(
            { "customFieldValues.definition": new Types.ObjectId(id) },
            { $pull: { customFieldValues: { definition: new Types.ObjectId(id) } } }
        );

        // Now delete the custom field definition
        await ContactCustomFieldDefinition.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Definition and associated custom field values deleted' }, { status: 200 });
    } catch (error) {
        console.error('DELETE contact fields error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
