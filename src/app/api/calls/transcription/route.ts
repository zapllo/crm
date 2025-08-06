import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Call from '@/models/callModel'
import { generateCallSummary } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const transcriptionText = formData.get('TranscriptionText') as string
    const recordingSid = formData.get('RecordingSid') as string

    console.log('Transcription callback =>', {
      recordingSid,
      transcriptionText,
    })

    if (!recordingSid || !transcriptionText) {
      return new NextResponse('Missing required fields', { status: 400 })
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
    
    // Generate AI summary if transcription is meaningful
    if (transcriptionText.trim().length > 10) {
      try {
        const summary = await generateCallSummary(transcriptionText)
        callRecord.summary = summary
        console.log('Generated summary for call:', callRecord._id)
      } catch (error) {
        console.error('Failed to generate summary:', error)
        // Continue without summary if generation fails
      }
    }

    await callRecord.save()

    console.log('Transcription and summary saved to call:', callRecord._id)
    return new NextResponse('Transcription received and processed', { status: 200 })

  } catch (error) {
    console.error('Error in transcription callback:', error)
    return new NextResponse('Server error', { status: 500 })
  }
}