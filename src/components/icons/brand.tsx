import * as React from "react";

// Minimal brand glyphs — lucide-react v1 removed brand icons, so we ship our
// own. Each renders as a currentColor SVG accepting className like a lucide icon.

type Props = React.SVGProps<SVGSVGElement>;

const base = (props: Props) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  xmlns: "http://www.w3.org/2000/svg",
  ...props,
});

export const LinkedInIcon = (props: Props) => (
  <svg {...base(props)}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

export const XIcon = (props: Props) => (
  <svg {...base(props)}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
  </svg>
);

export const InstagramIcon = (props: Props) => (
  <svg {...base({ ...props, fill: "none" })}>
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" />
  </svg>
);

export const FacebookIcon = (props: Props) => (
  <svg {...base(props)}>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z" />
  </svg>
);

export const YouTubeIcon = (props: Props) => (
  <svg {...base(props)}>
    <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
  </svg>
);

export const TikTokIcon = (props: Props) => (
  <svg {...base(props)}>
    <path d="M21 8.2a5.7 5.7 0 0 1-3.6-1.26 5.7 5.7 0 0 1-1.7-3.18V3h-3.3v11.9a2.6 2.6 0 1 1-2.6-2.6c.18 0 .36.02.53.05V9a5.9 5.9 0 1 0 5.37 5.87V9.4A8.9 8.9 0 0 0 21 11.2V8.2z" />
  </svg>
);

export const TelegramIcon = (props: Props) => (
  <svg {...base(props)}>
    <path d="M23.07 3.3 19.6 19.9c-.26 1.16-.95 1.45-1.92.9l-5.3-3.9-2.56 2.46c-.28.28-.52.52-1.07.52l.38-5.4L18.9 5.6c.43-.38-.1-.6-.66-.22L6.1 13.2l-5.23-1.63c-1.14-.36-1.16-1.14.24-1.69L21.6 1.65c.95-.35 1.78.22 1.47 1.65z" />
  </svg>
);
