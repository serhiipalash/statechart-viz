import React, { memo } from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { getEdges } from 'xstate/lib/graph'
import { serializeEdge, initialStateNodes } from './utils'
import { Edge } from './Edge'
import { InitialEdge } from './InitialEdge'
import { StateChartNode } from './StateChartNode'

import { Machine } from 'xstate'

const StyledVisualization = styled.div`
  --color-app-background: #fff;
  --color-border: #c9c9c9;
  --color-primary: rgba(87, 176, 234, 1);
  --color-primary-faded: rgba(87, 176, 234, 0.5);
  --color-primary-shadow: rgba(87, 176, 234, 0.1);
  --color-link: rgba(87, 176, 234, 1);
  --color-disabled: #b3b3b3;
  --color-edge: #c9c9c9;
  --color-edge-active: var(--color-primary);
  --color-secondary: rgba(255, 152, 0, 1);
  --color-secondary-light: rgba(255, 152, 0, 0.5);
  --color-sidebar: #272722;
  --color-gray: #555;
  --color-failure: #ee7170;
  --color-success: #31ae00;
  --radius: 0.2rem;
  --border-width: 2px;
  --sidebar-width: 25rem;
  --shadow: 0 0.5rem 1rem var(--shadow-color, rgba(0, 0, 0, 0.2));
  --duration: 0.2s;
  --easing: cubic-bezier(0.5, 0, 0.5, 1);
  position: relative;
  max-height: inherit;
  overflow-y: auto;
  font-size: 16px;
`

function StateChartViz({ statechart }) {
  const [svgRef, setSvgRef] = useState(null)

  const machine = statechart ? Machine(statechart) : null

  if (!machine) {
    return null
  }

  let edges

  try {
    edges = getEdges(machine)
  } catch (err) {
    edges = null

    console.error(err)
  }

  if (!edges) {
    return null
  }

  return (
    <StyledVisualization>
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          // @ts-ignore
          '--color': 'gray',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
        ref={setSvgRef}
      >
        <defs>
          <marker
            id="marker"
            markerWidth="4"
            markerHeight="4"
            refX="2"
            refY="2"
            markerUnits="strokeWidth"
            orient="auto"
          >
            <path d="M0,0 L0,4 L4,2 z" fill="var(--color-edge)" />
          </marker>

          <marker
            id="marker-preview"
            markerWidth="4"
            markerHeight="4"
            refX="2"
            refY="2"
            markerUnits="strokeWidth"
            orient="auto"
          >
            <path d="M0,0 L0,4 L4,2 z" fill="var(--color-edge-active)" />
          </marker>
        </defs>

        {edges.map(edge => {
          if (!svgRef) {
            return null
          }

          return <Edge key={serializeEdge(edge)} svg={svgRef} edge={edge} />
        })}

        {initialStateNodes(machine).map((initialStateNode, i) => {
          if (!svgRef) {
            return null
          }

          return (
            <InitialEdge
              key={`${initialStateNode.id}_${i}`}
              source={initialStateNode}
              svgRef={svgRef}
            />
          )
        })}
      </svg>

      <StateChartNode
        stateNode={machine}
        current={machine.initialState}
        level={0}
      />
    </StyledVisualization>
  )
}

function areStatechartPropsEqual(prev, next) {
  return prev.statechart === next.statechart
}

const memoizedStateChartViz = memo(StateChartViz, areStatechartPropsEqual)

export default memoizedStateChartViz
