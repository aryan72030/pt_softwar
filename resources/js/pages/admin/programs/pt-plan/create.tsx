import { Head, useForm, Link } from '@inertiajs/react';
import { 
    ArrowLeft, Layers, Save, Calendar, Check, FileSpreadsheet, User, Package 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

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
    status: string;
};

type Props = {
    program: Program;
};

export default function CreatePtPlan({ program }: Props) {
    const form = useForm({
        material: '',
        assigned_coordinator: '',
        sample_quantity: 1,
        sample_preparation_instructions: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/admin/programs/${program.id}/pt-plan`, {
            onSuccess: () => {}
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
        <div className="flex flex-col gap-6 p-6">
            <Head title="Generate PT Plan" />

            {/* Breadcrumb-like header */}
            <div className="flex items-center gap-4 border-b pb-5">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 cursor-pointer">
                    <Link href="/admin/programs">
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <FileSpreadsheet className="size-6 text-primary" /> Generate PT Plan
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Plan for <span className="font-semibold text-foreground">{program.program_name}</span> ({program.program_code})
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: PT Program Info (read-only) */}
                <div className="lg:col-span-1">
                    <div className="border border-sidebar-border/70 rounded-xl bg-card text-card-foreground shadow-xs p-5">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <Layers className="size-4 text-primary" /> Program Details
                        </h3>
                        <div className="grid gap-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Discipline</span>
                                <span className="font-semibold">{program.discipline}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Fee</span>
                                <span className="font-semibold">₹{Number(program.fee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="border-b pb-2">
                                <span className="text-muted-foreground block mb-1">Test Parameters</span>
                                <div className="flex flex-wrap gap-1">
                                    {program.parameters.map((p, idx) => (
                                        <span key={idx} className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded-sm">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="border-b pb-2">
                                <span className="text-muted-foreground block mb-2 text-xs uppercase">Timeline</span>
                                <div className="grid gap-1.5 text-xs">
                                    <div className="flex justify-between">
                                        <span>Registration:</span>
                                        <span>{formatDate(program.reg_start_date)} - {formatDate(program.reg_end_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Dispatch:</span>
                                        <span>{formatDate(program.dispatch_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Deadline:</span>
                                        <span>{formatDate(program.submission_deadline)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Report:</span>
                                        <span>{formatDate(program.report_release_date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column: PT Plan Form */}
                <div className="lg:col-span-2">
                    <div className="border border-sidebar-border/70 rounded-xl bg-card text-card-foreground shadow-xs p-5">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <Save className="size-4 text-primary" /> Plan Configuration
                        </h3>

                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="material">Material / Matrix</Label>
                                    <Input
                                        id="material"
                                        required
                                        value={form.data.material}
                                        onChange={(e) => form.setData('material', e.target.value)}
                                        placeholder="e.g. Tap Water, Soil, Cement"
                                    />
                                    <InputError message={form.errors.material} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="assigned_coordinator">Assigned Coordinator</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="assigned_coordinator"
                                            required
                                            value={form.data.assigned_coordinator}
                                            onChange={(e) => form.setData('assigned_coordinator', e.target.value)}
                                            placeholder="Coordinator Name"
                                            className="pl-10"
                                        />
                                    </div>
                                    <InputError message={form.errors.assigned_coordinator} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sample_quantity">Sample Quantity</Label>
                                    <Input
                                        id="sample_quantity"
                                        type="number"
                                        required
                                        min={1}
                                        value={form.data.sample_quantity}
                                        onChange={(e) => form.setData('sample_quantity', Number(e.target.value))}
                                    />
                                    <InputError message={form.errors.sample_quantity} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sample_preparation_instructions">Sample Preparation Instructions</Label>
                                <Textarea
                                    id="sample_preparation_instructions"
                                    value={form.data.sample_preparation_instructions}
                                    onChange={(e) => form.setData('sample_preparation_instructions', e.target.value)}
                                    placeholder="Instructions for preparing, homogenizing, and stabilizing the test material..."
                                    rows={5}
                                    className="text-sm"
                                />
                                <InputError message={form.errors.sample_preparation_instructions} />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <Button variant="outline" asChild className="cursor-pointer">
                                    <Link href="/admin/programs">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={form.processing} className="cursor-pointer">
                                    {form.processing && <Spinner className="mr-2" />}
                                    <Check className="mr-2 size-4" /> Generate PT Plan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

CreatePtPlan.layout = {
    breadcrumbs: [
        { title: 'PT Programs', href: '/admin/programs' },
        { title: 'Generate PT Plan', href: '#' },
    ],
};
