// frontend/src/components/Icon.jsx

const ICONS = {
    activity: 'M22 12h-4l-3 8L9 4l-3 8H2',
    arrowRight: 'M5 12h14M13 5l7 7-7 7',
    bookOpen: 'M2 4.5A2.5 2.5 0 0 1 4.5 2H10v18H4.5A2.5 2.5 0 0 1 2 17.5v-13ZM14 2h5.5A2.5 2.5 0 0 1 22 4.5v13a2.5 2.5 0 0 1-2.5 2.5H14V2Z',
    check: 'M20 6 9 17l-5-5',
    chevronRight: 'M9 18l6-6-6-6',
    fileText: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h8 M8 9h2',
    heartPulse: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 12 5.3 5.5 5.5 0 0 0 2 8.5C2 15 12 21 12 21s2.76-1.66 5.33-4M3 14h4l2-3 4 6 2-3h6',
    home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3V10.5Z',
    lock: 'M7 11V7a5 5 0 0 1 10 0v4 M5 11h14v10H5V11Z',
    logIn: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3',
    logOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
    mail: 'M4 4h16v16H4V4Z M22 6l-10 7L2 6',
    menu: 'M4 6h16M4 12h16M4 18h16',
    messageCircle: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 1 1 17 0Z',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z',
    plus: 'M12 5v14M5 12h14',
    search: 'M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z',
    send: 'M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7Z',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
    stethoscope: 'M6 3v5a6 6 0 0 0 12 0V3 M6 3H4 M18 3h2 M12 14v3a4 4 0 0 0 8 0v-2',
    sun: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    trash: 'M3 6h18 M8 6V4h8v2 M6 6l1 16h10l1-16 M10 11v6 M14 11v6',
    upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
    user: 'M20 21a8 8 0 0 0-16 0 M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
    users: 'M17 21a5 5 0 0 0-10 0 M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21a4 4 0 0 0-5-3.87 M17 3.13a4 4 0 0 1 0 7.75 M2 21a4 4 0 0 1 5-3.87 M7 3.13a4 4 0 0 0 0 7.75'
}

export default function Icon({ name, size = 20, strokeWidth = 2, className = '', title }) {
    return (
        <svg
            className={`icon ${className}`}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden={title ? undefined : true}
            role={title ? 'img' : undefined}
        >
            {title && <title>{title}</title>}
            <path d={ICONS[name]} />
        </svg>
    )
}
