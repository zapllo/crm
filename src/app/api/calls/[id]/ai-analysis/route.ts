import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import { Organization } from '@/models/organizationModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params before using
        const { id } = await params;
        const { action } = await req.json(); // 'transcribe' or 'summarize' or 'both'

        // Get logged-in user ID and organization from the token
        const userId = getDataFromToken(req);

        // Find the user and organization
        const user = await User.findById(userId);
        if (!user?.organization) {
            return NextResponse.json({ error: 'User organization not found' }, { status: 403 });
        }

        await connectDB();

        // Find the call
        const call = await Call.findById(id);
        if (!call) {
            return NextResponse.json({ error: 'Call not found' }, { status: 404 });
        }

        // Verify the call belongs to the user's organization
        if (call.organizationId.toString() !== user.organization.toString()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if call has recording
        if (!call.recordingUrl) {
            return NextResponse.json({ error: 'No recording available for this call' }, { status: 400 });
        }

        // Get organization to check AI credits
        const organization = await Organization.findById(user.organization);
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Calculate required credits
        let requiredCredits = 0;
        const needsTranscription = action === 'transcribe' || action === 'both';
        const needsSummary = action === 'summarize' || action === 'both';

        if (needsTranscription && !call.transcription) requiredCredits += 3; // 3 credits for advanced transcription
        if (needsSummary && !call.summary) requiredCredits += 2; // 2 credits for GPT-4 summary
        if (needsSummary && !call.outcome) requiredCredits += 1; // 1 credit for outcome analysis

        // Check if organization has enough credits
        if (organization.aiCredits < requiredCredits) {
            return NextResponse.json({ 
                error: 'Insufficient AI credits',
                required: requiredCredits,
                available: organization.aiCredits
            }, { status: 402 });
        }

        let result: any = {};

        try {
            // Generate transcription if needed
            if (needsTranscription && !call.transcription) {
                const transcription = await generateConversationTranscription(call.recordingUrl);
                call.transcription = transcription;
                result.transcription = transcription;
            } else if (call.transcription) {
                result.transcription = call.transcription;
            }

            // Generate summary and outcome if needed
            if (needsSummary && (!call.summary || !call.outcome)) {
                const transcriptionText = call.transcription || result.transcription;
                if (!transcriptionText) {
                    return NextResponse.json({ 
                        error: 'Cannot generate summary without transcription' 
                    }, { status: 400 });
                }

                const analysis = await generateBusinessAnalysis(transcriptionText);
                call.summary = analysis.summary;
                call.outcome = analysis.outcome;
                result.summary = analysis.summary;
                result.outcome = analysis.outcome;
            } else {
                if (call.summary) result.summary = call.summary;
                if (call.outcome) result.outcome = call.outcome;
            }

            // Save the updated call
            await call.save();

            // Deduct AI credits from organization
            if (requiredCredits > 0) {
                organization.aiCredits -= requiredCredits;
                await organization.save();
            }

            return NextResponse.json({
                ...result,
                creditsUsed: requiredCredits,
                remainingCredits: organization.aiCredits
            });

        } catch (aiError) {
            console.error('AI processing error:', aiError);
            return NextResponse.json({ 
                error: 'Failed to process AI analysis',
                details: aiError instanceof Error ? aiError.message : 'Unknown error'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error processing AI analysis:', error);
        return NextResponse.json(
            { error: 'Failed to process AI analysis' },
            { status: 500 }
        );
    }
}

async function generateConversationTranscription(recordingUrl: string): Promise<string> {
    try {
        // Download the audio file
        const response = await fetch(recordingUrl);
        if (!response.ok) {
            throw new Error(`Failed to download recording: ${response.statusText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const audioFile = new File([audioBuffer], 'recording.mp3', { type: 'audio/mpeg' });

        // Use Whisper API for transcription with conversation formatting
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            response_format: 'verbose_json',
            timestamp_granularities: ['segment'],
        });

        // Format as conversation
        const formattedTranscription = await openai.chat.completions.create({
            model: 'gpt-4o', // Latest GPT-4 model
            messages: [
                {
                    role: 'system',
                    content: `You are an expert at formatting call transcriptions. Convert the following transcription into a clean conversation format with speaker labels. 
                    
                    Format it like:
                    Agent: [dialogue]
                    Customer: [dialogue]
                    
                    Use "Agent:" for the person who seems to be from the business/company and "Customer:" for the person who seems to be the client/customer. If unclear, use "Speaker 1:" and "Speaker 2:".
                    
                    Clean up any filler words, "ums", "ahs", and make it professional and readable while maintaining the original meaning and context.
                    
                    Return ONLY the formatted conversation, nothing else.`
                },
                {
                    role: 'user',
                    content: `Please format this transcription as a conversation:\n\n${transcription.text}`
                }
            ],
            temperature: 0.1,
            max_tokens: 2000,
        });

        return formattedTranscription.choices[0]?.message?.content || transcription.text;
    } catch (error) {
        console.error('Transcription error:', error);
        throw new Error('Failed to generate transcription');
    }
}

async function generateBusinessAnalysis(transcription: string): Promise<{ summary: string; outcome: string }> {
    try {
        // Generate summary
        const summaryCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert business call analyst for Zapllo CRM. Analyze this phone call conversation and provide a professional business summary.

                    Your summary should include:
                    - Call purpose and context
                    - Key discussion points
                    - Customer needs/concerns identified
                    - Solutions or products discussed
                    - Next steps or commitments made
                    - Any follow-up actions required

                    Keep it concise (150-200 words), professional, and focused on business value and customer relationship context.
                    
                    Return ONLY the summary text, no formatting, no JSON, no additional text.`
                },
                {
                    role: 'user',
                    content: `Please analyze this business call transcription and provide a summary:\n\n${transcription}`
                }
            ],
            temperature: 0.2,
            max_tokens: 300,
        });

        // Generate outcome
        const outcomeCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert at categorizing business call outcomes. Based on the call conversation, determine the single word outcome from these options:

                    - "Success" (deal closed, positive outcome, customer satisfied)
                    - "Follow-up" (needs more discussion, waiting for decision)
                    - "Interested" (customer showed interest but no commitment)
                    - "Declined" (customer not interested, deal lost)
                    - "Inquiry" (information gathering, no sales intent)
                    - "Support" (customer service, technical support)
                    - "Complaint" (customer issue, dissatisfaction)
                    - "Cancelled" (cancellation request)

                    Return ONLY one word from the above options, nothing else.`
                },
                {
                    role: 'user',
                    content: `What is the outcome of this call?\n\n${transcription}`
                }
            ],
            temperature: 0.1,
            max_tokens: 10,
        });

        const summary = summaryCompletion.choices[0]?.message?.content?.trim() || 'Unable to generate summary';
        const outcome = outcomeCompletion.choices[0]?.message?.content?.trim() || 'Inquiry';

        // Clean up the outcome to ensure it matches our expected values
        const validOutcomes = ['Success', 'Follow-up', 'Interested', 'Declined', 'Inquiry', 'Support', 'Complaint', 'Cancelled'];
        const cleanOutcome = validOutcomes.find(o => outcome.toLowerCase().includes(o.toLowerCase())) || 'Inquiry';

        return {
            summary: summary,
            outcome: cleanOutcome
        };

    } catch (error) {
        console.error('Business analysis error:', error);
        throw new Error('Failed to generate business analysis');
    }
}