import { SelectField } from './FormControls'

export default function SelectFieldRow({ fields }) {
  if (fields.length === 0) return null
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <SelectField key={field.id} {...field} />
      ))}
    </div>
  )
}
