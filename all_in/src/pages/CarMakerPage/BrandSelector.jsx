import { CUSTOM_BRAND_VALUE } from './carMakerOptions'
import { inputClass, labelClass } from './formStyles'

export default function BrandSelector({ options, value, customBrand, onChange, onCustomBrandChange }) {
  return (
    <div>
      <label htmlFor="car-brand" className={labelClass}>
        Brand
      </label>
      <select id="car-brand" value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {value === CUSTOM_BRAND_VALUE ? (
        <div className="mt-3 space-y-2">
          <label
            htmlFor="car-brand-custom"
            className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Custom brand direction
          </label>
          <input
            id="car-brand-custom"
            value={customBrand}
            onChange={(event) => onCustomBrandChange(event.target.value)}
            placeholder="e.g. art-deco inspired electric marque"
            className={inputClass}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Leave blank to let Groq invent a marque that matches your prompt.
          </p>
        </div>
      ) : null}
    </div>
  )
}
