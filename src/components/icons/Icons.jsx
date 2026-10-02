/**
 * Icons — Reexportação centralizada de ícones Heroicons e LibrasIcon custom.
 */
export { Cog6ToothIcon as SettingsIcon } from '@heroicons/react/24/outline';
export { ArrowLeftIcon as BackIcon } from '@heroicons/react/24/outline';
export { SpeakerWaveIcon as SpeakIcon } from '@heroicons/react/24/outline';
export { MapIcon as MapEmptyIcon } from '@heroicons/react/24/outline';
export { XMarkIcon as CloseIcon } from '@heroicons/react/24/outline';
export { ArrowDownTrayIcon as SaveIcon } from '@heroicons/react/24/outline';
export { MapPinIcon as RouteIcon } from '@heroicons/react/24/outline';
export { CheckCircleIcon as SuccessIcon } from '@heroicons/react/24/outline';
export { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
export { Bars3Icon as MenuIcon } from '@heroicons/react/24/outline';
export { XMarkIcon as MenuCloseIcon } from '@heroicons/react/24/outline';

export function LibrasIcon({ className = "h-4 w-4 shrink-0" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 11.5V5a2 2 0 0 1 4 0v6.5" />
      <path d="M11 7.5V4a2 2 0 0 1 4 0v7.5" />
      <path d="M15 9.5V6a2 2 0 0 1 4 0v7.5a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-2.5a2 2 0 0 1 4 0V14" />
    </svg>
  );
}
