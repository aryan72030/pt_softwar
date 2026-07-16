<x-mail::message>
# Proficiency Testing Sample Dispatched

Hello,

We are pleased to inform you that your sample for the PT Program **{{ $sample->registration->ptProgram->program_name }}** has been dispatched.

**Dispatch Details:**
- **Sample ID:** {{ $sample->sample_id }}
- **Courier Partner:** {{ $sample->courier_partner }}
- **Tracking Number:** {{ $sample->tracking_number }}
- **Dispatch Date:** {{ $sample->dispatched_at->format('M d, Y') }}

Please track your shipment using the tracking number above. Once received, please verify the sample and prepare for testing.

<x-mail::button :url="route('dashboard')">
Go to Dashboard
</x-mail::button>

Best regards,<br>
{{ config('app.name') }} Team
</x-mail::message>
