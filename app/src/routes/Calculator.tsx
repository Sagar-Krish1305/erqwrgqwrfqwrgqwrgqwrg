import { useCallback, useEffect, useState } from 'react'
import { Delete } from 'lucide-react'
import { CalcKey } from '@/components/calc-key'
import {
  INITIAL_STATE,
  OPERATOR_SYMBOL,
  chooseOperator,
  clearAll,
  deleteLast,
  equals,
  inputDecimal,
  inputDigit,
  percent,
  toggleSign,
} from '@/lib/calculator'
import type { CalcState, Operator } from '@/lib/calculator'

export default function Calculator() {
  const [state, setState] = useState<CalcState>(INITIAL_STATE)

  const press = {
    digit: useCallback((d: string) => setState((s) => inputDigit(s, d)), []),
    decimal: useCallback(() => setState((s) => inputDecimal(s)), []),
    operator: useCallback((op: Operator) => setState((s) => chooseOperator(s, op)), []),
    equals: useCallback(() => setState((s) => equals(s)), []),
    clear: useCallback(() => setState(clearAll()), []),
    sign: useCallback(() => setState((s) => toggleSign(s)), []),
    percent: useCallback(() => setState((s) => percent(s)), []),
    del: useCallback(() => setState((s) => deleteLast(s)), []),
  }

  // Physical keyboard support — an external input system, so an effect is correct.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const { key } = e
      if (key >= '0' && key <= '9') press.digit(key)
      else if (key === '.') press.decimal()
      else if (key === '+') press.operator('add')
      else if (key === '-') press.operator('subtract')
      else if (key === '*') press.operator('multiply')
      else if (key === '/') {
        e.preventDefault()
        press.operator('divide')
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault()
        press.equals()
      } else if (key === '%') press.percent()
      else if (key === 'Backspace') press.del()
      else if (key === 'Escape') press.clear()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [press])

  const isError = state.display === 'Error'

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <header className="mb-4 flex items-baseline justify-between px-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight">Calc</h1>
          <p className="text-xs text-muted-foreground">Type or click — ⌫ deletes, Esc clears</p>
        </header>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-lg shadow-black/20">
          <div className="mb-5 flex min-h-[104px] flex-col items-end justify-end gap-1 rounded-2xl bg-muted/40 px-5 py-4">
            <span className="h-6 text-sm text-muted-foreground tabular-nums">
              {state.expression || '\u00A0'}
            </span>
            <output
              className={cnDisplay(state.display)}
              aria-live="polite"
              aria-label="Result"
            >
              {state.display}
            </output>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <CalcKey label="AC" ariaLabel="All clear" variant="clear" onPress={press.clear} />
            <CalcKey label="±" ariaLabel="Toggle sign" variant="function" onPress={press.sign} />
            <CalcKey label="%" ariaLabel="Percent" variant="function" onPress={press.percent} />
            <CalcKey
              label={OPERATOR_SYMBOL.divide}
              ariaLabel="Divide"
              variant="operator"
              active={state.operator === 'divide'}
              onPress={() => press.operator('divide')}
            />

            <CalcKey label="7" onPress={() => press.digit('7')} />
            <CalcKey label="8" onPress={() => press.digit('8')} />
            <CalcKey label="9" onPress={() => press.digit('9')} />
            <CalcKey
              label={OPERATOR_SYMBOL.multiply}
              ariaLabel="Multiply"
              variant="operator"
              active={state.operator === 'multiply'}
              onPress={() => press.operator('multiply')}
            />

            <CalcKey label="4" onPress={() => press.digit('4')} />
            <CalcKey label="5" onPress={() => press.digit('5')} />
            <CalcKey label="6" onPress={() => press.digit('6')} />
            <CalcKey
              label={OPERATOR_SYMBOL.subtract}
              ariaLabel="Subtract"
              variant="operator"
              active={state.operator === 'subtract'}
              onPress={() => press.operator('subtract')}
            />

            <CalcKey label="1" onPress={() => press.digit('1')} />
            <CalcKey label="2" onPress={() => press.digit('2')} />
            <CalcKey label="3" onPress={() => press.digit('3')} />
            <CalcKey
              label={OPERATOR_SYMBOL.add}
              ariaLabel="Add"
              variant="operator"
              active={state.operator === 'add'}
              onPress={() => press.operator('add')}
            />

            <CalcKey label="0" wide onPress={() => press.digit('0')} />
            <CalcKey label="." ariaLabel="Decimal point" onPress={press.decimal} />
            <CalcKey
              label={isError ? <Delete className="size-6" /> : '='}
              ariaLabel={isError ? 'Clear error' : 'Equals'}
              variant="equals"
              onPress={isError ? press.clear : press.equals}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

// Display scales down as the number grows so it never overflows its container.
function cnDisplay(display: string): string {
  const len = display.length
  const size = len > 9 ? 'text-3xl' : len > 6 ? 'text-4xl' : 'text-5xl'
  return `${size} font-heading font-semibold leading-none tabular-nums break-all text-right`
}
