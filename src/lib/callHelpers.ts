import Call from '@/models/callModel';

/**
 * Checks if there's an active call to the given phone number
 * @param phoneNumber The phone number to check
 * @returns Boolean indicating if there's an active call
 */
export async function isActiveCall(phoneNumber: string): Promise<boolean> {
  // Normalize the phone number by removing the + prefix if present
  const normalizedNumber = phoneNumber.replace(/^\+/, '');
  
  // Look for calls that are not completed and match the phone number
  const activeCall = await Call.findOne({
    phoneNumber: { $regex: normalizedNumber }, 
    status: { $in: ['initiated', 'ringing', 'in-progress'] },
    endTime: { $exists: false }
  });
  
  return !!activeCall;
}

/**
 * Cleans up any stale calls that have been in non-terminal states for too long
 */
export async function cleanupStaleCalls(): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Find calls that have been in non-terminal states for more than an hour
  const staleCalls = await Call.find({
    status: { $in: ['initiated', 'ringing', 'in-progress'] },
    startTime: { $lt: oneHourAgo },
    endTime: { $exists: false }
  });
  
  // Mark them as failed
  for (const call of staleCalls) {
    call.status = 'failed';
    call.endTime = new Date();
    await call.save();
    console.log(`Marked stale call ${call._id} as failed`);
  }
}