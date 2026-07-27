# Epic Calc Engine Reference

Source: [`epic.js`](https://cdn.jsdelivr.net/gh/flowbuilds/epic/epic.js)

`epic.js` is a small DOM-driven attribute engine. It is not a general-purpose JavaScript framework. In the Heard calculator page, it is used through `epic-calc-*` attributes to bind inputs, derive values, and render formatted outputs.

## Core Idea

The engine scans the DOM for elements with a feature-specific attribute:

```text
epic-<system>-element="<ref-name>"
```

For the calculator system, that becomes:

```text
epic-calc-element="input"
epic-calc-element="output"
```

Each referenced element is collected into `epic.calc.ref.<ref-name>`. The engine then:

1. Reads input values
2. Evaluates formulas
3. Writes calculated results back to the DOM

## Supported Calculator Attributes

The calculator system recognizes these attributes on referenced elements:

- `epic-calc-element`
- `epic-calc-name`
- `epic-calc-calc`
- `epic-calc-format`
- `epic-calc-decimal`

### `epic-calc-element`

Declares the element as part of the calculator reference set.

Example:

```html
<input epic-calc-element="input" epic-calc-name="rev" />
<input epic-calc-element="output" epic-calc-name="sav" />
```

### `epic-calc-name`

Assigns a symbolic name used inside formulas.

Inputs use square brackets:

```text
[rev]
[exp]
```

Outputs use curly braces:

```text
{sal}
{fica}
```

### `epic-calc-calc`

Defines the formula for an output.

Example:

```html
<input epic-calc-element="output" epic-calc-calc="!([rev]-[exp])/2" />
```

The engine replaces tokens like `[rev]` and `{sal}` with current values and then evaluates the resulting JavaScript expression with `eval()`.

### `epic-calc-format`

Controls parsing and display formatting.

Supported values in `epic.js`:

- `dot`
- `com`
- `usd`
- `eur`
- `%`

For calculator outputs, `usd` adds a dollar sign and formats decimals.

### `epic-calc-decimal`

Sets decimal precision for parsing and output formatting.

Example:

```html
<input epic-calc-decimal="2" />
```

## How Input Parsing Works

When the engine reads an input element:

1. It reads `.value` for `<input>` elements, otherwise `.textContent`
2. Empty values fall back to the element's configured default, if present
3. If a format is configured, the engine converts the value into a number
4. It then evaluates the parsed value with `eval()`

This means calculator inputs are effectively treated as numeric expressions, not just plain numbers.

## How Output Calculation Works

For each output element:

1. The engine finds its `epic-calc-calc` expression
2. It replaces each `[inputName]` token with the current input value
3. It replaces each `{outputName}` token with the current output value
4. It evaluates the resulting expression with `eval()`
5. If the result is numeric, it writes it to the output element

If a referenced value is empty or invalid, the output may be cleared or left unchanged depending on context.

## Token Syntax

### Inputs

Use square brackets for input references:

```text
[rev]
[exp]
```

### Outputs

Use curly braces for output references:

```text
{sal}
{fica}
```

### Literal Expression Marker

The engine strips a leading `!` before evaluation.

This allows expressions such as:

```text
!([rev]-[exp])/2
```

After token replacement, the engine evaluates the JavaScript expression.

## Triggering Updates

The calculator page typically wires change events to `epic.calc.update(...)`.

Common patterns:

```html
epic-action="change=epic.calc.update(rev)"
```

```html
epic-action="click=epic.calc.update()"
```

`epic-action` is handled by the companion `epic.js` helper, which attaches event listeners declared in attributes.

## Reset Behavior

`epic.calc.reset()` clears all registered calculator inputs and reruns the calculator.

## Formatting Behavior

For outputs:

- `dot` uses `.` for decimals and `,` for thousands
- `com` uses `,` for decimals and `.` for thousands
- `usd` behaves like `dot` plus a `$` prefix
- `eur` behaves like `com` plus a `€` prefix

The engine rounds to the configured decimal count before display.

## Example

Given:

```html
<input epic-calc-element="input" epic-calc-name="rev" epic-calc-format="dot" epic-calc-decimal="2" />
<input epic-calc-element="input" epic-calc-name="exp" epic-calc-format="dot" epic-calc-decimal="2" />
<input epic-calc-element="output" epic-calc-name="sal" epic-calc-calc="!([rev]-[exp])/2" epic-calc-format="dot" epic-calc-decimal="2" />
```

If:

```text
rev = 190000
exp = 20000
```

Then:

```text
sal = (190000 - 20000) / 2
sal = 85000
```

## Important Caveats

- This engine uses `eval()` for both inputs and outputs.
- It is not sandboxed.
- It is intended for trusted page authoring, not untrusted user input.
- There is no standalone package or public API surface beyond the script itself.

## Heard Usage Notes

In the Heard S Corp calculator, the engine is used to:

- capture revenue and expense inputs
- derive salary, FICA, FUTA, and net income
- compute estimated savings
- format the final savings output as USD

## Practical Summary

If you see `epic-calc-calc` on a page, you are looking at a declarative formula system built on:

- DOM attributes
- token substitution
- `eval()`
- output formatting metadata

It is best thought of as a lightweight attribute-driven calculator runtime rather than a conventional framework.
