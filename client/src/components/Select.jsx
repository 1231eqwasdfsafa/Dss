import { ChevronDown } from "./Icons.jsx";

// Native <select> renders its own (often light-themed) chrome in most
// browsers, which breaks the dark UI the moment it's opened. This hides
// that default arrow and draws our own so it always matches the theme.
export default function Select({ className = "", ...props }) {
  return (
    <div className="relative">
      <select {...props} className={`input appearance-none pr-9 cursor-pointer ${className}`} />
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
    </div>
  );
}
