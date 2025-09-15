'use client'
// pages/followup.js
import { useState } from 'react';

function FollowupForm() {
    const [leadId, setLeadId] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [followupDate, setFollowupDate] = useState('');
    const [reminders, setReminders] = useState('');

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const response = await fetch('/api/followups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                leadId,
                description,
                type,
                followupDate,
                reminders,
            }),
        });
        const data = await response.json();
        console.log(data);
    };

    return (
        <form className='p-4 border space-y-3' onSubmit={handleSubmit}>
            <label>
                Lead ID:
                <input type="text" value={leadId} onChange={(event) => setLeadId(event.target.value)} />
            </label>
            <br />
            <label>
                Description:
                <input type="text" value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <br />
            <label>
                Type:
                <input type="text" value={type} onChange={(event) => setType(event.target.value)} />
            </label>
            <br />
            <label>
                Follow-up Date:
                <input type="date" value={followupDate} onChange={(event) => setFollowupDate(event.target.value)} />
            </label>
            <br />
            <label>
                Reminders:
                <input type="text" value={reminders} onChange={(event) => setReminders(event.target.value)} />
            </label>
            <br />
            <button type="submit">Create Follow-up</button>
        </form>
    );
}

export default FollowupForm;