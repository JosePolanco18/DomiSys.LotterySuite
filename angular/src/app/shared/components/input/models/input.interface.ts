export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'mask' | 'currency' | 'date' | 'textarea';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputConfig {
  label: string;
  placeholder?: string;
  type?: InputType;
  size?: InputSize;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autocomplete?: string;
  helperText?: string;
  errorMessage?: string;
  showCharacterCount?: boolean;
  currency?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  locale?: string;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  min?: number;
  max?: number;
  step?: number;
  mask?: string;
  slotChar?: string;
  
  // ngx-bootstrap datepicker options
  dateFormat?: string;
  showIcon?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showWeekNumbers?: boolean;
  daysDisabled?: number[];
  datesDisabled?: Date[];
  datesEnabled?: Date[];
  containerClass?: string;
  placement?: string;
  showTodayButton?: boolean;
  showClearButton?: boolean;
  adaptivePosition?: boolean;
  isAnimated?: boolean;
  
  // textarea options
  rows?: number;
  cols?: number;
  autoResize?: boolean;
}