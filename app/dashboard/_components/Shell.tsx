"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building2, CreditCard, UserCog, Wand2, Activity as ActivityIcon, Tag, LogOut, Book } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

type Props = { children: React.ReactNode; authed?: boolean };

const baseNav = [
	{ href: '/dashboard/overview', label: 'Overview', icon: Home },
	{ href: '/dashboard/activity', label: 'Activity', icon: ActivityIcon },
	{ href: '/dashboard/subscribers', label: 'Subscribers', icon: UserCog },
	{ href: '/dashboard/tenants', label: 'Tenants', icon: Building2 },
	{ href: '/dashboard/users', label: 'Users', icon: Users },
	{ href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

export default function DashboardShell({ children, authed = false }: Props) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [toolsOpen, setToolsOpen] = useState(false);
	const toolsBtnRef = useRef<HTMLButtonElement | null>(null);
	const modalRef = useRef<HTMLDivElement | null>(null);
	const lastActiveRef = useRef<HTMLElement | null>(null);

	// Probe super-admin status so we can conditionally show privileged nav.
	const [isSuperAdmin, setIsSuperAdmin] = useState(false);
	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const res = await fetch('/api/admin/me', { cache: 'no-store' });
				const json = await res.json().catch(() => ({}));
				if (alive && res.ok && json?.ok) setIsSuperAdmin(Boolean(json.data?.isSuperAdmin));
			} catch {}
		})();
		return () => { alive = false; };
	}, []);

	const nav = authed
		? [
			...baseNav,
			{ href: '/dashboard/releases', label: 'Releases', icon: Tag },
			// Docs link only for super-admins
			...(isSuperAdmin ? ([{ href: '/dashboard/docs', label: 'Docs', icon: Book }] as const) : ([] as const)),
		]
		: baseNav;

	useEffect(() => {
		if (!toolsOpen) return;

		lastActiveRef.current = (document.activeElement as HTMLElement) || null;

		const modalEl = modalRef.current as HTMLElement | null;
		const selector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
		const focusables = modalEl ? (Array.from(modalEl.querySelectorAll(selector)) as HTMLElement[]) : [];
		(focusables[0] || modalEl || document.body).focus();

		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				setToolsOpen(false);
				return;
			}
			if (e.key === 'Tab') {
				const root = modalRef.current as HTMLElement | null;
				if (!root) return;
				const els = Array.from(root.querySelectorAll(selector)) as HTMLElement[];
				const list = els.filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
				if (list.length === 0) {
					e.preventDefault();
					root.focus();
					return;
				}
				const first = list[0];
				const last = list[list.length - 1];
				const current = (document.activeElement as HTMLElement) || null;
				if (e.shiftKey) {
					if (!current || current === first || !root.contains(current)) {
						e.preventDefault();
						last.focus();
					}
				} else {
					if (!current || current === last || !root.contains(current)) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		};

		document.addEventListener('keydown', onKeydown);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			// Restore focus to trigger or last active element
			const toFocus = toolsBtnRef.current || lastActiveRef.current;
			try { toFocus?.focus(); } catch {}
		};
	}, [toolsOpen]);

	const envBadge = process.env.NODE_ENV === 'production' ? 'Prod' : 'Dev';

	return (
		<div className="min-h-screen bg-gray-50">
			<a href="#main-content" className="skip-link">Skip to main content</a>
			{/* Top bar */}
			<div className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
				<div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<button className="md:hidden rounded border px-2 py-1" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
							☰
						</button>
						<Link href="/dashboard/overview" className="font-semibold tracking-tight">Admin</Link>
						<span className="text-[10px] px-2 py-0.5 rounded-full border bg-white text-gray-600">{envBadge}</span>
					</div>

					<div className="hidden md:flex items-center gap-3 min-w-0 flex-1 justify-end">
						<input
							aria-label="Global search"
							placeholder="Search users, tenants, subscribers..."
							className="w-72 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm placeholder-gray-400 focus:outline-none"
						/>
						<div className="text-xs sm:text-sm text-gray-500">Super-user</div>
						{authed && (
							<form action="/api/auth/logout?redirect=/auth/login" method="post">
								<button type="submit" className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50" aria-label="Sign out">
									<LogOut className="h-4 w-4" />
									Sign out
								</button>
							</form>
						)}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-6">
				<aside className={`bg-white border rounded-lg md:sticky md:top-6 h-max ${open ? '' : 'hidden'} md:block`}>
					<nav className="p-2">
						<div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">Navigate</div>
						{nav.map((item) => {
							const active = pathname?.startsWith(item.href);
							const Icon = item.icon as any;
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setOpen(false)}
									className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${active ? 'bg-gray-100 font-medium' : 'text-gray-700'}`}
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</Link>
							);
						})}

						{/* Super Tools trigger */}
						<div className="my-2 border-t" />
						{!authed && (
							<Link href="/subscribe" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50 text-gray-700">
								Start subscription
							</Link>
						)}
						{authed && (
							<form action="/api/auth/logout?redirect=/auth/login" method="post" className="w-full">
								<button type="submit" className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50 text-gray-700">
									<LogOut className="h-4 w-4" />
									Sign out
								</button>
							</form>
						)}
						<button
							ref={toolsBtnRef}
							type="button"
							onClick={() => setToolsOpen(true)}
							className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50 text-gray-700"
						>
							<Wand2 className="h-4 w-4" />
							Super Tools
						</button>
					</nav>
				</aside>
				<main id="main-content" className="space-y-6">{children}</main>
			</div>

			{/* Super Tools Modal */}
			{toolsOpen && (
				<div className="fixed inset-0 z-50">
					<div className="absolute inset-0 bg-black/40" onClick={() => setToolsOpen(false)} />
					<div className="absolute inset-0 flex items-center justify-center p-4">
						<div
							ref={modalRef}
							role="dialog"
							aria-modal="true"
							aria-labelledby="super-tools-title"
							className="w-full max-w-lg rounded-lg border bg-white shadow-lg"
							tabIndex={-1}
						>
							<div className="flex items-center justify-between p-4 border-b">
								<h2 id="super-tools-title" className="text-sm font-semibold">Super Tools</h2>
								<button aria-label="Close" onClick={() => setToolsOpen(false)} className="rounded px-2 py-1 text-gray-500 hover:bg-gray-50">✕</button>
							</div>
							<div className="p-4 space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<Link href="/clients/new" className="rounded-md border px-3 py-2 text-sm text-center hover:bg-gray-50" onClick={() => setToolsOpen(false)}>Add Client</Link>
									<Link href="/projects/new" className="rounded-md border px-3 py-2 text-sm text-center hover:bg-gray-50" onClick={() => setToolsOpen(false)}>Create Project</Link>
									<Link href="/dashboard/overview" className="rounded-md border px-3 py-2 text-sm text-center hover:bg-gray-50" onClick={() => setToolsOpen(false)}>View Metrics</Link>
									<button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 text-left" onClick={() => setToolsOpen(false)}>Close</button>
								</div>
								<p className="text-xs text-gray-500">Use Tab to navigate, Esc to close.</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
