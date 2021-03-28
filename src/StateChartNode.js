import React, { Fragment, useState, useRef, useEffect } from 'react'

import styled from 'styled-components'
import { serializeEdge, stateActions, getEventDelay } from './utils'
import { EventName } from './EventName'
import { tracker } from './tracker'
import { getEdges } from 'xstate/lib/graph'

import { StateChartAction } from './StateChartAction'
import { StateChartGuard } from './StateChartGuard'

const StyledChildStates = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  min-height: 1rem;
`

const StyledToken = styled.div`
  background: var(--color-border);
  color: inherit;
  font-weight: bold;
`

const StyledStateNodeHeader = styled.header`
  z-index: 1;
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  font-size: 15px;
  // position: sticky;
  // top: calc(var(--depth, 0) * 1rem);
  // background: rgba(255, 255, 255, 0.5);

  > * {
    padding: 0.25rem;
  }

  &:before {
    display: none;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: var(--color-app-background);
  }

  &[data-type-symbol='history' i] {
    --symbol-color: orange;
  }

  &[data-type-symbol] {
    padding-right: 5em;

    &:after {
      content: attr(data-type-symbol);
      position: absolute;
      top: 0;
      right: 0;
      border-bottom-left-radius: 0.25rem;
      background: var(--symbol-color, gray);
      color: white;
      padding: 0.25rem 0.5rem;
      font-weight: bold;
      font-size: 0.75em;
    }
  }
`

const StyledStateNode = styled.div`
  --color-shadow: rgba(0, 0, 0, 0.05);
  --color-node-border: var(--color-border);
  --state-event-gap: 0.5rem;
  position: relative;
  margin: 0.5rem;
  flex-grow: 0;
  flex-shrink: 1;
  // background: rgba(255, 255, 255, 0.5);
  color: #313131;
  min-height: 1rem;
  display: inline-grid;
  grid-template-columns: min-content auto;
  grid-column-gap: var(--state-event-gap);
  border: none;

  &[data-type~='machine'] {
    display: grid;
    border: none;
    box-shadow: none;
    width: 100%;
    background: none;
    // margin: 2rem 0;
    grid-template-columns: auto 1fr;

    > ${StyledStateNodeHeader} {
      left: 1rem;
      font-size: 1rem;
    }

    > ul {
      padding-right: 1.5rem;
    }
  }
  &:not([data-type~='machine']) {
    // opacity: 0.75;
  }

  &:not([data-open='true']) ${StyledChildStates} > * {
    display: none;
  }

  &[data-active] {
    --color-node-border: var(--color-primary);
    --color-shadow: var(--color-primary-shadow);
    opacity: 1;

    > ${StyledStateNodeHeader} {
      color: var(--color-primary);
    }
  }

  &[data-type~='parallel'] {
    grid-template-columns: auto 1fr;
  }

  &[data-type~='final'] {
    > div:first-child {
      position: relative;
    }

    > div:first-child:after {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      width: calc(100% + 6px);
      height: calc(100% + 6px);
      border: 2px solid var(--color-node-border);
      pointer-events: none;
      border-radius: 6px;
      z-index: 1;
    }
  }

  &:before {
    content: attr(data-key);
    color: transparent;
    visibility: hidden;
    height: 1px;
    display: block;
  }

  &:hover {
    z-index: 2;
  }
`

const StyledStateNodeState = styled.div`
  grid-column: 1 / 2;
  align-self: self-start;
  border-radius: 0.25rem;
  border: 2px solid var(--color-node-border);
  text-align: left;
  box-shadow: 0 0.5rem 1rem var(--color-shadow);
  color: #313131;
  min-height: 1rem;
  z-index: 1;
  transition: border-color var(--duration) var(--easing);

  &[data-type~='parallel'] > ${StyledChildStates} > ${StyledStateNode} > & {
    border-style: dashed;
  }
`

const StyledStateNodeEvents = styled.div`
  grid-column: 2 / 3;
  padding: 0;
  margin-right: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &[data-level='0'] {
    margin-right: 0;
  }

  &:empty {
    display: none;
  }
`

export const StyledStateNodeActions = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-bottom: 0.5rem;
  z-index: 1;

  &:empty {
    display: none;
  }
`

const StyledEventDot = styled.div`
  --size: 0.5rem;
  position: relative;
  display: inline-block;
  height: var(--size);
  width: var(--size);
  border-radius: 50%;
  background-color: white;

  &:before {
    content: '';
    position: absolute;
    top: -0.25rem;
    right: 0;
    width: calc(100% + 0.5rem);
    height: calc(100% + 0.5rem);
    border-radius: inherit;
    background-color: var(--color-event);
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0.25rem;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: white;
  }
`

const StyledEventButtonLabel = styled.label`
  white-space: nowrap;
`

const StyledEventButton = styled.button`
  --color-event: var(--color-primary);
  padding: 0;
  position: relative;
  appearance: none;
  border: 2px solid var(--color-event);
  background: white;
  color: white;
  font-size: 0.75em;
  font-weight: bold;
  border-radius: 2rem;
  line-height: 1;
  display: inline-flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;

  > * {
    padding: 0.15rem 0.35rem;
  }

  > label {
    background-color: var(--color-event);
    text-align: left;
    transition: background var(--duration) var(--easing);

    &:empty {
      display: none;
    }

    &:first-child:last-child {
      width: 100%;
    }
  }

  &:not(:disabled):not([data-builtin]):hover {
    --color-event: var(--color-primary);
  }

  &:disabled {
    --color-event: var(--color-disabled);
  }

  &:focus {
    outline: none;
  }

  // duration
  &[data-delay] {
    > * {
      background: none;
    }

    &:not([disabled]):before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--color-event);
      animation: move-left calc(var(--delay) * 1ms) linear;
      z-index: 0;
      opacity: 0.5;
    }
  }

  @keyframes move-left {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: none;
    }
  }

  &[data-builtin] {
    color: black;
    font-style: italic;
  }

  &[data-transient] {
    > ${StyledEventDot} {
      order: -1;
    }
  }
`

const StyledEvent = styled.div`
  list-style: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  &:not(:last-child) {
    margin-bottom: 0.25rem;
  }

  &[data-disabled] > ${StyledStateNodeActions} {
    opacity: 0.7;
  }

  &[data-internal] {
  }
`

export const StateChartNode = props => {
  const stateRef = useRef()

  useEffect(() => {
    tracker.update(props.stateNode.id, stateRef.current)
  })

  const [timerRestarts, setTimerRestarts] = useState(0)

  const { stateNode, current } = props

  useEffect(() => {
    if (
      current.actions.some(action => {
        return (
          action.type === 'xstate.cancel' &&
          action.sendId.indexOf(stateNode.id) > 0
        )
      })
    ) {
      setTimerRestarts(timerRestarts + 1)
    }
  }, [current])

  const isActive =
    !stateNode.parent || current.matches(stateNode.path.join('.')) || undefined

  const dataType = stateNode.parent
    ? stateNode.type
    : `machine ${stateNode.type}`

  return (
    <StyledStateNode
      key={stateNode.id}
      data-key={stateNode.key}
      data-type={dataType}
      data-active={isActive && stateNode.parent}
      data-open={true}
      ref={stateRef}
    >
      <StyledStateNodeState data-id={stateNode.id} data-type={dataType}>
        <StyledStateNodeHeader
          style={{
            // @ts-ignore
            '--depth': stateNode.path.length,
          }}
        >
          {dataType === 'history' && <StyledToken>H</StyledToken>}
          <strong title={`#${stateNode.id}`}>{stateNode.key}</strong>
        </StyledStateNodeHeader>
        {!!stateActions(stateNode).length && (
          <Fragment>
            <StyledStateNodeActions>
              {stateNode.definition.onEntry.map(action => {
                const actionString = action.type

                return (
                  <StateChartAction
                    key={actionString}
                    data-action-type="entry"
                    action={action}
                  />
                )
              })}
            </StyledStateNodeActions>
            <StyledStateNodeActions>
              {stateNode.definition.onExit.map(action => {
                const actionString = action.type
                return (
                  <StateChartAction
                    key={actionString}
                    data-action-type="exit"
                    action={action}
                  />
                )
              })}
            </StyledStateNodeActions>
          </Fragment>
        )}
        <StyledStateNodeActions data-title="invoke">
          {stateNode.invoke.map(invocation => {
            return (
              <StateChartAction
                key={invocation.id}
                data-action-type="invoke"
                action={invocation}
              >
                {invocation.id}
              </StateChartAction>
            )
          })}
        </StyledStateNodeActions>
        {Object.keys(stateNode.states).length ? (
          <StyledChildStates>
            {Object.keys(stateNode.states || []).map(key => {
              const childStateNode = stateNode.states[key]

              return (
                <StateChartNode
                  stateNode={childStateNode}
                  level={props.level + 1}
                  current={current}
                  key={childStateNode.id}
                  onSelectServiceId={props.onSelectServiceId}
                />
              )
            })}
          </StyledChildStates>
        ) : null}
      </StyledStateNodeState>
      <StyledStateNodeEvents data-level={props.level}>
        {getEdges(stateNode, { depth: 0 }).map(edge => {
          const { event: ownEvent } = edge
          const isBuiltInEvent = ownEvent.indexOf('xstate.') === 0
          const guard = edge.transition.cond
          const valid =
            guard && guard.predicate
              ? guard.predicate(current.context, current.event, {
                  cond: guard,
                })
              : true
          const disabled =
            !valid || !isActive || current.nextEvents.indexOf(ownEvent) === -1
          // || (!!edge.cond &&
          //   typeof edge.cond === 'function' &&
          //   !edge.cond(current.context, { type: ownEvent }, { cond: undefined, }));

          let delay = isBuiltInEvent ? getEventDelay(ownEvent) : false

          if (typeof delay === 'string') {
            const delayExpr = stateNode.machine.options.delays[delay]
            delay =
              typeof delayExpr === 'number'
                ? delayExpr
                : delayExpr(current.context, current.event)
          }

          const isTransient = ownEvent === ''

          return (
            <StyledEvent
              style={{
                //@ts-ignore
                '--delay': delay || 0,
              }}
              data-disabled={disabled || undefined}
              key={serializeEdge(edge)}
              data-internal={edge.transition.internal || undefined}
            >
              <StyledEventButton
                disabled={disabled}
                data-delay={edge.transition.delay}
                key={timerRestarts}
                data-builtin={isBuiltInEvent || undefined}
                data-transient={isTransient || undefined}
                data-id={serializeEdge(edge)}
                title={ownEvent}
              >
                <StyledEventButtonLabel>
                  <EventName event={ownEvent} />
                </StyledEventButtonLabel>
                {edge.transition.cond && (
                  <StateChartGuard
                    guard={edge.transition.cond}
                    state={current}
                  />
                )}
              </StyledEventButton>
              {!!(edge.transition.actions.length || edge.transition.cond) && (
                <StyledStateNodeActions>
                  {edge.transition.actions.map((action, i) => {
                    return (
                      <StateChartAction
                        key={i}
                        action={action}
                        data-action-type="do"
                      />
                    )
                  })}
                </StyledStateNodeActions>
              )}
            </StyledEvent>
          )
        })}
      </StyledStateNodeEvents>
    </StyledStateNode>
  )
}
