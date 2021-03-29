import React, { Fragment } from 'react'
import { actionTypes } from 'xstate/lib/actions'
import styled from 'styled-components'

const StyledStateChartAction = styled.li`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: baseline;
  max-width: 30ch;
  padding: 0 0.25rem;
  line-height: 1rem;
  font-size: 14.5px;

  &:before {
    font-weight: bold;
    color: var(--color-gray);
    margin-right: 0.25rem;
    font-size: 75%;
    content: attr(data-action-type) ' /';
    white-space: nowrap;
  }
`

const StyledStateChartActionText = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const StateChartAction = ({ action, ...dataAttrs }) => {
  switch (action.type) {
    case actionTypes.assign:
      return typeof action.assignment === 'function' ? (
        <StyledStateChartAction {...dataAttrs} title="assign">
          <strong>assign</strong>
        </StyledStateChartAction>
      ) : (
        <Fragment>
          {Object.keys(action.assignment).map(key => (
            <StyledStateChartAction
              key={key}
              title={`assign ${key}`}
              {...dataAttrs}
            >
              <StyledStateChartActionText>
                <strong>assign</strong> {key}
              </StyledStateChartActionText>
            </StyledStateChartAction>
          ))}
        </Fragment>
      )

    case actionTypes.invoke:
      return (
        <StyledStateChartAction {...dataAttrs} title={`invoke ${action.id}`}>
          <StyledStateChartActionText>{action.id}</StyledStateChartActionText>
        </StyledStateChartAction>
      )

    case actionTypes.send: {
      const sendAction = action

      if (
        sendAction.event.type &&
        sendAction.event.type.indexOf('xstate.after') === 0
      ) {
        return null
      }

      return (
        <StyledStateChartAction
          {...dataAttrs}
          title={`send ${sendAction.event.type} to "${JSON.stringify(
            sendAction.to
          )}"`}
        >
          <StyledStateChartActionText>
            <em>send</em> {sendAction.event.type}{' '}
            {sendAction.to ? `to ${JSON.stringify(sendAction.to)}` : ''}
          </StyledStateChartActionText>
        </StyledStateChartAction>
      )
    }

    case actionTypes.log:
      return (
        <StyledStateChartAction {...dataAttrs} title="log">
          <StyledStateChartActionText>
            <em>log</em>
          </StyledStateChartActionText>
        </StyledStateChartAction>
      )

    default:
      if (
        action.type.indexOf('xstate.') === 0 &&
        action.type !== 'xstate.invoke'
      ) {
        return null
      }

      return (
        <StyledStateChartAction {...dataAttrs} title={action.type}>
          <StyledStateChartActionText>{action.type}</StyledStateChartActionText>
        </StyledStateChartAction>
      )
  }
}
