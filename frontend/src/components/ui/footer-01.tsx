import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { landingContent } from "../../data/landingContent";
import { openSmartDirections } from "../../utils/mapRouting";

/* Layout primitive (Container), flattened from the shared `section` helper. */
const containerWidths = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

interface ContainerProps extends React.ComponentProps<"div"> {
  width?: keyof typeof containerWidths;
}

function Container({ width = "wide", className, ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn("mx-auto w-full px-6", containerWidths[width], className)}
      {...props}
    />
  );
}

/*
 * Brand icons for social links, flattened from the shared `social-icons` helper.
 * Paths from Simple Icons (CC0).
 */
type IconProps = React.ComponentProps<"svg">;

function BrandIcon({ d, ...props }: IconProps & { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d={d} />
    </svg>
  );
}

function GitHubIcon(props: IconProps) {
  return (
    <BrandIcon
      d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3"
      {...props}
    />
  );
}

function LinkedInIcon(props: IconProps) {
  return (
    <BrandIcon
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      {...props}
    />
  );
}

function XIcon(props: IconProps) {
  return (
    <BrandIcon
      d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z"
      {...props}
    />
  );
}

function YouTubeIcon(props: IconProps) {
  return (
    <BrandIcon
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      {...props}
    />
  );
}

/* Small live indicator with a pulsing halo */
const tones = {
  success: { dot: "bg-emerald-500", halo: "bg-emerald-500/60" },
  warning: { dot: "bg-amber-500", halo: "bg-amber-500/60" },
  danger: { dot: "bg-red-500", halo: "bg-red-500/60" },
  neutral: { dot: "bg-[#1b1d26]", halo: "bg-[#1b1d26]/30" },
};

interface StatusDotProps extends React.ComponentProps<"span"> {
  tone?: keyof typeof tones;
  pulse?: boolean;
}

function StatusDot({
  tone = "success",
  pulse = true,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn("relative flex size-2 shrink-0", className)}
      {...props}
    >
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full motion-reduce:animate-none",
            tones[tone].halo,
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex size-full rounded-full",
          tones[tone].dot,
        )}
      />
    </span>
  );
}

const socials = [
  { name: "GitHub", icon: GitHubIcon },
  { name: "X", icon: XIcon },
  { name: "LinkedIn", icon: LinkedInIcon },
  { name: "YouTube", icon: YouTubeIcon },
];

export default function Footer01() {
  const navigate = useNavigate();

  const lumosColumns = [
    {
      title: "Portals & Access",
      links: [
        { label: "Visitor Registration Form", action: () => navigate("/form") },
        { label: "Staff Sign In Portal", action: () => navigate("/login") },
        {
          label: "Permanent QR Station",
          action: () => {
            const el = document.getElementById("qr-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          },
        },
        { label: "Interactive Venue Map", action: openSmartDirections },
      ],
    },
    {
      title: "Event Venue",
      links: [
        { label: "Shaligram Arcade", action: openSmartDirections },
        { label: landingContent.company.phone, href: `tel:${landingContent.company.phone}` },
        { label: landingContent.company.email, href: `mailto:${landingContent.company.email}` },
        { label: "Ahmedabad, Gujarat", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Lumos", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Security & Privacy", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-gray-100 bg-white font-sans text-[#1b1d26] select-none">
      <Container className="pt-16 sm:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand Column with Large Lumos Logo */}
          <div className="flex max-w-sm flex-col gap-5">
            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                window.history.replaceState(null, '', '/');
              }}
              className="flex items-center gap-2 cursor-pointer group w-fit"
            >
              <img
                src={landingContent.brand.logo}
                alt={landingContent.brand.name}
                className="h-14 sm:h-16 md:h-18 object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <p className="text-sm leading-6 text-[#6b7078]">
              Intelligent home automation and living suites tailored for modern spaces. Experience luxury technology and connected living.
            </p>
          </div>

          {/* Navigation Columns (3 columns without Living Features) */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {lumosColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1b1d26] font-mono">
                  {column.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link, idx) => (
                    <li key={idx}>
                      {link.action ? (
                        <button
                          type="button"
                          onClick={link.action}
                          className="text-left text-sm text-[#6b7078] transition-colors hover:text-[#2f767f] cursor-pointer"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href || "#"}
                          className="text-sm text-[#6b7078] transition-colors hover:text-[#2f767f]"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Legal & Status Bar */}
        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-gray-100 py-8 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3 text-sm text-[#6b7078] sm:flex-row sm:items-center sm:gap-6">
            <span>© {new Date().getFullYear()} Lumos Event & Automation</span>
            <div className="inline-flex items-center gap-2 text-xs text-[#2f767f] font-medium">
              <StatusDot tone="success" pulse />
              All systems operational
            </div>
          </div>
          <div className="flex items-center gap-1">
            {socials.map(({ name, icon: Icon }) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="inline-flex size-8 items-center justify-center rounded-lg text-[#6b7078] transition-colors hover:bg-gray-100 hover:text-[#2f767f]"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* Giant Clipped Watermark Text matching reference design */}
      <Container aria-hidden className="pointer-events-none select-none">
        <p className="-mb-[0.22em] bg-gradient-to-b from-[#1b1d26]/12 to-transparent bg-clip-text text-center text-[clamp(5rem,22vw,16rem)] leading-none font-bold tracking-tighter text-transparent">
          LUMOS
        </p>
      </Container>
    </footer>
  );
}
