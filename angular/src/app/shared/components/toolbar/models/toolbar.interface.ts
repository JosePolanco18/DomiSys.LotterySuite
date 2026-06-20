export interface ToolbarButton {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'info' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  visible?: boolean;
  outline?: boolean;
  order?: number;
  onClick?: () => void;
}

export interface ToolbarConfig {
  title?: string;
  subTitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  buttons?: ToolbarButton[];
  searchValue?: string;
}

export interface ToolbarEvent {
  buttonId: string;
  button: ToolbarButton;
  type: 'action';
}