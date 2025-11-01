/**
 * Valida que una contraseña cumpla con los requisitos de seguridad
 * @param password - La contraseña a validar
 * @returns null si es válida, o un mensaje de error si no cumple los requisitos
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'La contraseña debe tener mínimo 8 caracteres';
  }

  if (password.length > 72) {
    return 'La contraseña debe tener máximo 72 caracteres';
  }

  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una mayúscula';
  }

  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una minúscula';
  }

  if (!/[0-9]/.test(password)) {
    return 'La contraseña debe contener al menos un número';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'La contraseña debe contener al menos un carácter especial';
  }

  return null;
}

/**
 * Obtiene los requisitos de la contraseña en formato de lista
 * @returns Array de requisitos
 */
export function getPasswordRequirements(): string[] {
  return [
    'Mínimo 8 caracteres',
    'Máximo 72 caracteres',
    'Al menos una mayúscula',
    'Al menos una minúscula',
    'Al menos un número',
    'Al menos un carácter especial (!@#$%^&*)',
  ];
}

/**
 * Verifica qué requisitos de contraseña cumple un password
 * @param password - La contraseña a validar
 * @returns Objeto con booleanos indicando qué requisitos se cumplen
 */
export function checkPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    maxLength: password.length <= 72,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };
}
