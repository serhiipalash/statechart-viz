import StatechartViz from '~/src'
import { useEffect, useState } from 'react'
import toggleMachineStatchart from '~/assets/statecharts/toggle'
import fetchMachineStatechart from '~/assets/statecharts/fetch'

export default function App() {
  const [value, setValue] = useState(toggleMachineStatchart)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setValue(fetchMachineStatechart)
    }, 3000)

    const interval = setInterval(() => {
      setCount(prev => prev++)
    })

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  console.info('count: ', count)

  return <StatechartViz statechart={value} />
}
