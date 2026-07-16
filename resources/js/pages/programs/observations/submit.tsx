import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Layers, Package, Calendar, CheckCircle2, ArrowLeft, 
    UploadCloud, AlertCircle, FileText, Trash2, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

type PtProgram = {
    id: number;
    program_code: string;
    program_name: string;
    discipline: string;
    submission_deadline: string;
};

type Sample = {
    sample_id: string;
};

type Registration = {
    id: number;
    registration_number: string;
    parameters: string[];
    pt_program: PtProgram;
    sample: Sample | null;
};

type Props = {
    registration: Registration;
};

type ObservationInput = {
    parameter_name: string;
    test_method: string;
    result: string;
    unit: string;
    remarks: string;
};

export default function SubmitObservations({ registration }: Props) {
    // Pre-populate input rows for each registered parameter
    const initialObservations: ObservationInput[] = registration.parameters.map(param => ({
        parameter_name: param,
        test_method: '',
        result: '',
        unit: '',
        remarks: ''
    }));

    const form = useForm({
        observations: initialObservations,
        supporting_file: null as File | null,
    });

    const [fileName, setFileName] = useState<string | null>(null);

    const handleFieldChange = (index: number, field: keyof ObservationInput, value: string) => {
        const current = [...form.data.observations];
        current[index] = {
            ...current[index],
            [field]: value
        };
        form.setData('observations', current);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            form.setData('supporting_file', files[0]);
            setFileName(files[0].name);
        }
    };

    const handleRemoveFile = () => {
        form.setData('supporting_file', null);
        setFileName(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use Inertia's post with forceFormData for file upload support
        form.post(`/registrations/${registration.id}/observations`, {
            forceFormData: true,
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-4 px-4">
            <Head title="Submit Observations" />

            <div className="mb-6 flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 cursor-pointer">
                    <a href="/dashboard">
                        <ArrowLeft className="size-4" />
                    </a>
                </Button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                        Submit Test Observations
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Record results, methods, and attach supporting files for your assigned sample
                    </p>
                </div>
            </div>

            {/* Scheme and Sample Info Block */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="border border-sidebar-border/70 rounded-xl p-4 bg-card text-card-foreground shadow-xs flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Layers className="size-5" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">PT Program</div>
                        <div className="font-bold text-xs text-foreground mt-0.5 line-clamp-1">{registration.pt_program.program_name}</div>
                        <div className="text-[9px] font-mono text-muted-foreground mt-0.5">{registration.pt_program.program_code}</div>
                    </div>
                </div>

                <div className="border border-sidebar-border/70 rounded-xl p-4 bg-card text-card-foreground shadow-xs flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Package className="size-5" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Assigned Sample ID</div>
                        <div className="font-bold text-xs text-foreground mt-0.5 font-mono">
                            {registration.sample?.sample_id || 'N/A'}
                        </div>
                    </div>
                </div>

                <div className="border border-sidebar-border/70 rounded-xl p-4 bg-card text-card-foreground shadow-xs flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                        <Calendar className="size-5" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Submission Deadline</div>
                        <div className="font-bold text-xs text-foreground mt-0.5">
                            {formatDate(registration.pt_program.submission_deadline)}
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Parameters Observation Sheet */}
                <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex flex-col gap-5">
                    <div className="flex items-center gap-2 border-b pb-3 mb-2">
                        <CheckCircle2 className="size-5 text-primary" />
                        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Observation Data Sheet</h3>
                    </div>

                    <div className="flex flex-col gap-6 divide-y divide-sidebar-border/50">
                        {form.data.observations.map((obs, idx) => (
                            <div key={idx} className={`pt-5 first:pt-0 grid gap-4 md:grid-cols-4 items-start`}>
                                
                                {/* Parameter Name Label Column */}
                                <div>
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Test Parameter</Label>
                                    <div className="font-bold text-sm text-foreground mt-1.5 p-2 rounded-md bg-muted/60 border border-sidebar-border/70 w-fit">
                                        {obs.parameter_name}
                                    </div>
                                </div>

                                {/* Test Method Input */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor={`method-${idx}`} className="text-xs font-medium">Test Method / Standard</Label>
                                    <Input
                                        id={`method-${idx}`}
                                        required
                                        value={obs.test_method}
                                        onChange={(e) => handleFieldChange(idx, 'test_method', e.target.value)}
                                        placeholder="e.g. APHA 4500-H+ B"
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={form.errors[`observations.${idx}.test_method` as any] as any} />
                                </div>

                                {/* Result Value Input */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor={`result-${idx}`} className="text-xs font-medium">Result Value</Label>
                                    <Input
                                        id={`result-${idx}`}
                                        required
                                        value={obs.result}
                                        onChange={(e) => handleFieldChange(idx, 'result', e.target.value)}
                                        placeholder="e.g. 7.34"
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={form.errors[`observations.${idx}.result` as any] as any} />
                                </div>

                                {/* Measuring Unit Input */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor={`unit-${idx}`} className="text-xs font-medium">Measuring Unit</Label>
                                    <Input
                                        id={`unit-${idx}`}
                                        required
                                        value={obs.unit}
                                        onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                                        placeholder="e.g. pH Units, mg/L"
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={form.errors[`observations.${idx}.unit` as any] as any} />
                                </div>

                                {/* Remarks textarea spans full width */}
                                <div className="md:col-span-4 grid gap-1.5">
                                    <Label htmlFor={`remarks-${idx}`} className="text-xs font-medium text-muted-foreground">Remarks / Observations (Optional)</Label>
                                    <textarea
                                        id={`remarks-${idx}`}
                                        value={obs.remarks}
                                        onChange={(e) => handleFieldChange(idx, 'remarks', e.target.value)}
                                        rows={2}
                                        placeholder="Add any specific observations or environment conditions..."
                                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-foreground resize-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Supporting Document Upload Card */}
                <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b pb-3">
                        <UploadCloud className="size-5 text-primary" />
                        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Attach Raw Data / Test Report</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label className="text-xs text-muted-foreground">
                            Upload a consolidated raw test report sheet or parameters log (Allowed: PDF, JPG, PNG, ZIP, max 10MB)
                        </Label>

                        {!fileName ? (
                            <label className="border border-dashed border-sidebar-border/70 hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer bg-muted/20 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                                <UploadCloud className="size-8 text-muted-foreground/60" />
                                <span className="text-xs font-semibold text-primary">Click to select file</span>
                                <span className="text-[10px] text-muted-foreground">Or drag and drop your document here</span>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept=".pdf,.jpg,.jpeg,.png,.zip"
                                />
                            </label>
                        ) : (
                            <div className="border border-sidebar-border/70 rounded-lg p-3 flex items-center justify-between bg-muted/40">
                                <div className="flex items-center gap-2 text-xs">
                                    <FileText className="size-4.5 text-primary" />
                                    <span className="font-semibold text-foreground truncate max-w-[200px]">{fileName}</span>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={handleRemoveFile}
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        )}
                        <InputError message={form.errors.supporting_file} />
                    </div>
                </div>

                {/* Confirm Warnings & Submit Actions */}
                <div className="flex flex-col gap-4">
                    
                    {/* Warning Alert banner */}
                    <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
                        <AlertCircle className="size-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold">Permanent Submission Lock:</span> Once observations are submitted, they are permanently locked for statistical evaluation and cannot be modified or re-submitted.
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            asChild 
                            className="cursor-pointer"
                        >
                            <a href="/dashboard">Cancel</a>
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={form.processing} 
                            className="cursor-pointer font-bold px-6"
                        >
                            {form.processing && <Spinner className="mr-2" />}
                            Submit Results
                        </Button>
                    </div>
                </div>

            </form>
        </div>
    );
}

SubmitObservations.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Observations Submission',
            href: '#',
        },
    ],
};
