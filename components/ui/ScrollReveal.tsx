"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number; // Delay in ms
    as?: React.ElementType; // Wrapper element type (default: div)
    className?: string; // Additional classes for the wrapper
    threshold?: number; // Intersection threshold (0-1)
}

export default function ScrollReveal({
    children,
    delay = 0,
    as: Component = "div",
    className = "",
    threshold = 0.1,
}: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(element);
                }
            },
            {
                threshold,
                rootMargin: "0px 0px -50px 0px", // Trigger slightly before the element is fully in view
            }
        );

        observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [threshold]);

    const transitionDelay = `${delay}ms`;

    return (
        <Component
            ref={ref}
            className={`transition-all duration-1000 ease-out will-change-[transform,opacity] ${isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                } ${className}`}
            style={{ transitionDelay }}
        >
            {children}
        </Component>
    );
}
