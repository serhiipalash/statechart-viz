# statechart-viz

A React component for statechart visualisation. A fork of first version of **XState** [Visualizer](https://xstate.js.org/viz/) reduced to statechart visualisation.

## Why

**XState** [Visualizer](https://xstate.js.org/viz/) is a great tool to understand and share UI state logic, but it can't be used in the private projects as it's a part of external web app. **statechart-viz** tries to solve this problem. It exposes a React component which you can use to render any kind of statechart in any kind of automation workflow (admin app, bot, hooks) and share it in your team.

**IMPORTANT:** this package can only be used to _visualise_ a **statechart**, not to _inspect_ a **state machine**. If you need a state machine inspector, use [**@xstate/inspect**](https://xstate.js.org/docs/packages/xstate-inspect/) package

**IMPORTANT:** this package is just a "placeholder" for upcoming **XState** Inspector and it will not be extended or even maintained in the future.

## Installation

```sh
npm install statechart-viz
```

## Usage

```JSX
import StatechartViz from 'statechart-viz'

const toggleMachineStatechart = {
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: {
      on: { TOGGLE: 'active' },
    },
    active: {
      on: { TOGGLE: 'inactive' },
    },
  },
}

export default function App() {
  return <StatechartViz statechart={toggleMachineStatechart} />
}
```

## Result

![Toggle statechart](assets/images/toggle-statechart-viz.png 'Toggle statechart')
