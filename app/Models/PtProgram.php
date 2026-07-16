<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class PtProgram extends Model
{
    protected $fillable = [
        'program_code',
        'program_name',
        'discipline',
        'parameters',
        'reg_start_date',
        'reg_end_date',
        'dispatch_date',
        'submission_deadline',
        'report_release_date',
        'fee',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'parameters' => 'array',
            'reg_start_date' => 'datetime',
            'reg_end_date' => 'datetime',
            'dispatch_date' => 'datetime',
            'submission_deadline' => 'datetime',
            'report_release_date' => 'datetime',
            'fee' => 'decimal:2',
        ];
    }

    public function registrations()
    {
        return $this->hasMany(ProgramRegistration::class, 'pt_program_id');
    }

    public function ptPlan()
    {
        return $this->hasOne(PtPlan::class);
    }
    public function scopeCurrentlyOpen(Builder $query): Builder
    {
        return $query
            ->whereIn('status', ['open', 'active'])
            ->where('reg_start_date', '<=', now())
            ->where('reg_end_date', '>=', now());
    }

    public function registrationIsOpen(): bool
    {
        return in_array($this->status, ['open', 'active'], true)
            && now()->betweenIncluded($this->reg_start_date, $this->reg_end_date);
    }

    public static function syncRegistrationStatuses(): void
    {
        static::where('status', 'open')
            ->where('reg_start_date', '<=', now())
            ->where('reg_end_date', '>=', now())
            ->update(['status' => 'active']);

        static::whereIn('status', ['open', 'active'])
            ->where('reg_end_date', '<', now())
            ->update(['status' => 'closed']);
    }
}
