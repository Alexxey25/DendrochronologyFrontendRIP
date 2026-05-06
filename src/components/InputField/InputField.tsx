import { Button } from 'react-bootstrap'
import './InputField.css'

interface Props {
  value: string
  setValue: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  placeholder?: string
  buttonTitle?: string
  /** Подсказки при вводе (нативный datalist) */
  suggestions?: string[]
}

export default function InputField({
  value,
  setValue,
  onSubmit,
  loading,
  placeholder,
  buttonTitle = 'Искать',
  suggestions,
}: Props) {
  const suggestionOptions = suggestions ?? []
  const suggestionsListId = suggestionOptions.length > 0
    ? 'construction-search-hints'
    : undefined

  return (
    <div className="inputField">
      {suggestionsListId ? (
        <datalist id={suggestionsListId}>
          {suggestionOptions.map((title) => (
            <option key={title} value={title} />
          ))}
        </datalist>
      ) : null}
      <input
        className="inputField-input"
        value={value}
        placeholder={placeholder}
        list={suggestionsListId}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button className="inputField-btn" disabled={loading} onClick={onSubmit} type="button">
        {buttonTitle}
      </Button>
    </div>
  )
}
