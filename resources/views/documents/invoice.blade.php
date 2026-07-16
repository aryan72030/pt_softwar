<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $registration->registration_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #111; margin: 32px; }
        h1, h2, p { margin: 0; }
        .header, .section { margin-bottom: 24px; }
        .title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .subtitle { color: #555; }
        .grid { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .grid th, .grid td { border: 1px solid #d4d4d4; padding: 10px; text-align: left; font-size: 14px; }
        .grid th { background: #f5f5f5; }
        .totals { width: 360px; margin-left: auto; }
        .right { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Invoice</div>
        <p class="subtitle">Invoice Ref: {{ $registration->registration_number }}</p>
        <p class="subtitle">Issued On: {{ ($registration->registered_at ?? $registration->created_at)->format('d M Y') }}</p>
    </div>

    <div class="section">
        <table class="grid">
            <tr>
                <th>Bill To</th>
                <th>Program</th>
            </tr>
            <tr>
                <td>
                    <strong>{{ $laboratory->lab_name }}</strong><br>
                    {{ $laboratory->address }}, {{ $laboratory->city }}, {{ $laboratory->state }}<br>
                    {{ $laboratory->country }} - {{ $laboratory->pin_code }}<br>
                    GST: {{ $laboratory->gst_number }}
                </td>
                <td>
                    {{ $program->program_name }}<br>
                    Code: {{ $program->program_code }}<br>
                    Registration: {{ $registration->registration_number }}
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <table class="grid">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="right">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>PT Program Registration Fee</td>
                    <td class="right">Rs. {{ number_format((float) $program->fee, 2) }}</td>
                </tr>
                <tr>
                    <td>Referral Discount</td>
                    <td class="right">- Rs. {{ number_format((float) $discount, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Total Paid</strong></td>
                    <td class="right"><strong>Rs. {{ number_format((float) $registration->amount_paid, 2) }}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <p><strong>Payment Status:</strong> {{ strtoupper($registration->payment_status) }}</p>
    </div>
</body>
</html>
