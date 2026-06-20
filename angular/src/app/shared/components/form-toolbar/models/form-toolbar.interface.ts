export interface FormToolbarButton {
    id: string;
    label: string;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'info' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    visible?: boolean;
    outline?: boolean;
    order?: number;
    type?: 'button' | 'submit';
    onClick?: () => void;
  }
  
  export interface FormToolbarConfig {
    title?: string;
    subtitle?: string;
    showBackButton?: boolean;
    backButtonLabel?: string;
    buttons?: FormToolbarButton[];
    showSaveButton?: boolean;
    saveButtonLabel?: string;
    showCancelButton?: boolean;
    cancelButtonLabel?: string;
    sticky?: boolean;
    loading?: boolean;
    onSave?: () => void;
    onCancel?: () => void;
    onBack?: () => void;
  }
  
  export interface FormToolbarEvent {
    buttonId: string;
    button: FormToolbarButton;
    type: 'action' | 'save' | 'cancel' | 'back';
  }