// Pure calculator engine — a small state machine over the display + a pending
// operation. No React here so it stays trivially testable.

export const OPERATORS = ['add', 'subtract', 'multiply', 'divide'] as const
export type Operator = (typeof OPERATORS)[number]

export const OPERATOR_SYMBOL: Record<Operator, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
}

const MAX_DIGITS = 12

export type CalcState = {
  // The string currently shown on the display.
  display: string
  // The stored left-hand operand (as a number) once an operator is chosen.
  accumulator: number | null
  // The pending operator awaiting its right-hand operand.
  operator: Operator | null
  // True right after an operator/equals, so the next digit starts a fresh entry.
  overwrite: boolean
  // A short expression preview, e.g. "12 ×".
  expression: string
}

export const INITIAL_STATE: CalcState = {
  display: '0',
  accumulator: null,
  operator: null,
  overwrite: true,
  expression: '',
}

function toNumber(value: string): number {
  return Number.parseFloat(value)
}

// Format a computed number back to a bounded display string.
function formatResult(value: number): string {
  if (!Number.isFinite(value)) return 'Error'
  if (Number.isInteger(value)) {
    const s = String(value)
    return s.length > MAX_DIGITS ? value.toExponential(6) : s
  }
  const rounded = Number.parseFloat(value.toPrecision(MAX_DIGITS))
  return String(rounded)
}

function apply(a: number, b: number, op: Operator): number {
  switch (op) {
    case 'add':
      return a + b
    case 'subtract':
      return a - b
    case 'multiply':
      return a * b
    case 'divide':
      return b === 0 ? Number.POSITIVE_INFINITY : a / b
  }
}

export function inputDigit(state: CalcState, digit: string): CalcState {
  if (state.display === 'Error') return { ...INITIAL_STATE, display: digit, overwrite: false }
  if (state.overwrite) return { ...state, display: digit, overwrite: false }
  if (state.display.replace('-', '').replace('.', '').length >= MAX_DIGITS) return state
  const next = state.display === '0' ? digit : state.display + digit
  return { ...state, display: next }
}

export function inputDecimal(state: CalcState): CalcState {
  if (state.display === 'Error') return { ...INITIAL_STATE, display: '0.', overwrite: false }
  if (state.overwrite) return { ...state, display: '0.', overwrite: false }
  if (state.display.includes('.')) return state
  return { ...state, display: state.display + '.' }
}

export function chooseOperator(state: CalcState, operator: Operator): CalcState {
  if (state.display === 'Error') return state
  const current = toNumber(state.display)

  // Chain: if an operator is already pending and the user typed a new operand, fold it.
  if (state.operator !== null && !state.overwrite && state.accumulator !== null) {
    const result = apply(state.accumulator, current, state.operator)
    const display = formatResult(result)
    return {
      display,
      accumulator: display === 'Error' ? null : result,
      operator: display === 'Error' ? null : operator,
      overwrite: true,
      expression: display === 'Error' ? '' : `${display} ${OPERATOR_SYMBOL[operator]}`,
    }
  }

  return {
    ...state,
    accumulator: current,
    operator,
    overwrite: true,
    expression: `${formatResult(current)} ${OPERATOR_SYMBOL[operator]}`,
  }
}

export function equals(state: CalcState): CalcState {
  if (state.operator === null || state.accumulator === null || state.display === 'Error') {
    return state
  }
  const current = toNumber(state.display)
  const result = apply(state.accumulator, current, state.operator)
  const display = formatResult(result)
  return {
    display,
    accumulator: null,
    operator: null,
    overwrite: true,
    expression: '',
  }
}

export function clearAll(): CalcState {
  return { ...INITIAL_STATE }
}

export function toggleSign(state: CalcState): CalcState {
  if (state.display === 'Error' || state.display === '0') return state
  const next = state.display.startsWith('-') ? state.display.slice(1) : `-${state.display}`
  return { ...state, display: next }
}

export function percent(state: CalcState): CalcState {
  if (state.display === 'Error') return state
  const value = toNumber(state.display) / 100
  return { ...state, display: formatResult(value), overwrite: true }
}

export function deleteLast(state: CalcState): CalcState {
  if (state.display === 'Error') return clearAll()
  if (state.overwrite) return state
  if (state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith('-'))) {
    return { ...state, display: '0', overwrite: true }
  }
  return { ...state, display: state.display.slice(0, -1) }
}
