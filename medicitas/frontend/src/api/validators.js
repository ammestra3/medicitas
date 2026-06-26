export const rules = {
  name: {
    pattern: /^[A-ZÁÉÍÓÚÑ\s]{2,20}$/,
    msg: 'Solo letras mayusculas, maximo 20 caracteres'
  },
  id: {
    pattern: /^\d{1,20}$/,
    msg: 'Solo numeros, maximo 20 digitos'
  },
  phone: {
    pattern: /^\d{10}$/,
    msg: 'Exactamente 10 digitos numericos'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.(com|co|net|org|edu|gov|med)$/i,
    msg: 'Correo invalido. Debe contener @ y dominio valido (.com, .co, etc)'
  },
  medicalReg: {
    pattern: /^\d{4,15}$/,
    msg: 'Solo numeros, entre 4 y 15 digitos'
  }
}

export function validate(field, value) {
  const rule = rules[field]
  if (!rule) return null
  return rule.pattern.test(value) ? null : rule.msg
}

export function toUpperName(value) {
  return value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '')
}

export function onlyNumbers(value) {
  return value.replace(/\D/g, '')
}
