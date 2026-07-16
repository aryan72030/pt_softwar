<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PtPlan extends Model
{
    protected $fillable = [
        'pt_program_id',
        'program_number',
        'material',
        'parameters',
        'timeline',
        'assigned_coordinator',
        'sample_quantity',
        'sample_preparation_instructions',
    ];

    protected function casts(): array
    {
        return [
            'parameters' => 'array',
            'timeline' => 'array',
        ];
    }

    public function ptProgram()
    {
        return $this->belongsTo(PtProgram::class);
    }
}
