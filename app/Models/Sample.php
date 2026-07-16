<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sample extends Model
{
    protected $fillable = [
        'program_registration_id',
        'sample_id',
        'qr_code_path',
        'status',
        'tracking_number',
        'courier_partner',
        'dispatched_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'dispatched_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function registration()
    {
        return $this->belongsTo(ProgramRegistration::class, 'program_registration_id');
    }
}
