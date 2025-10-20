"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building2, CreditCard, UserCog, Wand2, Activity as ActivityIcon, Tag, LogOut, Book, NotebookPen } from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

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
	const [isSuperAdmin, setIsSuperAdmin] = useState(false);
	const [hasBlogAddon, setHasBlogAddon] = useState(false);
  const [accountName, setAccountName] = useState<string | null>(null);
  const [accountPlan, setAccountPlan] = useState<string | null>(null);
  const { user } = useAuth();

	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const res = await fetch('/api/admin/me', { cache: 'no-store' });
				const json = await res.json().catch(() => ({}));
				if (alive && res.ok && json?.ok) {
					setIsSuperAdmin(Boolean(json.data?.isSuperAdmin));
					setHasBlogAddon(Boolean(json.data?.hasBlogAddon));
					setAccountName(json.data?.name ?? null);
					setAccountPlan(json.data?.plan ?? null);
				}
			} catch {}
		})();
		return () => {
			alive = false;
		};
	}, []);

	const canImpersonate = isSuperAdmin || hasBlogAddon;

	const nav = authed
		? [
			...baseNav,
			{ href: '/dashboard/releases', label: 'Releases', icon: Tag },
			...((hasBlogAddon || isSuperAdmin) ? ([{ href: '/dashboard/blog', label: 'Blog', icon: NotebookPen }] as const) : ([] as const)),
			...(isSuperAdmin ? ([{ href: '/dashboard/docs', label: 'Docs', icon: Book }] as const) : ([] as const)),
		]
		: baseNav;
	const quickActions = useMemo(() => {
		const items = [
			{ href: '/dashboard/overview', label: 'View metrics', description: 'Check key system health and KPIs.' },
			{ href: '/dashboard/tenants', label: 'Manage tenants', description: 'Review organizations and plans.' },
			{ href: '/dashboard/subscribers', label: 'Manage subscribers', description: 'Track active subscribers.' },
			{ href: '/dashboard/users', label: 'Manage users', description: 'Invite teammates and adjust roles.' },
		];
		if (hasBlogAddon || isSuperAdmin) {
			items.push({ href: '/dashboard/blog', label: 'Manage blog', description: 'Create and publish posts.' });
		}
		if (isSuperAdmin) {
			items.push({ href: '/dashboard/docs', label: 'Docs workspace', description: 'Edit internal documentation.' });
		}
		if (canImpersonate) {
			items.push({ href: '#impersonate', label: 'Switch roles', description: 'Test dashboards using preset personas.' });
		}
		return items;
	}, [hasBlogAddon, isSuperAdmin, canImpersonate]);

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
				} else if (!current || current === last || !root.contains(current)) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener('keydown', onKeydown);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			const toFocus = toolsBtnRef.current || lastActiveRef.current;
			try {
				toFocus?.focus();
			} catch {}
		};
	}, [toolsOpen]);

	const envBadge = process.env.NODE_ENV === 'production' ? 'Prod' : 'Dev';
	const displayName = user?.name ?? accountName;
	const planSource = user?.plan ?? accountPlan;
	const planLabel = planSource ? planSource.toUpperCase() : null;

	return (
		<div className="min-h-screen bg-gray-50">
			<a href="#main-content" className="skip-link">Skip to main content</a>
			<div className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
				<div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<button className="md:hidden rounded border px-2 py-1" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
							☰
						</button>
						<div className="flex flex-col">
							<Link href="/dashboard/overview" className="font-semibold tracking-tight">OfRoot Admin</Link>
							{planLabel && <span className="text-[10px] uppercase text-gray-500 tracking-wide">{planLabel} plan</span>}
						</div>
						<span className="text-[10px] px-2 py-0.5 rounded-full border bg-white text-gray-600">{envBadge}</span>
					</div>
					<div className="hidden md:flex items-center gap-3 min-w-0 flex-1 justify-end">
						<input
							aria-label="Global search"
							placeholder="Search users, tenants, subscribers..."
							className="w-72 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm placeholder-gray-400 focus:outline-none"
						/>
						{displayName && (
							<div className="text-xs sm:text-sm text-gray-600 text-right">
								<div className="font-medium text-gray-800">{displayName}</div>
								<div className="text-[10px] uppercase text-gray-500">{isSuperAdmin ? 'Super Admin' : 'Administrator'}</div>
							</div>
						)}
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
			<div className="mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-6">
				<aside className={`bg-white border rounded-lg md:sticky md:top-6 h-max ${open ? '' : 'hidden'} md:block`}>
					<nav className="p-2">
						<div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">Navigate</div>
						{nav.map((item) => {
							const active = pathname?.startsWith(item.href);
							const Icon = item.icon as React.ComponentType<{ className?: string }>;
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
						<div className="my-2 border-t" />
		{canImpersonate && (
			<div className="px-3 py-2" id="impersonate">
				<ImpersonateSwitcher />
			</div>
		)}
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
			{toolsOpen && (
				<div className="fixed inset-0 z-50">
					<div className="absolute inset-0 bg-black/40" onClick={() => setToolsOpen(false)} />
					<div className="absolute inset-0 flex items-center justify-center p-4">
						<div
							ref={modalRef}
							role="dialog"
							aria-modal="true"
							aria-labelledby="super-tools-title"
							className="w-full max-w-lg rounded-lg border bg-white"
							tabIndex={-1}
						>
							<div className="flex items-center justify-between p-4 border-b">
								<h2 id="super-tools-title" className="text-sm font-semibold">Super Tools</h2>
								<button aria-label="Close" onClick={() => setToolsOpen(false)} className="rounded px-2 py-1 text-gray-500 hover:bg-gray-50">✕</button>
							</div>
							<div className="p-4 space-y-4">
								<div className="grid grid-cols-1 gap-3">
									{quickActions.map((action) => (
										<Link
											key={action.href}
											href={action.href}
											onClick={() => setToolsOpen(false)}
											className="rounded-md border px-4 py-3 text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20b2aa]"
										>
											<div className="font-medium text-gray-900">{action.label}</div>
											<div className="text-xs text-gray-600">{action.description}</div>
										</Link>
									))}
									<button
										type="button"
										className="rounded-md border px-4 py-3 text-sm hover:bg-gray-50 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20b2aa]"
										onClick={() => setToolsOpen(false)}
									>
										Close menu
									</button>
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

function ImpersonateSwitcher() {
	const [role, setRole] = React.useState('member');
	const [plan, setPlan] = React.useState('free');
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const roles = [
		{ value: 'member', label: 'Member' },
		{ value: 'manager', label: 'Manager' },
		{ value: 'admin', label: 'Admin' },
	];
	const plans = [
		{ value: 'free', label: 'Free' },
		{ value: 'pro', label: 'Pro' },
		{ value: 'business', label: 'Business' },
	];

	async function handleImpersonate() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/api/admin/impersonate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role, plan }),
			});
			const json = await res.json().catch(() => ({}));
			if (!res.ok || !json?.ok) {
				throw new Error(json?.error?.message || 'Failed to impersonate');
			}
			window.location.reload();
		} catch (err: any) {
			setError(err?.message || 'Failed to impersonate');
		} finally {
			setLoading(false);
		}
	}

	return (
			<div className="flex flex-col gap-2">
				<div className="flex gap-2 flex-wrap">
				<select
						className="border rounded px-2 py-1 text-sm w-[120px]"
					value={role}
					onChange={event => setRole(event.target.value)}
				>
					{roles.map((r) => (
						<option key={r.value} value={r.value}>{r.label}</option>
					))}
				</select>
				<select
							className="border rounded px-2 py-1 text-sm w-[120px]"
					value={plan}
					onChange={event => setPlan(event.target.value)}
				>
					{plans.map((p) => (
						<option key={p.value} value={p.value}>{p.label}</option>
					))}
				</select>
						<button
							className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50 w-full sm:w-auto"
					onClick={handleImpersonate}
					disabled={loading}
				>
					{loading ? 'Impersonating...' : 'Impersonate'}
				</button>
			</div>
			{error && <div className="text-xs text-red-600">{error}</div>}
		</div>
	);
}
