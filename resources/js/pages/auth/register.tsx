import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { User, Building, MapPin, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const [step, setStep] = useState(1);

    const steps = [
        { number: 1, title: 'Account', icon: User },
        { number: 2, title: 'Laboratory', icon: Building },
        { number: 3, title: 'Contact', icon: MapPin }
    ];

    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1) {
            const nameInput = document.getElementById('name') as HTMLInputElement;
            const emailInput = document.getElementById('email') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            const confirmInput = document.getElementById('password_confirmation') as HTMLInputElement;

            if (!nameInput?.checkValidity() || !emailInput?.checkValidity() || !passwordInput?.checkValidity() || !confirmInput?.checkValidity()) {
                nameInput?.reportValidity() || emailInput?.reportValidity() || passwordInput?.reportValidity() || confirmInput?.reportValidity();
                return false;
            }

            if (passwordInput.value !== confirmInput.value) {
                confirmInput.setCustomValidity("Passwords do not match.");
                confirmInput.reportValidity();
                return false;
            } else {
                confirmInput.setCustomValidity("");
            }
            return true;
        }

        if (currentStep === 2) {
            const labNameInput = document.getElementById('lab_name') as HTMLInputElement;
            const labTypeSelect = document.getElementById('lab_type') as HTMLSelectElement;
            const gstInput = document.getElementById('gst_number') as HTMLInputElement;

            if (!labNameInput?.checkValidity() || !labTypeSelect?.checkValidity() || !gstInput?.checkValidity()) {
                labNameInput?.reportValidity() || labTypeSelect?.reportValidity() || gstInput?.reportValidity();
                return false;
            }
            return true;
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        setStep((prev) => prev - 1);
    };

    return (
        <>
            <Head title="Register" />

            {/* Stepper Indicator */}
            <div className="mb-6 flex justify-between items-center bg-card/50 p-3 rounded-lg border">
                {steps.map((s, idx) => {
                    const Icon = s.icon;
                    const isActive = step === s.number;
                    const isCompleted = step > s.number;
                    return (
                        <div key={s.number} className="flex items-center flex-1 last:flex-initial">
                            <div className="flex flex-col items-center gap-1 mx-auto">
                                <div className={`flex items-center justify-center size-8 rounded-full border transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-primary text-primary-foreground border-primary' 
                                        : isCompleted 
                                        ? 'bg-primary/20 text-primary border-primary/20' 
                                        : 'bg-muted text-muted-foreground border-input'
                                }`}>
                                    {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
                                </div>
                                <span className={`text-[10px] font-medium hidden sm:inline ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                    {s.title}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-2 transition-colors duration-500 ${
                                    step > s.number ? 'bg-primary' : 'bg-muted'
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {/* STEP 1: Account Credentials */}
                        <div className={step !== 1 ? 'hidden' : 'grid gap-4'}>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus={step === 1}
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Your Name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="button"
                                className="mt-2 w-full cursor-pointer"
                                onClick={handleNext}
                                tabIndex={5}
                            >
                                Next Step <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </div>

                        {/* STEP 2: Laboratory Information */}
                        <div className={step !== 2 ? 'hidden' : 'grid gap-4'}>
                            <div className="grid gap-2">
                                <Label htmlFor="lab_name">Laboratory Name</Label>
                                <Input
                                    id="lab_name"
                                    type="text"
                                    required={step === 2}
                                    name="lab_name"
                                    placeholder="Apex Testing Labs"
                                />
                                <InputError message={errors.lab_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="lab_type">Laboratory Type</Label>
                                <select
                                    id="lab_type"
                                    required={step === 2}
                                    name="lab_type"
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-foreground cursor-pointer"
                                >
                                    <option value="" className="text-muted-foreground bg-popover">Select Type</option>
                                    <option value="Testing" className="text-foreground bg-popover">Testing Laboratory</option>
                                    <option value="Calibration" className="text-foreground bg-popover">Calibration Laboratory</option>
                                    <option value="Medical" className="text-foreground bg-popover">Medical Laboratory</option>
                                    <option value="Research" className="text-foreground bg-popover">Research & Development</option>
                                </select>
                                <InputError message={errors.lab_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nabl_cert_no">NABL Certificate Number (Optional)</Label>
                                <Input
                                    id="nabl_cert_no"
                                    type="text"
                                    name="nabl_cert_no"
                                    placeholder="MC-XXXX or TC-XXXX"
                                />
                                <InputError message={errors.nabl_cert_no} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gst_number">GST Number</Label>
                                <Input
                                    id="gst_number"
                                    type="text"
                                    required={step === 2}
                                    name="gst_number"
                                    placeholder="15-digit GSTIN"
                                    maxLength={15}
                                />
                                <InputError message={errors.gst_number} />
                            </div>

                            <div className="flex gap-4 mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 cursor-pointer"
                                    onClick={handlePrev}
                                >
                                    <ArrowLeft className="mr-2 size-4" /> Back
                                </Button>
                                <Button
                                    type="button"
                                    className="flex-1 cursor-pointer"
                                    onClick={handleNext}
                                >
                                    Next Step <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </div>
                        </div>

                        {/* STEP 3: Contact & Address Information */}
                        <div className={step !== 3 ? 'hidden' : 'grid gap-4'}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="contact_person">Contact Person</Label>
                                    <Input
                                        id="contact_person"
                                        type="text"
                                        required={step === 3}
                                        name="contact_person"
                                        placeholder="Full Name"
                                    />
                                    <InputError message={errors.contact_person} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input
                                        id="designation"
                                        type="text"
                                        required={step === 3}
                                        name="designation"
                                        placeholder="Lab Manager"
                                    />
                                    <InputError message={errors.designation} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    type="tel"
                                    required={step === 3}
                                    name="mobile"
                                    placeholder="10-digit mobile number"
                                />
                                <InputError message={errors.mobile} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    type="text"
                                    required={step === 3}
                                    name="address"
                                    placeholder="Street Address, Building, Suite"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        required={step === 3}
                                        name="city"
                                        placeholder="City"
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        type="text"
                                        required={step === 3}
                                        name="state"
                                        placeholder="State"
                                    />
                                    <InputError message={errors.state} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        type="text"
                                        required={step === 3}
                                        name="country"
                                        defaultValue="India"
                                    />
                                    <InputError message={errors.country} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="pin_code">PIN Code</Label>
                                    <Input
                                        id="pin_code"
                                        type="text"
                                        required={step === 3}
                                        name="pin_code"
                                        placeholder="Zip/PIN Code"
                                    />
                                    <InputError message={errors.pin_code} />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 cursor-pointer"
                                    onClick={handlePrev}
                                >
                                    <ArrowLeft className="mr-2 size-4" /> Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 cursor-pointer"
                                    disabled={processing}
                                    data-test="register-user-button"
                                >
                                    {processing && <Spinner />}
                                    Create Account
                                </Button>
                            </div>
                        </div>

                        {step === 1 && (
                            <div className="text-center text-sm text-muted-foreground mt-2">
                                Already have an account?{' '}
                                <TextLink href={login()} tabIndex={6}>
                                    Log in
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
