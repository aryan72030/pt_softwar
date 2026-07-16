import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Layers, ShoppingBag, Truck, CreditCard, Ticket, ArrowLeft, 
    CheckCircle, AlertCircle, Info, HelpCircle, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

type Program = {
    id: number;
    program_code: string;
    program_name: string;
    discipline: string;
    parameters: string[];
    fee: number;
};

type Laboratory = {
    id: number;
    lab_name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pin_code: string;
};

type Props = {
    program: Program;
    laboratory: Laboratory;
};

export default function Register({ program, laboratory }: Props) {
    const fullAddress = `${laboratory.address}, ${laboratory.city}, ${laboratory.state}, ${laboratory.country} - ${laboratory.pin_code}`;

    const form = useForm({
        parameters: [] as string[],
        sample_quantity: 1,
        shipping_address: fullAddress,
        billing_address: fullAddress,
        referral_code: '',
    });

    const [sameAddress, setSameAddress] = useState(true);
    const [referralCode, setReferralCode] = useState('');
    const [refStatus, setRefStatus] = useState<{
        valid: boolean | null;
        message: string;
        discountType: 'percentage' | 'fixed' | null;
        value: number;
    }>({
        valid: null,
        message: '',
        discountType: null,
        value: 0
    });
    const [validatingRef, setValidatingRef] = useState(false);

    useEffect(() => {
        if (sameAddress) {
            form.setData('billing_address', form.data.shipping_address);
        }
    }, [sameAddress, form.data.shipping_address]);

    const handleParameterChange = (param: string, checked: boolean) => {
        const current = [...form.data.parameters];
        if (checked) {
            form.setData('parameters', [...current, param]);
        } else {
            form.setData('parameters', current.filter(p => p !== param));
        }
    };

    const handleValidateReferral = async () => {
        if (!referralCode.trim()) return;
        setValidatingRef(true);
        try {
            const tokenEl = document.querySelector('meta[name="csrf-token"]');
            const token = tokenEl ? tokenEl.getAttribute('content') : '';

            const res = await fetch('/referral/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ code: referralCode })
            });

            const data = await res.json();
            if (data.valid) {
                setRefStatus({
                    valid: true,
                    message: data.message,
                    discountType: data.discount_type,
                    value: data.value
                });
                form.setData('referral_code', referralCode);
            } else {
                setRefStatus({
                    valid: false,
                    message: data.message,
                    discountType: null,
                    value: 0
                });
                form.setData('referral_code', '');
            }
        } catch (err) {
            setRefStatus({
                valid: false,
                message: 'Failed to validate referral code.',
                discountType: null,
                value: 0
            });
        } finally {
            setValidatingRef(false);
        }
    };

    // Calculate billing details
    const originalFee = Number(program.fee);
    let discountAmount = 0;
    if (refStatus.valid && refStatus.discountType) {
        if (refStatus.discountType === 'percentage') {
            discountAmount = (originalFee * refStatus.value) / 100;
        } else {
            discountAmount = refStatus.value;
        }
    }
    const finalFee = Math.max(0, originalFee - discountAmount);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/programs/${program.id}/register`);
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-4 px-4">
            <Head title="Program Registration" />

            <div className="mb-6 flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 cursor-pointer">
                    <a href="/dashboard">
                        <ArrowLeft className="size-4" />
                    </a>
                </Button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                        PT Program Enrollment
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Enroll your laboratory in the selected proficiency testing scheme
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3 items-start">
                
                {/* Left Column: Form Details (Span 2) */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    
                    {/* Program Information Card */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs">
                        <div className="flex items-center gap-3 border-b pb-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Layers className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">PT Scheme Details</h3>
                                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{program.program_code}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-base text-foreground">{program.program_name}</h4>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                <div>
                                    Discipline: <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-sm">{program.discipline}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parameters & Quantity Card */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <ShoppingBag className="size-5" />
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Parameters & Quantity</h3>
                        </div>

                        {/* Test Parameters Checkbox List */}
                        <div className="grid gap-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Test Parameters to Register</Label>
                            <div className="grid gap-2 mt-1 sm:grid-cols-2 max-h-48 overflow-y-auto pr-1">
                                {program.parameters.map((p, idx) => {
                                    const isChecked = form.data.parameters.includes(p);
                                    return (
                                        <label key={idx} className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                                            isChecked 
                                                ? 'bg-primary/5 border-primary text-primary' 
                                                : 'hover:bg-muted/10 border-input'
                                        }`}>
                                            <input 
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => handleParameterChange(p, e.target.checked)}
                                                className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
                                            />
                                            <span className="text-xs font-medium">{p}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <InputError message={form.errors.parameters} />
                        </div>

                        {/* Sample Quantity Select */}
                        <div className="grid gap-2 pt-2">
                            <Label htmlFor="sample_quantity" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sample Quantity</Label>
                            <select
                                id="sample_quantity"
                                value={form.data.sample_quantity}
                                onChange={(e) => form.setData('sample_quantity', Number(e.target.value))}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-10 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-foreground cursor-pointer"
                            >
                                {[1, 2, 3, 4, 5].map((q) => (
                                    <option key={q} value={q} className="bg-popover text-foreground">
                                        {q} {q === 1 ? 'Sample set' : 'Sample sets'}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.sample_quantity} />
                        </div>
                    </div>

                    {/* Shipping & Billing Address Card */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Truck className="size-5" />
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Shipping & Billing</h3>
                        </div>

                        {/* Shipping Address */}
                        <div className="grid gap-2">
                            <Label htmlFor="shipping_address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipping Address</Label>
                            <textarea
                                id="shipping_address"
                                required
                                value={form.data.shipping_address}
                                onChange={(e) => form.setData('shipping_address', e.target.value)}
                                rows={3}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-foreground resize-none"
                            />
                            <InputError message={form.errors.shipping_address} />
                        </div>

                        {/* Checkbox same address */}
                        <label className="flex items-center gap-2 text-xs cursor-pointer select-none py-1">
                            <input 
                                type="checkbox"
                                checked={sameAddress}
                                onChange={(e) => setSameAddress(e.target.checked)}
                                className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
                            />
                            <span className="text-muted-foreground">Billing address is same as shipping address</span>
                        </label>

                        {/* Billing Address */}
                        {!sameAddress && (
                            <div className="grid gap-2">
                                <Label htmlFor="billing_address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Billing Address</Label>
                                <textarea
                                    id="billing_address"
                                    required
                                    value={form.data.billing_address}
                                    onChange={(e) => form.setData('billing_address', e.target.value)}
                                    rows={3}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-foreground resize-none"
                                />
                                <InputError message={form.errors.billing_address} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Checkout Summary (Span 1) */}
                <div className="flex flex-col gap-6">
                    
                    {/* Referral & Promo Card */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex flex-col gap-3">
                        <div className="flex items-center gap-2 border-b pb-2.5 mb-1">
                            <Ticket className="size-4.5 text-primary" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Apply Promo Code</h3>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Referral Code"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                                className="h-9 text-xs font-mono uppercase tracking-wider"
                                disabled={refStatus.valid === true}
                            />
                            <Button 
                                type="button" 
                                size="sm" 
                                onClick={handleValidateReferral} 
                                className="h-9 cursor-pointer text-xs"
                                disabled={validatingRef || !referralCode.trim() || refStatus.valid === true}
                            >
                                {validatingRef ? <Spinner size="sm" /> : 'Apply'}
                            </Button>
                        </div>

                        {/* Promo application status feedback */}
                        {refStatus.valid !== null && (
                            <div className={`text-[10px] font-medium p-2.5 rounded-md border flex items-start gap-1.5 mt-1 ${
                                refStatus.valid 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                    : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}>
                                {refStatus.valid ? (
                                    <>
                                        <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{refStatus.message}</span>
                                    </>
                                ) : (
                                    <>
                                        <X className="size-3.5 text-destructive shrink-0 mt-0.5" />
                                        <span>{refStatus.message}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Order / Fee Summary Card */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b pb-2.5">
                            <CreditCard className="size-4.5 text-primary" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Payment Summary</h3>
                        </div>

                        <div className="grid gap-2.5 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                                <span>PT Registration Fee:</span>
                                <span className="font-semibold text-foreground">
                                    ₹{originalFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Discount Applied:</span>
                                    <span>
                                        - ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            <div className="border-t pt-3 flex justify-between font-bold text-sm text-foreground">
                                <span>Total Amount:</span>
                                <span>
                                    ₹{finalFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={form.processing || form.data.parameters.length === 0} 
                            className="w-full cursor-pointer h-10 font-bold bg-primary hover:bg-primary/95 shadow-md transition-all hover:scale-[1.01]"
                        >
                            {form.processing && <Spinner className="mr-2" />}
                            Confirm & Pay
                        </Button>

                        {form.data.parameters.length === 0 && (
                            <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                                <AlertCircle className="size-3 text-amber-500" /> Choose at least 1 parameter to proceed
                            </p>
                        )}
                    </div>
                </div>

            </form>
        </div>
    );
}

Register.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Registration',
            href: '#',
        },
    ],
};
