import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Search, Edit, Calendar, FileText, CheckCircle2, 
    ArrowRight, Info, HelpCircle, Download, ExternalLink, Package, Building
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
    user?: {
        username: string;
    };
};

type PtProgram = {
    id: number;
    program_code: string;
    program_name: string;
};

type Sample = {
    sample_id: string;
};

type Registration = {
    id: number;
    registration_number: string;
    laboratory: Laboratory;
    pt_program: PtProgram;
    sample: Sample | null;
};

type Observation = {
    id: number;
    program_registration_id: number;
    parameter_name: string;
    test_method: string;
    result: string;
    unit: string;
    remarks: string | null;
    supporting_file_path: string | null;
    submitted_at: string;
    registration: Registration;
};

type Props = {
    observations: Observation[];
};

export default function ObservationsIndex({ observations }: Props) {
    const [search, setSearch] = useState('');
    const [selectedObs, setSelectedObs] = useState<Observation | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const editForm = useForm({
        test_method: '',
        result: '',
        unit: '',
        remarks: '',
    });

    const filteredObservations = observations.filter((obs) => {
        const query = search.toLowerCase();
        return (
            obs.parameter_name.toLowerCase().includes(query) ||
            obs.test_method.toLowerCase().includes(query) ||
            obs.result.toLowerCase().includes(query) ||
            obs.registration.registration_number.toLowerCase().includes(query) ||
            obs.registration.laboratory.lab_name.toLowerCase().includes(query) ||
            (obs.registration.sample && obs.registration.sample.sample_id.toLowerCase().includes(query))
        );
    });

    const openEditModal = (obs: Observation) => {
        setSelectedObs(obs);
        editForm.setData({
            test_method: obs.test_method,
            result: obs.result,
            unit: obs.unit,
            remarks: obs.remarks || '',
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedObs) return;

        editForm.put(`/admin/observations/${selectedObs.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
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
            <Head title="Observations Management" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        PT Observations Central Registry
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        View, search, audit, and adjust raw parameter values submitted by laboratories.
                    </p>
                </div>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search parameter, laboratory, sample, method..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 text-sm"
                    />
                </div>
            </div>

            {/* Observations list table */}
            <div className="border border-sidebar-border/70 rounded-xl bg-card text-card-foreground shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="p-4">Lab / Registration</th>
                                <th className="p-4">Sample / Scheme</th>
                                <th className="p-4">Parameter details</th>
                                <th className="p-4">Report</th>
                                <th className="p-4">Submission Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70">
                            {filteredObservations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No observation sheets found matching filter query.
                                    </td>
                                </tr>
                            ) : (
                                filteredObservations.map((obs) => (
                                    <tr key={obs.id} className="hover:bg-muted/10 transition-colors">
                                        
                                        {/* Lab / Registration */}
                                        <td className="p-4 align-top">
                                            <div className="font-bold text-foreground">{obs.registration.laboratory.lab_name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                                <Building className="size-3" />
                                                <span>Lab ID: {obs.registration.laboratory.user?.username || 'N/A'}</span>
                                            </div>
                                            <div className="text-[10px] font-mono text-muted-foreground mt-1.5 bg-muted/60 border w-fit px-1.5 py-0.5 rounded-sm">
                                                Reg No: {obs.registration.registration_number}
                                            </div>
                                        </td>

                                        {/* Sample / Scheme */}
                                        <td className="p-4 align-top">
                                            <span className="font-mono font-bold text-xs text-foreground bg-primary/5 border border-primary/15 px-2 py-0.5 rounded-sm flex items-center gap-1.5 w-fit">
                                                <Package className="size-3 text-primary" /> {obs.registration.sample?.sample_id || 'N/A'}
                                            </span>
                                            <div className="font-semibold text-foreground text-xs mt-2 line-clamp-1">
                                                {obs.registration.pt_program.program_name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                                {obs.registration.pt_program.program_code}
                                            </div>
                                        </td>

                                        {/* Parameter Details */}
                                        <td className="p-4 align-top">
                                            <div className="text-xs">
                                                Parameter: <strong className="text-foreground">{obs.parameter_name}</strong>
                                            </div>
                                            <div className="text-xs mt-1 text-muted-foreground">
                                                Method: <span className="font-medium text-foreground">{obs.test_method}</span>
                                            </div>
                                            <div className="text-xs mt-1 text-muted-foreground">
                                                Value: <strong className="text-primary">{obs.result}</strong> {obs.unit}
                                            </div>
                                            {obs.remarks && (
                                                <p className="text-[10px] text-muted-foreground mt-1.5 italic bg-muted/30 p-1.5 rounded-md border max-w-xs">
                                                    "{obs.remarks}"
                                                </p>
                                            )}
                                        </td>

                                        {/* Report File attachment */}
                                        <td className="p-4 align-top">
                                            {obs.supporting_file_path ? (
                                                <a
                                                    href={`/storage/${obs.supporting_file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded border border-primary/10 w-fit"
                                                >
                                                    <Download className="size-3.5" /> View Report
                                                </a>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/60">No Attachment</span>
                                            )}
                                        </td>

                                        {/* Submission Date */}
                                        <td className="p-4 align-top text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="size-3 text-muted-foreground" />
                                                <span>{formatDate(obs.submitted_at)}</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right align-middle">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditModal(obs)}
                                                className="cursor-pointer text-xs h-8"
                                            >
                                                <Edit className="mr-1.5 size-3.5" /> Edit
                                            </Button>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Observation Modal Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Edit Observation Value</DialogTitle>
                        <DialogDescription className="text-xs">
                            Adjust the submitted values for parameter: <strong className="text-foreground">{selectedObs?.parameter_name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit}>
                        <div className="grid gap-4 py-4 text-sm">
                            <div className="grid gap-2">
                                <Label htmlFor="test_method">Test Method</Label>
                                <Input
                                    id="test_method"
                                    required
                                    value={editForm.data.test_method}
                                    onChange={(e) => editForm.setData('test_method', e.target.value)}
                                    className="h-9"
                                />
                                <InputError message={editForm.errors.test_method} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="result">Result Value</Label>
                                    <Input
                                        id="result"
                                        required
                                        value={editForm.data.result}
                                        onChange={(e) => editForm.setData('result', e.target.value)}
                                        className="h-9"
                                    />
                                    <InputError message={editForm.errors.result} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="unit">Unit</Label>
                                    <Input
                                        id="unit"
                                        required
                                        value={editForm.data.unit}
                                        onChange={(e) => editForm.setData('unit', e.target.value)}
                                        className="h-9"
                                    />
                                    <InputError message={editForm.errors.unit} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <textarea
                                    id="remarks"
                                    value={editForm.data.remarks}
                                    onChange={(e) => editForm.setData('remarks', e.target.value)}
                                    rows={3}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-foreground resize-none"
                                />
                                <InputError message={editForm.errors.remarks} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="cursor-pointer"
                            >
                                {editForm.processing && <Spinner className="mr-2" />}
                                Save Adjustments
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}

ObservationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Observations',
            href: '#',
        },
    ],
};
