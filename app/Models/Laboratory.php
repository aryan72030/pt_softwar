<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Laboratory extends Model
{
    protected $fillable = [
        'user_id',
        'lab_name',
        'nabl_cert_no',
        'lab_type',
        'gst_number',
        'address',
        'city',
        'state',
        'country',
        'pin_code',
        'contact_person',
        'designation',
        'mobile',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function registrations()
    {
        return $this->hasMany(ProgramRegistration::class, 'lab_id');
    }
}
