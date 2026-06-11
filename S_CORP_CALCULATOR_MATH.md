# S Corp Calculator Math

Source: https://heard2.webflow.io/tools/s-corp-calculator

This document outlines the math currently used by the S Corp Tax Savings Calculator on the Heard Webflow page. The formulas come from the page's `epic-calc-calc` attributes and the generic `epic.calc` script.

## Inputs

The calculator asks users for two values:

```text
rev = total annual revenue
exp = total annual business expenses
```

From those, the calculator derives:

```text
profit = rev - exp
```

## Automatically Calculated Values

### Annual Business Salary

The calculator assumes the S Corp owner salary is 50% of profit:

```text
salary = (rev - exp) / 2
```

### Payroll Taxes - FICA

FICA is calculated as Social Security plus Medicare on the assumed salary:

```text
FICA = (salary * 0.062) + (salary * 0.0145)
```

Simplified:

```text
FICA = salary * 0.0765
```

### Payroll Taxes - FUTA

FUTA is hard-coded as 6.2% of $7,000:

```text
FUTA = 7000 * 0.062
```

```text
FUTA = 434
```

### Net Income

Net income is calculated after expenses, salary, FICA, and FUTA:

```text
net income = rev - exp - salary - FICA - FUTA
```

### Your Portion of Payroll Taxes

The calculator sets the user's portion of payroll taxes equal to FICA:

```text
your payroll tax portion = FICA
```

### Total Payroll Taxes Paid

Total payroll taxes are calculated as:

```text
total payroll taxes = your payroll tax portion + FICA + FUTA
```

Since the user portion is also FICA, this simplifies to:

```text
total payroll taxes = FICA + FICA + FUTA
```

```text
total payroll taxes = (2 * FICA) + FUTA
```

## Fixed Costs

The calculator includes these fixed costs:

```text
Annual S Corp Registration = 500
Payroll Service Fees = 540
```

The page also defines a hidden `Annual Heard Upgrade` value:

```text
Annual Heard Upgrade = 1200
```

However, that hidden value is not included in the final savings formula.

## Final Estimated Tax Savings Formula

The calculator's final formula is:

```text
estimated savings =
  ((profit - (profit * 0.153 * 0.5)) * 0.153)
  - total payroll taxes
  - (S Corp registration + payroll service fees)
```

Substituting the fixed costs:

```text
estimated savings =
  ((profit - (profit * 0.153 * 0.5)) * 0.153)
  - total payroll taxes
  - (500 + 540)
```

Or:

```text
estimated savings =
  ((profit - (profit * 0.0765)) * 0.153)
  - total payroll taxes
  - 1040
```

## Example Using Placeholder Values

The page's placeholders use:

```text
rev = 190,000
exp = 20,000
```

Calculate profit:

```text
profit = 190,000 - 20,000
profit = 170,000
```

Calculate salary:

```text
salary = 170,000 / 2
salary = 85,000
```

Calculate FICA:

```text
FICA = 85,000 * 0.0765
FICA = 6,502.50
```

Calculate FUTA:

```text
FUTA = 7,000 * 0.062
FUTA = 434.00
```

Calculate net income:

```text
net income = 190,000 - 20,000 - 85,000 - 6,502.50 - 434.00
net income = 78,063.50
```

Calculate total payroll taxes:

```text
total payroll taxes = 6,502.50 + 6,502.50 + 434.00
total payroll taxes = 13,439.00
```

Calculate estimated savings:

```text
estimated savings =
  ((170,000 - (170,000 * 0.153 * 0.5)) * 0.153)
  - 13,439.00
  - 1,040
```

```text
estimated savings = 9,541.24
```

## Implementation Notes

- User-entered revenue and expenses are parsed as currency-like numeric inputs.
- Outputs are rounded to two decimal places.
- Most output fields use plain number formatting.
- The final savings output is formatted as USD.
- The visible calculator does not appear to include the hidden `$1,200` Heard upgrade value in the final savings result.
