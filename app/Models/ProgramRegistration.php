<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramRegistration extends Model
{
    protected $fillable = [
        'lab_id',
        'pt_program_id',
        'registration_number',
        'referral_code_id',
        'payment_status',
        'amount_paid',
        'status',
        'parameters',
        'shipping_address',
        'billing_address',
        'registered_at',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'amount_paid' => 'decimal:2',
            'parameters' => 'array',
        ];
    }

    public function laboratory()
    {
        return $this->belongsTo(Laboratory::class, 'lab_id');
    }

    public function ptProgram()
    {
        return $this->belongsTo(PtProgram::class, 'pt_program_id');
    }

    public function referralCode()
    {
        return $this->belongsTo(ReferralCode::class, 'referral_code_id');
    }

    public function sample()
    {
        return $this->hasOne(Sample::class, 'program_registration_id');
    }

    public function observations()
    {
        return $this->hasMany(Observation::class, 'program_registration_id');
    }
}

