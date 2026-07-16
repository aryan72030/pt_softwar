import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Plus, Edit, Trash2, Calendar, Layers, DollarSign, ListFilter, 
    MoreHorizontal, Check, X, FileSpreadsheet, Settings2, FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { admin } from '@/routes';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

type PtPlan = {
    id: number;
    program_number: string;
    material: string;
    assigned_coordinator: string;
};

type Program = {
    id: number;
    program_code: string;
    program_name: string;
    discipline: string;
    parameters: string[];
    reg_start_date: string;
    reg_end_date: string;
    dispatch_date: string;
    submission_deadline: string;
    report_release_date: string;
    fee: number;
    status: 'open' | 'active' | 'closed' | 'completed';
    pt_plan?: PtPlan | null;
};

type Props = {
    programs: Program[];
};

export default function Index({ programs }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [parameters, setParameters] = useState<string[]>(['']);

    const form = useForm({
        program_code: '',
        program_name: '',
        discipline: '',
        parameters: [] as string[],
        reg_start_date: '',
        reg_end_date: '',
        dispatch_date: '',
        submission_deadline: '',
        report_release_date: '',
        fee: 0,
        status: 'open' as 'open' | 'active' | 'closed' | 'completed',
    });

    const handleAddParameter = () => {
        setParameters([...parameters, '']);
    };

    const handleRemoveParameter = (index: number) => {
        const updated = parameters.filter((_, i) => i !== index);
        setParameters(updated.length > 0 ? updated : ['']);
    };

    const handleParameterChange = (index: number, value: string) => {
        const updated = [...parameters];
        updated[index] = value;
        setParameters(updated);
    };

    const openCreateModal = () => {
        form.reset();
        setParameters(['']);
        setIsCreateOpen(true);
    };

    const openEditModal = (program: Program) => {
        setSelectedProgram(program);
        form.setData({
            program_code: program.program_code,
            program_name: program.program_name,
            discipline: program.discipline,
            parameters: program.parameters,
            reg_start_date: program.reg_start_date.split('T')[0],
            reg_end_date: program.reg_end_date.split('T')[0],
            dispatch_date: program.dispatch_date.split('T')[0],
            submission_deadline: program.submission_deadline.split('T')[0],
            report_release_date: program.report_release_date.split('T')[0],
            fee: Number(program.fee),
            status: program.status,
        });
        setParameters(program.parameters);
        setIsEditOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const filteredParams = parameters.filter(p => p.trim() !== '');
        form.setData('parameters', filteredParams);
        
        // Wait for state sync and submit
        form.post('/admin/programs', {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProgram) return;
        const filteredParams = parameters.filter(p => p.trim() !== '');
        form.setData('parameters', filteredParams);

        form.put(`/admin/programs/${selectedProgram.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedProgram(null);
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this PT Program?')) {
            form.delete(`/admin/programs/${id}`);
        }
    };

    const handleCloseProgram = (program: Program) => {
        if (confirm('Are you sure you want to close registrations for this PT Program?')) {
            router.put(`/admin/programs/${program.id}`, {
                program_code: program.program_code,
                program_name: program.program_name,
                discipline: program.discipline,
                parameters: program.parameters,
                reg_start_date: program.reg_start_date.split('T')[0],
                reg_end_date: program.reg_end_date.split('T')[0],
                dispatch_date: program.dispatch_date.split('T')[0],
                submission_deadline: program.submission_deadline.split('T')[0],
                report_release_date: program.report_release_date.split('T')[0],
                fee: Number(program.fee),
                status: 'closed',
            });
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'active':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'closed':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'completed':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <Head title="PT Program Management" />

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Layers className="size-6 text-primary" /> PT Program Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configure disciplines, test parameters, schedules, and active registration windows for proficiency testing.
                    </p>
                </div>
                <Button onClick={openCreateModal} className="w-full sm:w-auto cursor-pointer">
                    <Plus className="mr-2 size-4" /> Create PT Program
                </Button>
            </div>

            {/* Program list table */}
            <div className="border border-sidebar-border/70 rounded-xl bg-card text-card-foreground shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="p-4">Code / Name</th>
                                <th className="p-4">Discipline</th>
                                <th className="p-4">Parameters</th>
                                <th className="p-4">Registration Window</th>
                                <th className="p-4">Fee</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70">
                            {programs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                        No PT Programs found. Click "Create PT Program" to add your first scheme.
                                    </td>
                                </tr>
                            ) : (
                                programs.map((program) => (
                                    <tr key={program.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-foreground">{program.program_name}</div>
                                            <div className="text-xs font-mono text-muted-foreground mt-0.5">{program.program_code}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs bg-muted border px-2 py-0.5 rounded-full font-medium">
                                                {program.discipline}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {program.parameters.map((p, idx) => (
                                                    <span key={idx} className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded-sm">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs">
                                            <div className="flex items-center gap-1.5 text-foreground">
                                                <Calendar className="size-3 text-muted-foreground" />
                                                <span>{formatDate(program.reg_start_date)} - {formatDate(program.reg_end_date)}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                Deadline: {formatDate(program.submission_deadline)}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-foreground">
                                            ₹{Number(program.fee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded-full ${getStatusStyles(program.status)}`}>
                                                {program.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem onClick={() => openEditModal(program)} className="cursor-pointer">
                                                        <Edit className="mr-2 size-3.5" /> Edit Program
                                                    </DropdownMenuItem>
                                                    {!program.pt_plan ? (
                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                            <Link href={`/admin/programs/${program.id}/pt-plan/create`}>
                                                                <FileSpreadsheet className="mr-2 size-3.5" /> Generate PT Plan
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem disabled className="text-muted-foreground">
                                                            <Check className="mr-2 size-3.5" /> PT Plan: {program.pt_plan.program_number}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {program.status !== 'closed' && program.status !== 'completed' && (
                                                        <DropdownMenuItem onClick={() => handleCloseProgram(program)} className="cursor-pointer text-amber-600 focus:text-amber-600">
                                                            <X className="mr-2 size-3.5" /> Close Program
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDelete(program.id)} className="cursor-pointer text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 size-3.5" /> Delete Program
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create PT Program Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create PT Program</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="program_code">Program Code</Label>
                                <Input
                                    id="program_code"
                                    required
                                    value={form.data.program_code}
                                    onChange={(e) => form.setData('program_code', e.target.value)}
                                    placeholder="PT-CHEM-2026-01"
                                />
                                <InputError message={form.errors.program_code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="program_name">Program Name</Label>
                                <Input
                                    id="program_name"
                                    required
                                    value={form.data.program_name}
                                    onChange={(e) => form.setData('program_name', e.target.value)}
                                    placeholder="Chemical Testing of Soil"
                                />
                                <InputError message={form.errors.program_name} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="discipline">Discipline</Label>
                                <select
                                    id="discipline"
                                    required
                                    value={form.data.discipline}
                                    onChange={(e) => form.setData('discipline', e.target.value)}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-foreground cursor-pointer"
                                >
                                    <option value="">Select Discipline</option>
                                    <option value="Chemical">Chemical</option>
                                    <option value="Biological">Biological</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Medical">Medical</option>
                                </select>
                                <InputError message={form.errors.discipline} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fee">Program Fee (INR)</Label>
                                <Input
                                    id="fee"
                                    type="number"
                                    required
                                    min={0}
                                    value={form.data.fee}
                                    onChange={(e) => form.setData('fee', Number(e.target.value))}
                                    placeholder="5000"
                                />
                                <InputError message={form.errors.fee} />
                            </div>
                        </div>

                        {/* Test Parameters Dynamic Builder */}
                        <div className="grid gap-2 border-y py-3">
                            <div className="flex items-center justify-between">
                                <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Test Parameters</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddParameter} className="h-7 cursor-pointer text-xs">
                                    <Plus className="mr-1 size-3" /> Add Parameter
                                </Button>
                            </div>
                            <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
                                {parameters.map((param, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            required
                                            value={param}
                                            onChange={(e) => handleParameterChange(index, e.target.value)}
                                            placeholder={`Parameter #${index + 1} (e.g. pH, Lead)`}
                                            className="h-8 text-xs"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveParameter(index)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <InputError message={form.errors.parameters} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reg_start_date">Registration Start Date</Label>
                                <Input
                                    id="reg_start_date"
                                    type="date"
                                    required
                                    value={form.data.reg_start_date}
                                    onChange={(e) => form.setData('reg_start_date', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.reg_start_date} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reg_end_date">Registration End Date</Label>
                                <Input
                                    id="reg_end_date"
                                    type="date"
                                    required
                                    value={form.data.reg_end_date}
                                    onChange={(e) => form.setData('reg_end_date', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.reg_end_date} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dispatch_date">Dispatch Date</Label>
                                <Input
                                    id="dispatch_date"
                                    type="date"
                                    required
                                    value={form.data.dispatch_date}
                                    onChange={(e) => form.setData('dispatch_date', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.dispatch_date} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="submission_deadline">Deadline</Label>
                                <Input
                                    id="submission_deadline"
                                    type="date"
                                    required
                                    value={form.data.submission_deadline}
                                    onChange={(e) => form.setData('submission_deadline', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.submission_deadline} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="report_release_date">Report Date</Label>
                                <Input
                                    id="report_release_date"
                                    type="date"
                                    required
                                    value={form.data.report_release_date}
                                    onChange={(e) => form.setData('report_release_date', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.report_release_date} />
                            </div>
                        </div>

                        {/* Status omitted to match PDF */}

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="cursor-pointer">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing} className="cursor-pointer">
                                {form.processing && <Spinner className="mr-2" />} Create Program
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit PT Program Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit PT Program</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_program_code">Program Code</Label>
                                <Input
                                    id="edit_program_code"
                                    required
                                    value={form.data.program_code}
                                    onChange={(e) => form.setData('program_code', e.target.value)}
                                    placeholder="PT-CHEM-2026-01"
                                />
                                <InputError message={form.errors.program_code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_program_name">Program Name</Label>
                                <Input
                                    id="edit_program_name"
                                    required
                                    value={form.data.program_name}
                                    onChange={(e) => form.setData('program_name', e.target.value)}
                                    placeholder="Chemical Testing of Soil"
                                />
                                <InputError message={form.errors.program_name} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_discipline">Discipline</Label>
                                <select
                                    id="edit_discipline"
                                    required
                                    value={form.data.discipline}
                                    onChange={(e) => form.setData('discipline', e.target.value)}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-foreground cursor-pointer"
                                >
                                    <option value="">Select Discipline</option>
                                    <option value="Chemical">Chemical</option>
                                    <option value="Biological">Biological</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Medical">Medical</option>
                                </select>
                                <InputError message={form.errors.discipline} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_fee">Program Fee (INR)</Label>
                                <Input
                                    id="edit_fee"
                                    type="number"
                                    required
                                    min={0}
                                    value={form.data.fee}
                                    onChange={(e) => form.setData('fee', Number(e.target.value))}
                                    placeholder="5000"
                                />
                                <InputError message={form.errors.fee} />
                            </div>
                        </div>

                        {/* Test Parameters Dynamic Builder */}
                        <div className="grid gap-2 border-y py-3">
                            <div className="flex items-center justify-between">
                                <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Test Parameters</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddParameter} className="h-7 cursor-pointer text-xs">
                                    <Plus className="mr-1 size-3" /> Add Parameter
                                </Button>
                            </div>
                            <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
                                {parameters.map((param, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            required
                                            value={param}
                                            onChange={(e) => handleParameterChange(index, e.target.value)}
                                            placeholder={`Parameter #${index + 1} (e.g. pH, Lead)`}
                                            className="h-8 text-xs"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveParameter(index)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <InputError message={form.errors.parameters} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_reg_start_date">Registration Start Date</Label>
                                <Input
                                    id="edit_reg_start_date"
                                    type="date"
                                    required
                                    value={form.data.reg_start_date}
                                    onChange={(e) => form.setData('reg_start_date', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.reg_start_date} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_reg_end_date">Registration End Date</Label>
                                <Input
                                    id="edit_reg_end_date"
                                    type="date"
                                    required
                                    value={form.data.reg_end_date}
                                    onChange={(e) => form.setData('reg_end_date', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.reg_end_date} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_dispatch_date">Dispatch Date</Label>
                                <Input
                                    id="edit_dispatch_date"
                                    type="date"
                                    required
                                    value={form.data.dispatch_date}
                                    onChange={(e) => form.setData('dispatch_date', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.dispatch_date} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_submission_deadline">Deadline</Label>
                                <Input
                                    id="edit_submission_deadline"
                                    type="date"
                                    required
                                    value={form.data.submission_deadline}
                                    onChange={(e) => form.setData('submission_deadline', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.submission_deadline} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_report_release_date">Report Date</Label>
                                <Input
                                    id="edit_report_release_date"
                                    type="date"
                                    required
                                    value={form.data.report_release_date}
                                    onChange={(e) => form.setData('report_release_date', e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <InputError message={form.errors.report_release_date} />
                            </div>
                        </div>

                        {/* Status omitted to match PDF */}

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="cursor-pointer">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing} className="cursor-pointer">
                                {form.processing && <Spinner className="mr-2" />} Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'PT Programs',
            href: '/admin/programs',
        },
    ],
};
