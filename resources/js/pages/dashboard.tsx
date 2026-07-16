import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Users, Layers, DollarSign, Truck, FileText, PieChart, Info, 
    Calendar, CheckCircle, Clock, ShieldCheck, Download, ExternalLink,
    ChevronRight, ArrowRight, Play, Check, AlertCircle, Building, User, MapPin,
    QrCode, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import type { Auth } from '@/types';

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
    registered_at: string;
    pt_program: Program;
    sample?: Sample | null;
};

type AdminStats = {
    total_participants: number;
    active_programs: number;
    revenue: number;
    pending_dispatches: number;
    submitted_observations: number;
    pending_reports: number;
};

type Props = {
    role: 'admin' | 'participant';
    stats?: AdminStats;
    activePrograms?: Program[];
    registrations?: Registration[];
};

export default function Dashboard({ role, stats, activePrograms = [], registrations = [] }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const openDetails = (program: Program) => {
        setSelectedProgram(program);
        setIsDetailsOpen(true);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRegStatusBadge = (status: string) => {
        switch (status) {
            case 'registered':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'sample_dispatched':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'submitted':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
            case 'report_released':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const isReportAvailable = (registration: Registration) => registration.status === 'report_released';
    const isCertificateAvailable = (registration: Registration) => registration.status === 'report_released';
    const isInvoiceAvailable = (registration: Registration) => registration.payment_status === 'paid';

    const downloadLinkClasses = (enabled: boolean) =>
        enabled
            ? 'flex items-center gap-1 hover:underline cursor-pointer'
            : 'flex items-center gap-1 text-muted-foreground/50 cursor-not-allowed pointer-events-none';

    return (
        <div className="flex-1 flex flex-col gap-6 p-6">
            <Head title="Dashboard" />

            {/* Role Header Banner */}
            <div className="mb-2 p-6 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/8 via-primary/2 to-transparent dark:from-primary/15 dark:via-primary/5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {role === 'admin' ? 'Admin Portal' : 'Participant Portal'}
                        </span>
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mt-2">
                            Welcome back, {user.name}!
                        </h1>
                        {role === 'participant' && user.username && (
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                <Building className="size-3.5" /> Laboratory ID: <span className="font-mono font-bold text-foreground bg-muted/80 px-2 py-0.5 rounded border border-input/60">{user.username}</span>
                            </p>
                        )}
                        {role === 'admin' && (
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Platform administrator control panel dashboard.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ADMIN DASHBOARD (Module 1) */}
            {role === 'admin' && stats && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Card 1: Total Participants */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex items-center gap-4 hover:border-sidebar-border transition-all duration-300">
                        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                            <Users className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Participants</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.total_participants}</h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Registered laboratories</p>
                        </div>
                    </div>

                    {/* Card 2: Active Programs */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex items-center gap-4 hover:border-sidebar-border transition-all duration-300">
                        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                            <Layers className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Programs</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.active_programs}</h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Programs in progress</p>
                        </div>
                    </div>

                    {/* Card 3: Revenue */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex items-center gap-4 hover:border-sidebar-border transition-all duration-300">
                        <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                            <DollarSign className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">
                                ₹{stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Paid registrations</p>
                        </div>
                    </div>

                    {/* Card 4: Pending Dispatches */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex items-center gap-4 hover:border-sidebar-border transition-all duration-300">
                        <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                            <Truck className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Dispatches</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.pending_dispatches}</h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Samples to ship</p>
                        </div>
                    </div>

                    {/* Card 5: Submitted Observations */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex items-center gap-4 hover:border-sidebar-border transition-all duration-300">
                        <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                            <FileText className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted Observations</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.submitted_observations}</h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Results awaiting evaluation</p>
                        </div>
                    </div>

                    {/* Card 6: Pending Reports */}
                    <div className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex items-center gap-4 hover:border-sidebar-border transition-all duration-300">
                        <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                            <PieChart className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reports Released</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.pending_reports}</h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Final statistics complete</p>
                        </div>
                    </div>
                </div>
            )}

            {/* PARTICIPANT DASHBOARD (Phase 2) */}
            {role === 'participant' && (
                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    
                    {/* Column A: Active PT Programs (Span 2) */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="flex items-center gap-2 pb-1 border-b">
                            <Play className="size-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Active PT Programs</h2>
                            <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-full ml-auto">
                                {activePrograms.length} Available
                            </span>
                        </div>

                        {activePrograms.length === 0 ? (
                            <div className="border border-dashed border-sidebar-border/70 rounded-xl p-8 text-center text-muted-foreground bg-card/30">
                                <AlertCircle className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                                <p className="text-sm font-semibold">No Active Schemes</p>
                                <p className="text-xs text-muted-foreground/80 mt-1">There are currently no open proficiency testing schemes accepting registrations.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {activePrograms.map((program) => (
                                    <div key={program.id} className="border border-sidebar-border/70 rounded-xl p-5 bg-card text-card-foreground shadow-xs flex flex-col gap-4 hover:border-sidebar-border transition-all duration-300">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                                                    {program.discipline}
                                                </span>
                                                <span className="text-[10px] font-mono text-muted-foreground">{program.program_code}</span>
                                            </div>
                                            <h3 className="font-bold text-sm text-foreground mt-2 line-clamp-1">{program.program_name}</h3>
                                            
                                            <div className="flex flex-wrap gap-1 mt-2.5 max-h-12 overflow-hidden">
                                                {program.parameters.map((p, idx) => (
                                                    <span key={idx} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-xs">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-auto border-t pt-3 flex flex-col gap-2.5 text-xs text-muted-foreground">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1"><Calendar className="size-3.5" /> Last Reg Date:</span>
                                                <span className="font-semibold text-foreground">{formatDate(program.reg_end_date)}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openDetails(program)} className="flex-1 cursor-pointer text-xs h-8">
                                                View Details
                                            </Button>
                                            <Button size="sm" asChild className="flex-1 cursor-pointer text-xs h-8">
                                                <Link href={`/programs/${program.id}/register`}>
                                                    Register <ArrowRight className="ml-1 size-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Column B: Past PT History (Span 1) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 pb-1 border-b">
                            <Clock className="size-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Past PT History</h2>
                        </div>

                        {registrations.length === 0 ? (
                            <div className="border border-dashed border-sidebar-border/70 rounded-xl p-8 text-center text-muted-foreground bg-card/30">
                                <ShieldCheck className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                                <p className="text-sm font-semibold">No Past History</p>
                                <p className="text-xs text-muted-foreground/80 mt-1">You haven't registered for any PT programs yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {registrations.map((reg) => (
                                    <div key={reg.id} className="border border-sidebar-border/70 rounded-xl p-4 bg-card text-card-foreground shadow-xs flex flex-col gap-3 hover:border-sidebar-border transition-all duration-300">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-mono text-muted-foreground">{reg.registration_number}</span>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${getRegStatusBadge(reg.status)}`}>
                                                    {reg.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-xs text-foreground mt-2 line-clamp-1">{reg.pt_program?.program_name}</h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">Registered: {formatDate(reg.registered_at || reg.created_at)}</p>
                                            {reg.sample && (
                                                <div className="mt-2.5 p-2 rounded bg-muted/50 border border-sidebar-border/50 text-[10px]">
                                                    <div className="font-semibold text-foreground flex items-center gap-1">
                                                        <Package className="size-3 text-primary" /> Sample ID: {reg.sample.sample_id}
                                                    </div>
                                                    {reg.sample.status === 'dispatched' ? (
                                                        <div className="mt-1 text-muted-foreground">
                                                            <div className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                                                                <Truck className="size-2.5" /> Dispatched
                                                            </div>
                                                            <span className="font-medium text-foreground">{reg.sample.courier_partner}</span> - {reg.sample.tracking_number}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-1 text-amber-600 dark:text-amber-400 font-medium">
                                                            Preparing for dispatch
                                                        </div>
                                                    )}
                                                    {reg.sample.qr_code_path && (
                                                        <a 
                                                            href={reg.sample.qr_code_path} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="mt-1 text-primary hover:underline flex items-center gap-1 font-semibold"
                                                        >
                                                            <QrCode className="size-3" /> View QR Code
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {reg.status === 'sample_dispatched' && (
                                            <div className="px-1.5">
                                                <Button 
                                                    size="sm" 
                                                    asChild 
                                                    className="w-full cursor-pointer h-8 text-xs font-semibold"
                                                >
                                                    <Link href={`/registrations/${reg.id}/observations`}>
                                                        Submit Observations <ArrowRight className="ml-1.5 size-3" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}

                                        {/* Download options */}
                                        <div className="border-t pt-3 flex items-center justify-between gap-1 text-[10px] font-semibold text-primary">
                                            <a
                                                href={`/registrations/${reg.id}/report`}
                                                className={downloadLinkClasses(isReportAvailable(reg))}
                                            >
                                                <Download className="size-3" /> Report
                                            </a>
                                            <span className="text-muted-foreground/30">|</span>
                                            <a
                                                href={`/registrations/${reg.id}/certificate`}
                                                className={downloadLinkClasses(isCertificateAvailable(reg))}
                                            >
                                                <Download className="size-3" /> Certificate
                                            </a>
                                            <span className="text-muted-foreground/30">|</span>
                                            <a
                                                href={`/registrations/${reg.id}/invoice`}
                                                className={downloadLinkClasses(isInvoiceAvailable(reg))}
                                            >
                                                <Download className="size-3" /> Invoice
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Program Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                {selectedProgram && (
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">{selectedProgram.program_name}</DialogTitle>
                            <DialogDescription className="font-mono text-xs">{selectedProgram.program_code}</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3.5 py-3 text-sm">
                            <div className="flex justify-between border-b pb-1.5">
                                <span className="text-muted-foreground">Discipline:</span>
                                <span className="font-semibold text-foreground">{selectedProgram.discipline}</span>
                            </div>

                            <div className="border-b pb-2">
                                <span className="text-muted-foreground block mb-1">Test Parameters:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedProgram.parameters.map((p, idx) => (
                                        <span key={idx} className="text-xs bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-sm">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-b pb-2">
                                <div>
                                    <span className="text-muted-foreground block text-xs">Registration Opens:</span>
                                    <span className="font-semibold text-foreground text-xs">{formatDate(selectedProgram.reg_start_date)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">Registration Closes:</span>
                                    <span className="font-semibold text-foreground text-xs">{formatDate(selectedProgram.reg_end_date)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 border-b pb-2">
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase">Sample Dispatch:</span>
                                    <span className="font-semibold text-foreground text-xs">{formatDate(selectedProgram.dispatch_date)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase">Submission Deadline:</span>
                                    <span className="font-semibold text-foreground text-xs">{formatDate(selectedProgram.submission_deadline)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase">Report Release:</span>
                                    <span className="font-semibold text-foreground text-xs">{formatDate(selectedProgram.report_release_date)}</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-between items-center gap-4">
                            <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-sm border border-emerald-500/20 font-bold uppercase tracking-wider">
                                Registrations Open
                            </span>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="cursor-pointer">
                                    Close
                                </Button>
                                <Button asChild className="cursor-pointer">
                                    <Link href={`/programs/${selectedProgram.id}/register`}>
                                        Register Now <ArrowRight className="ml-1.5 size-4" />
                                    </Link>
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
