<x-mail::message>
# Welcome, {{ $user->name }}!

Thank you for registering your laboratory with our Proficiency Testing (PT) Portal.

Your account has been created successfully. Below are your login credentials:

<x-mail::panel>
**User ID (Username):** `{{ $user->username }}`  
**Email Address:** `{{ $user->email }}`  
**Password:** *(The password you set during registration)*
</x-mail::panel>

You can now log in using either your generated **User ID** or your **Email Address**.

<x-mail::button :url="route('login')">
Log In to Portal
</x-mail::button>

If you have any questions or require assistance, please contact our support team.

Thanks,<br>
{{ config('app.name') }} Team
</x-mail::message>
