// Form validation and handling utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface FormField {
  name: string;
  value: string;
  rules: ValidationRule[];
}

export class FormValidator {
  public static validateField(field: FormField): string[] {
    const errors: string[] = [];

    for (const rule of field.rules) {
      if (rule.required && !field.value.trim()) {
        errors.push(rule.message || `${field.name} is required`);
        continue;
      }

      if (rule.minLength && field.value.length < rule.minLength) {
        errors.push(
          rule.message ||
            `${field.name} must be at least ${rule.minLength} characters`
        );
      }

      if (rule.maxLength && field.value.length > rule.maxLength) {
        errors.push(
          rule.message ||
            `${field.name} must be no more than ${rule.maxLength} characters`
        );
      }

      if (rule.pattern && !rule.pattern.test(field.value)) {
        errors.push(rule.message || `${field.name} format is invalid`);
      }
    }

    return errors;
  }

  public static validateForm(fields: FormField[]): {
    isValid: boolean;
    errors: Record<string, string[]>;
  } {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    for (const field of fields) {
      const fieldErrors = this.validateField(field);
      if (fieldErrors.length > 0) {
        errors[field.name] = fieldErrors;
        isValid = false;
      }
    }

    return { isValid, errors };
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
} as const;
