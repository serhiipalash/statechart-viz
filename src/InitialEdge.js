import React from 'react'

import { tracker } from './tracker'
import { relative } from './utils'

export class InitialEdge extends React.Component {
  constructor(...args) {
    super(...args)
    InitialEdge.prototype.__init.call(this)
  }
  __init() {
    this.state = {
      sourceElement: undefined,
    }
  }
  componentDidMount() {
    const { id } = this.props.source
    tracker.listen(id, data => {
      this.setState({ sourceElement: data.element })
    })
  }
  render() {
    const { svgRef, preview } = this.props

    if (!this.state.sourceElement) {
      return null
    }
    const rect = relative(
      this.state.sourceElement.getBoundingClientRect(),
      svgRef
    )
    const { top, left } = rect

    const stroke = preview ? 'var(--color-edge-active)' : 'var(--color-edge)'

    return (
      <g>
        <circle r="4" cx={left - 10} cy={top} fill={stroke} />
        <path
          d={`M ${left - 10},${top} Q ${left - 10},${top + 10} ${left - 1},${
            top + 10
          } L ${left},${top + 10}`}
          stroke={stroke}
          strokeWidth="2"
          fill="none"
          markerEnd={preview ? `url(#marker-preview)` : `url(#marker)`}
        />
      </g>
    )
  }
}
