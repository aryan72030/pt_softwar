<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Certificate - {{ $registration->registration_number }}</title>
    <style>
        body { font-family: Georgia, serif; color: #111; margin: 36px; border: 8px solid #111; padding: 40px; text-align: center; }
        h1, h2, p { margin: 0; }
        .small { font-size: 14px; color: #555; }
        .title { font-size: 40px; font-weight: 700; margin-bottom: 12px; }
        .subtitle { font-size: 20px; margin-bottom: 28px; }
        .participant { font-size: 28px; font-weight: 700; margin: 24px 0; }
        .program { font-size: 18px; margin-bottom: 20px; }
        .footer { margin-top: 48px; display: flex; justify-content: space-between; text-align: left; }
    </style>
</head>
<body>
    <p class="small">Certificate Reference: {{ $registration->registration_number }}</p>
    <div class="title">Certificate of Participation</div>
    <div class="subtitle">This certifies that</div>

    <div class="participant">{{ $laboratory->lab_name }}</div>

    <p class="program">
        successfully participated in the proficiency testing program
        <strong>{{ $program->program_name }}</strong> ({{ $program->program_code }})
    </p>

    <p class="small">
        Report release date: {{ $program->report_release_date->format('d M Y') }}
    </p>

    <div class="footer">
        <div>
            <p class="small">Participant Contact</p>
            <p>{{ $laboratory->contact_person }}</p>
            <p>{{ $laboratory->designation }}</p>
        </div>
        <div>
            <p class="small">Authorized By</p>
            <p>PT Program Administration</p>
            <p>{{ now()->format('d M Y') }}</p>
        </div>
    </div>
</body>
</html>
