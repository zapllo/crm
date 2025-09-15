import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Calendar,
  FileText,
  Check,
  CheckSquare,
  Hash,
  MapPin,
  Image,
  FileSignature,
  CreditCard,
  Star,
  List,
  SquareAsterisk,
  Heading,
  Pilcrow,
  Minus,
  Clock,
  Eye,
  EyeOff,
  UploadCloud
} from 'lucide-react';

export const fieldTypes = [
  // Basic fields
  {
    type: 'text',
    label: 'Text',
    icon: Type,
    category: 'basic',
    defaultLabel: 'Text Field',
    defaultPlaceholder: 'Enter text here',
    hasOptions: false,
    defaultProperties: {}
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: AlignLeft,
    category: 'basic',
    defaultLabel: 'Text Area',
    defaultPlaceholder: 'Enter longer text here',
    hasOptions: false,
    defaultProperties: {
      rows: 3
    }
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    category: 'basic',
    defaultLabel: 'Email',
    defaultPlaceholder: 'Enter your email',
    hasOptions: false,
    defaultProperties: {}
  },
  {
    type: 'phone',
    label: 'Phone',
    icon: Phone,
    category: 'basic',
    defaultLabel: 'Phone Number',
    defaultPlaceholder: 'Enter your phone number',
    hasOptions: false,
    defaultProperties: {}
  },
  {
    type: 'number',
    label: 'Number',
    icon: Hash,
    category: 'basic',
    defaultLabel: 'Number',
    defaultPlaceholder: 'Enter a number',
    hasOptions: false,
    defaultProperties: {
      min: null,
      max: null,
      step: 1
    }
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: List,
    category: 'basic',
    defaultLabel: 'Select Option',
    defaultPlaceholder: 'Choose an option',
    hasOptions: true,
    defaultProperties: {
      allowMultiple: false,
      allowSearch: false
    }
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: CheckSquare,
    category: 'basic',
    defaultLabel: 'Checkboxes',
    hasOptions: true,
    defaultProperties: {
      allowOther: false,
      layout: 'vertical'
    }
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: Check,
    category: 'basic',
    defaultLabel: 'Radio Buttons',
    hasOptions: true,
    defaultProperties: {
      allowOther: false,
      layout: 'vertical'
    }
  },
  {
    type: 'date',
    label: 'Date',
    icon: Calendar,
    category: 'basic',
    defaultLabel: 'Date',
    hasOptions: false,
    defaultProperties: {
      format: 'MM/DD/YYYY',
      minDate: null,
      maxDate: null
    }
  },

  // Advanced fields
  {
    type: 'file',
    label: 'File Upload',
    icon: UploadCloud,
    category: 'advanced',
    defaultLabel: 'File Upload',
    hasOptions: false,
    defaultProperties: {
      maxSize: 5, // In MB
      allowedTypes: ['image/*', 'application/pdf'],
      maxFiles: 1
    }
  },
  {
    type: 'address',
    label: 'Address',
    icon: MapPin,
    category: 'advanced',
    defaultLabel: 'Address',
    hasOptions: false,
    defaultProperties: {
      includeStreet2: false,
      includeCity: true,
      includeState: true,
      includeZip: true,
      includeCountry: true
    }
  },
  {
    type: 'signature',
    label: 'Signature',
    icon: FileSignature,
    category: 'advanced',
    defaultLabel: 'Signature',
    hasOptions: false,
    defaultProperties: {
      width: 300,
      height: 150,
      penColor: '#000000',
      backgroundColor: '#ffffff'
    }
  },
  {
    type: 'rating',
    label: 'Rating',
    icon: Star,
    category: 'advanced',
    defaultLabel: 'Rating',
    hasOptions: false,
    defaultProperties: {
      maxRating: 5,
      icon: 'star', // star, heart, thumb
      allowHalfRating: false
    }
  },
  {
    type: 'time',
    label: 'Time',
    icon: Clock,
    category: 'advanced',
    defaultLabel: 'Time',
    hasOptions: false,
    defaultProperties: {
      format: '12hour', // or 24hour
      includeSeconds: false
    }
  },
  {
    type: 'hidden',
    label: 'Hidden Field',
    icon: EyeOff,
    category: 'advanced',
    defaultLabel: 'Hidden Field',
    hasOptions: false,
    defaultProperties: {
      defaultValue: ''
    }
  },
  {
    type: 'multiSelect',
    label: 'Multi-Select',
    icon: SquareAsterisk,
    category: 'advanced',
    defaultLabel: 'Multi-Select',
    defaultPlaceholder: 'Select options',
    hasOptions: true,
    defaultProperties: {
      allowSearch: true,
      maxSelections: null
    }
  },

  // Layout elements
  {
    type: 'heading',
    label: 'Heading',
    icon: Heading,
    category: 'layout',
    defaultLabel: 'Section Heading',
    hasOptions: false,
    defaultProperties: {
      headingLevel: 'h2',
      align: 'left'
    }
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: Pilcrow,
    category: 'layout',
    defaultLabel: 'Add some descriptive text for your form here.',
    hasOptions: false,
    defaultProperties: {
      align: 'left'
    }
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: Minus,
    category: 'layout',
    defaultLabel: 'Divider',
    hasOptions: false,
    defaultProperties: {
      style: 'solid', // solid, dashed, dotted
      color: '#e2e8f0',
      thickness: 1
    }
  }
];
