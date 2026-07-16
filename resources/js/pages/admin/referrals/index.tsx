import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Ticket, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

 type Participant = {
    id: number;
    name: string;
    email: string;
    username: string;
};

type ReferralCode = {
    id: number;
    code: string;
    discount_type: 'percentage' | 'fixed';
    value: number;
    client_specific_id: number | null;
    expiry_date: string;
    is_one_time: boolean;
    used_count: number;
    client_specific?: Participant | null;
};

type Props = {
    referralCodes: ReferralCode[];
    participants: Participant[];
};

const emptyForm = {
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    value: 5,
    client_specific_id: '',
    expiry_date: '',
    is_one_time: true,
};

export default function ReferralIndex({ referralCodes, participants }: Props) {
    const [editingCode, setEditingCode] = useState<ReferralCode | null>(null);

    const form = useForm(emptyForm);

    const resetForm = () => {
        setEditingCode(null);
        form.clearErrors();
        form.setData(emptyForm);
    };

    const editCode = (referralCode: ReferralCode) => {
        setEditingCode(referralCode);
        form.clearErrors();
        form.setData({
            code: referralCode.code,
            discount_type: referralCode.discount_type,
            value: Number(referralCode.value),
            client_specific_id: referralCode.client_specific_id ? String(referralCode.client_specific_id) : '',
            expiry_date: referralCode.expiry_date.split('T')[0],
            is_one_time: referralCode.is_one_time,
        });
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        const payload = {
            ...form.data,
            client_specific_id: form.data.client_specific_id || null,
            code: form.data.code.trim().toUpperCase(),
        };

        if (editingCode) {
            router.put(`/admin/referrals/${editingCode.id}`, payload, {
                onSuccess: resetForm,
            });
            return;
        }

        router.post('/admin/referrals', payload, {
            onSuccess: resetForm,
        });
    };

    const deleteCode = (referralCode: ReferralCode) => {
        if (confirm(`Delete referral code ${referralCode.code}?`)) {
            router.delete(`/admin/referrals/${referralCode.id}`);
        }
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="flex flex-col gap-6 p-6">
            <Head title="Referral Codes" />

            <div className="border-b pb-5">
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                    <Ticket className="size-6 text-primary" /> Referral Codes
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create one-time, client-specific, percentage, or fixed discount codes for PT registration.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                <form onSubmit={submit} className="grid gap-4 rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between border-b pb-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                            {editingCode ? 'Edit Code' : 'Create Code'}
                        </h2>
                        {editingCode && (
                            <Button type="button" variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 cursor-pointer">
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="code">Code</Label>
                        <Input
                            id="code"
                            value={form.data.code}
                            onChange={(event) => form.setData('code', event.target.value.toUpperCase())}
                            placeholder="PT10"
                            className="font-mono uppercase"
                            required
                        />
                        <InputError message={form.errors.code} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="discount_type">Discount Type</Label>
                            <select
                                id="discount_type"
                                value={form.data.discount_type}
                                onChange={(event) => form.setData('discount_type', event.target.value as 'percentage' | 'fixed')}
                                className="border-input dark:bg-input/30 flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                            <InputError message={form.errors.discount_type} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="value">Value</Label>
                            <Input
                                id="value"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.data.value}
                                onChange={(event) => form.setData('value', Number(event.target.value))}
                                required
                            />
                            <InputError message={form.errors.value} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="client_specific_id">Client Specific</Label>
                        <select
                            id="client_specific_id"
                            value={form.data.client_specific_id}
                            onChange={(event) => form.setData('client_specific_id', event.target.value)}
                            className="border-input dark:bg-input/30 flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                            <option value="">Any participant</option>
                            {participants.map((participant) => (
                                <option key={participant.id} value={participant.id}>
                                    {participant.username} - {participant.name || participant.email}
                                </option>
                            ))}
                        </select>
                        <InputError message={form.errors.client_specific_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="expiry_date">Expiry Date</Label>
                        <Input
                            id="expiry_date"
                            type="date"
                            value={form.data.expiry_date}
                            onChange={(event) => form.setData('expiry_date', event.target.value)}
                            required
                        />
                        <InputError message={form.errors.expiry_date} />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={form.data.is_one_time}
                            onChange={(event) => form.setData('is_one_time', event.target.checked)}
                            className="size-4 rounded border-input text-primary"
                        />
                        One-time use only
                    </label>
                    <InputError message={form.errors.is_one_time} />

                    <Button type="submit" disabled={form.processing} className="cursor-pointer">
                        {form.processing && <Spinner className="mr-2" />}
                        <Plus className="mr-2 size-4" /> {editingCode ? 'Save Changes' : 'Create Referral Code'}
                    </Button>
                </form>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <th className="p-4">Code</th>
                                    <th className="p-4">Discount</th>
                                    <th className="p-4">Rules</th>
                                    <th className="p-4">Expiry</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {referralCodes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No referral codes found.</td>
                                    </tr>
                                ) : referralCodes.map((referralCode) => (
                                    <tr key={referralCode.id} className="transition-colors hover:bg-muted/10">
                                        <td className="p-4">
                                            <div className="font-mono font-bold text-foreground">{referralCode.code}</div>
                                            <div className="mt-0.5 text-xs text-muted-foreground">Used {referralCode.used_count} time(s)</div>
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-foreground">
                                            {referralCode.discount_type === 'percentage'
                                                ? `${Number(referralCode.value)}%`
                                                : `INR ${Number(referralCode.value).toLocaleString('en-IN')}`}
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground">
                                            <div>{referralCode.is_one_time ? 'One-time' : 'Multi-use'}</div>
                                            <div>{referralCode.client_specific ? referralCode.client_specific.username : 'Any participant'}</div>
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground">{formatDate(referralCode.expiry_date)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => editCode(referralCode)} className="h-8 w-8 cursor-pointer">
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => deleteCode(referralCode)} className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive">
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

ReferralIndex.layout = {
    breadcrumbs: [
        { title: 'Referral Codes', href: '/admin/referrals' },
    ],
};
