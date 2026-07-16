<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralCode extends Model
{
    protected $fillable = [
        'code',
        'discount_type',
        'value',
        'client_specific_id',
        'expiry_date',
        'is_one_time',
        'used_count',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'datetime',
            'is_one_time' => 'boolean',
            'used_count' => 'integer',
            'value' => 'decimal:2',
        ];
    }

    public function clientSpecific()
    {
        return $this->belongsTo(User::class, 'client_specific_id');
    }

    public function registrations()
    {
        return $this->hasMany(ProgramRegistration::class, 'referral_code_id');
    }
}
