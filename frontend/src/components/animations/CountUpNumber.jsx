// 📊 7. Admin Dashboard = Live Feeling (CountUp)
import CountUp from 'react-countup'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const CountUpNumber = ({ 
  end, 
  duration = 2, 
  prefix = '', 
  suffix = '',
  decimals = 0,
  separator = ' '
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <span ref={ref}>
      {isInView ? (
        <CountUp
          start={0}
          end={end}
          duration={duration}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          separator={separator}
          useEasing={true}
        />
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  )
}

export default CountUpNumber
