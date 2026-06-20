export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'info' | 'success' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonConfig {
  label: string;
  icon?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  outline?: boolean;
  iconPosition?: 'left' | 'right';
}