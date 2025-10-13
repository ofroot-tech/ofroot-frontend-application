"use client";

/*
    # UI Components for Dashboard
    This file contains a set of reusable UI components for the dashboard
*/

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

/*
    ## PageHeader

    Renders a header with a title, optional subtitle, meta, and actions.
*/
export function PageHeader({
    title,
    subtitle,
    meta,
    actions,
}: {
    title: string;
    subtitle?: string;
    meta?: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
                {subtitle ? <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p> : null}
            </div>
            <div className="flex items-center gap-3">
                {meta ? <div className="text-sm text-gray-600">{meta}</div> : null}
                {actions}
            </div>
        </div>
    );
}

/*
    ## RangeSelect

    Dropdown for selecting a date range, updates the URL query string.
*/
export function RangeSelect({
    value,
    param = 'range',
}: {
    value: '7d' | '30d' | '90d';
    param?: string;
}) {
    const router = useRouter();
    const sp = useSearchParams();

    return (
        <label className="inline-flex items-center gap-2 text-sm">
            <span className="sr-only">Range</span>
            <select
                aria-label="Range"
                defaultValue={value}
                className="text-sm rounded-md border px-2 py-1.5 bg-white"
                onChange={e => {
                    const v = e.currentTarget.value as '7d' | '30d' | '90d';
                    const qs = new URLSearchParams(sp?.toString() || '');
                    if (v === '7d') qs.delete(param);
                    else qs.set(param, v);
                    const s = qs.toString();
                    router.push(s ? `?${s}` : '?');
                }}
            >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
            </select>
        </label>
    );
}

/*
    ## Breadcrumbs

    Renders a breadcrumb navigation from an array of items.
*/
export function Breadcrumbs({
    items,
}: {
    items: Array<{ label: string; href?: string }>;
}) {
    return (
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
            <ol className="flex items-center gap-1">
                {items.map((it, idx) => (
                    <li key={`${it.label}-${idx}`} className="flex items-center gap-1">
                        {it.href ? (
                            <Link className="hover:underline" href={it.href}>
                                {it.label}
                            </Link>
                        ) : (
                            <span className="text-gray-700">{it.label}</span>
                        )}
                        {idx < items.length - 1 ? <span aria-hidden>›</span> : null}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

/*
    ## Card

    A simple card container with optional custom className.
*/
export function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
            {children}
        </div>
    );
}

/*
    ## CardBody

    Padding wrapper for card content.
*/
export function CardBody({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={`p-4 ${className}`}>{children}</div>;
}

/*
    ## CardHeader

    Header section for cards, with border and spacing.
*/
export function CardHeader({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`p-4 border-b flex items-center justify-between gap-4 ${className}`}>
            {children}
        </div>
    );
}

/*
    ## ToolbarButton

    Button or link for toolbars, with disabled state.
*/
export function ToolbarButton({
    children,
    href,
    disabled,
    onClick,
}: {
    children: React.ReactNode;
    href?: string;
    disabled?: boolean;
    onClick?: () => void;
}) {
    const classes = `text-sm rounded-md border px-3 py-1.5 ${
        disabled ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'
    }`;
    return href ? (
        <Link href={href} className={classes} onClick={onClick}>
            {children}
        </Link>
    ) : (
        <button className={classes} disabled={disabled} onClick={onClick}>
            {children}
        </button>
    );
}

/*
    ## Pagination

    Renders previous/next pagination controls and current page info.
*/
export function Pagination({
    basePath,
    current,
    last,
    extraParams,
}: {
    basePath: string;
    current: number;
    last: number;
    extraParams?: Record<string, string | number | undefined>;
}) {
    const prev = current > 1 ? current - 1 : null;
    const next = current < last ? current + 1 : null;

    // Helper to build query string for a given page
    const q = (p: number) => {
        const qs = new URLSearchParams();
        if (p > 1) qs.set('page', String(p));
        if (extraParams) {
            Object.entries(extraParams).forEach(([k, v]) => {
                if (v !== undefined && v !== '') qs.set(k, String(v));
            });
        }
        const s = qs.toString();
        return s ? `?${s}` : '';
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
                Page {current} of {last}
            </span>
            {prev ? (
                <Link
                    className="text-sm rounded-md border px-3 py-1.5 bg-white hover:bg-gray-50"
                    href={`${basePath}${q(prev)}`}
                    prefetch={false}
                >
                    Prev
                </Link>
            ) : (
                <button
                    className="text-sm rounded-md border px-3 py-1.5 bg-gray-100 text-gray-400"
                    disabled
                >
                    Prev
                </button>
            )}
            {next ? (
                <Link
                    className="text-sm rounded-md border px-3 py-1.5 bg-white hover:bg-gray-50"
                    href={`${basePath}${q(next)}`}
                    prefetch={false}
                >
                    Next
                </Link>
            ) : (
                <button
                    className="text-sm rounded-md border px-3 py-1.5 bg-gray-100 text-gray-400"
                    disabled
                >
                    Next
                </button>
            )}
        </div>
    );
}

/*
    ## DataTable

    Renders a table with sticky header and optional vertical scroll.
*/
export function DataTable({
    columns,
    children,
    className = '',
    scrollY,
}: {
    columns: Array<{ key: string; title: string; align?: 'left' | 'right' }>;
    children: React.ReactNode;
    className?: string;
    scrollY?: number;
}) {
    return (
        <div
            className={`overflow-x-auto ${scrollY ? 'overflow-y-auto' : ''}`}
            style={scrollY ? { maxHeight: scrollY } : undefined}
        >
            <table className={`min-w-full text-sm data-table ${className}`}>
                <thead className={`text-left ${scrollY ? 'sticky top-0 bg-gray-50' : 'bg-gray-50'}`}>
                    <tr>
                        {columns.map(c => (
                            <th
                                key={c.key}
                                className={`px-4 py-2 ${c.align === 'right' ? 'text-right' : ''}`}
                            >
                                {c.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

/*
    ## KpiCard

    Card for displaying a KPI value, label, and optional hint.
*/
export function KpiCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string | number;
    hint?: string;
}) {
    return (
        <Card>
            <CardBody>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
                {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
            </CardBody>
        </Card>
    );
}

/*
    ## EmptyState

    Simple empty state with title and optional description.
*/
export function EmptyState({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="text-center text-sm text-gray-600 py-8">
            <div className="font-medium text-gray-700">{title}</div>
            {description ? <div className="mt-1 text-gray-500">{description}</div> : null}
        </div>
    );
}
