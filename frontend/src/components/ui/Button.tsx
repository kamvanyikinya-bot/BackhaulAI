import { cn } from '../../lib/utils';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean; leftIcon?: React.ReactNode; rightIcon?: React.ReactNode;
}
const v: Record<string, string> = { primary: 'bg-blue-600 text-white hover:bg-blue-700', secondary: 'bg-gray-800 text-white hover:bg-gray-900', outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50', ghost: 'text-gray-600 hover:bg-gray-100' };
const s: Record<string, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
export function Button({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, className, children, disabled, ...props }: ButtonProps) {
  return <button className={cn('inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed', v[variant], s[size], className)} disabled={disabled || isLoading} {...props}>
    {isLoading ? <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" /> : leftIcon && <span className="mr-2">{leftIcon}</span>}
    {children}
    {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
  </button>;
}