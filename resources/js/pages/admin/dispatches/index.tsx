import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Truck, Layers, Calendar, CheckCircle2, Search, ArrowRight, 
    QrCode, Package, User, Building, MapPin, ExternalLink, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

type Laboratory = {
    id: number;
    lab_name: string;
    contact_person: string;
    address: string;
    city: string;
    state: string;
    pin_code: string;
    user?: {
        username: string;
    };
};

type PtProgram = {
    id: number;
    program_code: string;
    program_name: string;
    discipline: string;
};

type Sample = {
    id: number;
    sample_id: string;
    qr_code_path: string;
    status: 'prepared' | 'dispatched' | 'delivered';
    courier_partner: string | null;
    tracking_number: string | null;
    dispatched_at: string | null;
};

type Registration = {
    id: number;
    registration_number: string;
    payment_status: 'pending' | 'paid' | 'failed';
    amount_paid: number;
    status: 'registered' | 'sample_dispatched' | 'submitted' | 'report_released';
    created_at: string;
    laboratory: Laboratory;
    pt_program: PtProgram;
    sample: Sample | null;
};

type Props = {
    registrations: Registration[];
};

export default function Dispatches({ registrations }: Props) {
    const [search, setSearch] = useState('');
    const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
    const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

    const dispatchForm = useForm({
        courier_partner: '',
        tracking_number: '',
    });

    const filteredRegistrations = registrations.filter((reg) => {
        const query = search.toLowerCase();
        return (
            reg.registration_number.toLowerCase().includes(query) ||
            reg.laboratory.lab_name.toLowerCase().includes(query) ||
            reg.pt_program.program_name.toLowerCase().includes(query) ||
            reg.pt_program.program_code.toLowerCase().includes(query) ||
            (reg.sample && reg.sample.sample_id.toLowerCase().includes(query))
        );
    });

    const handlePrepareSample = (regId: number) => {
        router.post(`/admin/registrations/${regId}/prepare-sample`, {}, {
            preserveScroll: true,
        });
    };

    const openDispatchModal = (sample: Sample) => {
        setSelectedSample(sample);
        dispatchForm.setData({
            courier_partner: '',
            tracking_number: '',
        });
        setIsDispatchModalOpen(true);
    };

    const handleDispatchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSample) return;

        dispatchForm.post(`/admin/samples/${selectedSample.id}/dispatch`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDispatchModalOpen(false);
            }
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="flex-1 flex flex-col gap-6 p-6">
            <Head title="PT Dispatches Management" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        PT Sample Dispatches
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Assign sample IDs, generate QR codes, and log courier tracking details for paid registrations.
                    </p>
                </div>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Registration, Lab, Code, Sample ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 text-sm"
                    />
                </div>
            </div>

            {/* Dispatches List */}
            <div className="border border-sidebar-border/70 rounded-xl bg-card text-card-foreground shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="p-4">Registration & Laboratory</th>
                                <th className="p-4">PT Program Scheme</th>
                                <th className="p-4">Sample Assignment</th>
                                <th className="p-4">Shipping Tracking</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70">
                            {filteredRegistrations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No paid registrations found matching filter query.
                                    </td>
                                </tr>
                            ) : (
                                filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-muted/10 transition-colors">
                                        {/* Registration & Laboratory */}
                                        <td className="p-4 align-top">
                                            <div className="font-bold text-foreground">{reg.laboratory.lab_name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                                <Building className="size-3" />
                                                <span>Lab ID: {reg.laboratory.user?.username || 'N/A'}</span>
                                            </div>
                                            <div className="text-[10px] font-mono text-muted-foreground mt-1.5 bg-muted/60 border w-fit px-1.5 py-0.5 rounded-sm">
                                                Ref No: {reg.registration_number}
                                            </div>
                                        </td>

                                        {/* PT Program Scheme */}
                                        <td className="p-4 align-top">
                                            <div className="font-semibold text-foreground text-xs">{reg.pt_program.program_name}</div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{reg.pt_program.program_code}</div>
                                            <div className="text-[9px] font-medium text-primary mt-1.5 uppercase bg-primary/5 px-2 py-0.5 rounded-sm border border-primary/10 w-fit">
                                                {reg.pt_program.discipline}
                                            </div>
                                        </td>

                                        {/* Sample Assignment */}
                                        <td className="p-4 align-top">
                                            {reg.sample ? (
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-mono font-bold text-xs text-foreground bg-primary/5 border border-primary/15 px-2 py-0.5 rounded-sm flex items-center gap-1.5 w-fit">
                                                        <Package className="size-3 text-primary" /> {reg.sample.sample_id}
                                                    </span>
                                                    {reg.sample.qr_code_path && (
                                                        <a 
                                                            href={reg.sample.qr_code_path} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-[10px] text-primary hover:underline flex items-center gap-1 w-fit"
                                                        >
                                                            <QrCode className="size-3" /> View QR Code <ExternalLink className="size-2.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                                                    Not Assigned
                                                </span>
                                            )}
                                        </td>

                                        {/* Shipping Tracking */}
                                        <td className="p-4 align-top">
                                            {reg.sample ? (
                                                reg.sample.status === 'dispatched' ? (
                                                    <div className="text-xs flex flex-col gap-1">
                                                        <div className="flex items-center gap-1 text-emerald-600 font-semibold dark:text-emerald-400">
                                                            <CheckCircle2 className="size-3.5" /> Dispatched
                                                        </div>
                                                        <div className="text-[11px] text-foreground font-medium">
                                                            {reg.sample.courier_partner} ({reg.sample.tracking_number})
                                                        </div>
                                                        <div className="text-[9px] text-muted-foreground">
                                                            Date: {formatDate(reg.sample.dispatched_at || '')}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-sm w-fit block">
                                                        Ready for Dispatch
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-xs text-muted-foreground/60">—</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right align-middle">
                                            {!reg.sample ? (
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handlePrepareSample(reg.id)}
                                                    className="cursor-pointer text-xs h-8"
                                                >
                                                    Prepare Sample
                                                </Button>
                                            ) : reg.sample.status === 'prepared' ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    onClick={() => openDispatchModal(reg.sample!)}
                                                    className="cursor-pointer text-xs h-8"
                                                >
                                                    <Truck className="mr-1.5 size-3.5" /> Ship Sample
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground font-medium pr-2">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ship / Dispatch Sample Modal Dialog */}
            <Dialog open={isDispatchModalOpen} onOpenChange={setIsDispatchModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Dispatch Sample Shipment</DialogTitle>
                        <DialogDescription className="text-xs">
                            Enter the courier coordinates below to complete the dispatch for Sample ID: <strong className="font-mono text-foreground">{selectedSample?.sample_id}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDispatchSubmit}>
                        <div className="grid gap-4 py-4 text-sm">
                            <div className="grid gap-2">
                                <Label htmlFor="courier_partner">Courier Partner</Label>
                                <Input
                                    id="courier_partner"
                                    required
                                    value={dispatchForm.data.courier_partner}
                                    onChange={(e) => dispatchForm.setData('courier_partner', e.target.value)}
                                    placeholder="e.g. DHL Express, FedEx, Delhivery"
                                    className="h-9"
                                />
                                <InputError message={dispatchForm.errors.courier_partner} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tracking_number">Airway Bill / Tracking Number</Label>
                                <Input
                                    id="tracking_number"
                                    required
                                    value={dispatchForm.data.tracking_number}
                                    onChange={(e) => dispatchForm.setData('tracking_number', e.target.value)}
                                    placeholder="e.g. AWB10029302"
                                    className="h-9"
                                />
                                <InputError message={dispatchForm.errors.tracking_number} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsDispatchModalOpen(false)}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={dispatchForm.processing}
                                className="cursor-pointer"
                            >
                                {dispatchForm.processing && <Spinner className="mr-2" />}
                                Complete Dispatch
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Dispatches.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Sample Dispatches',
            href: '#',
        },
    ],
};
