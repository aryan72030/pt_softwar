<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Observation extends Model
{
    protected $fillable = [
        'program_registration_id',
        'parameter_name',
        'test_method',
        'result',
        'unit',
        'remarks',
        'supporting_file_path',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    public function registration()
    {
        return $this->belongsTo(ProgramRegistration::class, 'program_registration_id');
    }
}
