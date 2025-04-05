// File: /app/api/calls/transcription/route.ts (or a Next.js route handler)

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Call from '@/models/callModel'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const transcriptionText = formData.get('TranscriptionText') as string
    const recordingSid = formData.get('RecordingSid') as string

    console.log('Transcription callback =>', {
      recordingSid,
      transcriptionText,
    })

    if (!recordingSid) {
      return new NextResponse('Missing RecordingSid', { status: 400 })
    }

    await connectDB()

    // Find the call by twilioRecordingSid
    const callRecord = await Call.findOne({ twilioRecordingSid: recordingSid })
    if (!callRecord) {
      console.log('No call found with twilioRecordingSid:', recordingSid)
      return new NextResponse('Call not found', { status: 404 })
    }

    // Update the call record with the transcription
    callRecord.transcription = transcriptionText
    await callRecord.save()

    console.log('Transcription saved to call:', callRecord._id)
    return new NextResponse('Transcription received and saved', { status: 200 })

  } catch (error) {
    console.error('Error in transcription callback:', error)
    return new NextResponse('Server error', { status: 500 })
  }
}
