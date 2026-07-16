import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { usePage, Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    const { component } = usePage();
    const isRegister = component === 'auth/register';

    if (isRegister) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/30 p-4 md:p-10">
                <div className="w-full max-w-md flex flex-col gap-6">
                    <Link
                        href={home()}
                        className="flex items-center gap-2 self-center sm:self-start font-medium"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                            <AppLogoIcon className="size-5 fill-current text-white" />
                        </div>
                        <span className="font-bold text-foreground">PT Portal</span>
                    </Link>
                    {children}
                </div>
            </div>
        );
    }

    return (
        <AuthLayoutTemplate title={title} description={description}>
            {children}
        </AuthLayoutTemplate>
    );
}
