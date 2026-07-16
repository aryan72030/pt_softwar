import { Head, router } from '@inertiajs/react';
import { Download, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

 type User = {
    id: number;
    name: string;
    email: string;
    username: string;
};

type Registration = {
    id: number;
    payment_status: string;
    status: string;
    amount_paid: number;
    pt_program?: {
        program_name: string;
    };
};

type Participant = {
    id: number;
    lab_name: string;
    contact_person: string;
    mobile: string;
    city: string;
    state: string;
    user: User;
    registrations: Registration[];
};

type Props = {
    participants: Participant[];
    filters: {
        search?: string;
        status?: string;
        payment_status?: string;
    };
};

export default function ParticipantsIndex({ participants, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status ?? '');

    const applyFilters = () => {
        router.get('/admin/participants', {
            search: search || undefined,
            status: status || undefined,
            payment_status: paymentStatus || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setPaymentStatus('');
        router.get('/admin/participants');
    };

    const exportParticipants = () => {
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (status) query.set('status', status);
        if (paymentStatus) query.set('payment_status', paymentStatus);
        window.location.href = `/admin/participants/export?${query.toString()}`;
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <Head title="Participant Management" />

            <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                        <Users className="size-6 text-primary" /> Participant Management
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Search laboratories, review registrations, and export the participant master sheet.
                    </p>
                </div>
                <Button onClick={exportParticipants} variant="outline" className="w-full cursor-pointer lg:w-auto">
                    <Download className="mr-2 size-4" /> Export
                </Button>
            </div>

            <div className="grid gap-3 rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-xs lg:grid-cols-[1fr_180px_180px_auto_auto]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search lab, contact, email, username"
                        className="pl-9"
                    />
                </div>
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="border-input dark:bg-input/30 flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <option value="">All statuses</option>
                    <option value="registered">Registered</option>
                    <option value="sample_dispatched">Sample Dispatched</option>
                    <option value="submitted">Submitted</option>
                    <option value="report_released">Report Released</option>
                </select>
                <select
                    value={paymentStatus}
                    onChange={(event) => setPaymentStatus(event.target.value)}
                    className="border-input dark:bg-input/30 flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <option value="">All payments</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                </select>
                <Button onClick={applyFilters} className="cursor-pointer">Apply</Button>
                <Button onClick={resetFilters} variant="outline" className="cursor-pointer">Reset</Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="p-4">Participant</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Registrations</th>
                                <th className="p-4">Paid Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70">
                            {participants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">No participants found.</td>
                                </tr>
                            ) : participants.map((participant) => {
                                const paidAmount = participant.registrations
                                    .filter((registration) => registration.payment_status === 'paid')
                                    .reduce((total, registration) => total + Number(registration.amount_paid), 0);

                                return (
                                    <tr key={participant.id} className="transition-colors hover:bg-muted/10">
                                        <td className="p-4">
                                            <div className="font-semibold text-foreground">{participant.lab_name}</div>
                                            <div className="mt-0.5 font-mono text-xs text-muted-foreground">{participant.user?.username}</div>
                                        </td>
                                        <td className="p-4 text-xs">
                                            <div className="font-medium text-foreground">{participant.contact_person}</div>
                                            <div className="text-muted-foreground">{participant.user?.email}</div>
                                            <div className="text-muted-foreground">{participant.mobile}</div>
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground">{participant.city}, {participant.state}</td>
                                        <td className="p-4 text-xs">
                                            <span className="rounded-full border bg-muted px-2 py-1 font-semibold text-foreground">
                                                {participant.registrations.length}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold text-foreground">
                                            INR {paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

ParticipantsIndex.layout = {
    breadcrumbs: [
        { title: 'Participants', href: '/admin/participants' },
    ],
};
