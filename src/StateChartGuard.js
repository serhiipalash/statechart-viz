import React from 'react'
import styled from 'styled-components'

const StyledSCGuard = styled.div`
  padding: 0 0.5rem;
`

export const StateChartGuard = ({ guard, state }) => {
  const valid =
    guard.predicate && typeof guard.predicate === 'function'
      ? guard.predicate(state.context, state.event, { cond: guard })
      : undefined

  return (
    <StyledSCGuard
      style={{
        color:
          valid === undefined
            ? 'var(--color-gray)'
            : valid
            ? 'var(--color-success)'
            : 'var(--color-failure)',
      }}
    >
      [{guard.type === 'xstate.guard' ? guard.name : guard.type}]
    </StyledSCGuard>
  )
}
