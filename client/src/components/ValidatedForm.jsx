import { Children, cloneElement, Fragment, isValidElement, useId, useState } from 'react'
import { getFieldError } from '../utils/validation.js'

export default function ValidatedForm({ children, onSubmit, ...props }) {
  const [errors, setErrors] = useState([])
  const errorId = useId()

  function validate(form) {
    const nextErrors = []
    for (const field of form.elements) {
      const message = getFieldError(field)
      if (message) {
        nextErrors.push({ field, key: field.dataset.validationField, message })
      }
    }
    setErrors(nextErrors)
    return nextErrors
  }

  function renderFields(nodes, parentKey = 'field') {
    return Children.map(nodes, (child, index) => {
      if (!isValidElement(child)) return child

      const key = `${parentKey}-${child.key ?? index}`
      if (['input', 'select', 'textarea'].includes(child.type)) {
        const message = errors.find((error) => error.key === key)?.message
        const fieldErrorId = `${errorId}-${key}`
        const describedBy = [child.props['aria-describedby'], message && fieldErrorId]
          .filter(Boolean).join(' ') || undefined

        return (
          <Fragment key={key}>
            {cloneElement(child, {
              'data-validation-field': key,
              'aria-invalid': message ? true : child.props['aria-invalid'],
              'aria-describedby': describedBy,
            })}
            {message && (
              <p id={fieldErrorId} role="alert" className="mt-2 text-sm text-red-300">
                {message}
              </p>
            )}
          </Fragment>
        )
      }

      return child.props.children
        ? cloneElement(child, {}, renderFields(child.props.children, key))
        : child
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(event.currentTarget)
    if (nextErrors.length) {
      nextErrors[0].field.focus()
      return
    }
    onSubmit(event)
  }

  return (
    <form
      {...props}
      noValidate
      onSubmit={handleSubmit}
      onChange={(event) => {
        if (errors.length) validate(event.currentTarget)
      }}
    >
      {renderFields(children)}
    </form>
  )
}
