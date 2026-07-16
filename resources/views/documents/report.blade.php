<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PT Report - {{ $registration->registration_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #111; margin: 32px; }
        h1, h2, h3, p { margin: 0; }
        .header, .section { margin-bottom: 24px; }
        .title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .subtitle { color: #555; }
        .grid { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .grid th, .grid td { border: 1px solid #d4d4d4; padding: 10px; text-align: left; font-size: 14px; vertical-align: top; }
        .grid th { background: #f5f5f5; }
        .meta td { width: 50%; }
        .muted { color: #666; }
        .badge { display: inline-block; padding: 4px 10px; border: 1px solid #16a34a; color: #16a34a; border-radius: 999px; font-size: 12px; font-weight: 700; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Participant PT Report</div>
        <p class="subtitle">Registration No: {{ $registration->registration_number }}</p>
        <p class="subtitle">Program: {{ $program->program_name }} ({{ $program->program_code }})</p>
    </div>

    <div class="section">
        <span class="badge">Report Released</span>
    </div>

    <div class="section">
        <h3>Participant Details</h3>
        <table class="grid meta">
            <tr>
                <td><strong>Laboratory:</strong> {{ $laboratory->lab_name }}</td>
                <td><strong>Contact Person:</strong> {{ $laboratory->contact_person }}</td>
            </tr>
            <tr>
                <td><strong>Email:</strong> {{ $laboratory->user->email }}</td>
                <td><strong>Mobile:</strong> {{ $laboratory->mobile }}</td>
            </tr>
            <tr>
                <td><strong>Sample ID:</strong> {{ $sample?->sample_id ?? 'Not assigned' }}</td>
                <td><strong>Report Date:</strong> {{ $program->report_release_date->format('d M Y') }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h3>Submitted Results</h3>
        <table class="grid">
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Method</th>
                    <th>Result</th>
                    <th>Unit</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($observations as $observation)
                    <tr>
                        <td>{{ $observation->parameter_name }}</td>
                        <td>{{ $observation->test_method }}</td>
                        <td>{{ $observation->result }}</td>
                        <td>{{ $observation->unit }}</td>
                        <td>{{ $observation->remarks ?: '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="muted">No observations found for this registration.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>Performance Note</h3>
        <p class="muted">
            Statistical evaluation and certificate reference can be mapped from the released report workflow.
            This downloadable document summarizes the participant submission and release status.
        </p>
    </div>
</body>
</html>
