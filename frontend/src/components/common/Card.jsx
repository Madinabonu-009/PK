import './Card.css'

const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  className = '',
  onClick,
  ...props
}) => {
  const isClickable = !!onClick

  return (
    <div
      className={`card card-${variant} card-padding-${padding} ${isClickable ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
)

const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
)

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
