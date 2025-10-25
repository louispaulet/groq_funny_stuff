import BrandSelector from './BrandSelector'
import DetailOptionsList from './DetailOptionsList'
import FormActions from './FormActions'
import { SelectField, TextField } from './FormControls'
import SelectFieldRow from './SelectFieldRow'
import SummaryPanel from './SummaryPanel'
import { labelClass } from './formStyles'

export default function CarMakerForm({
  brandChoice,
  customBrand,
  color,
  wheelCount,
  bodyStyle,
  carType,
  finish,
  viewpoint,
  scenery,
  lighting,
  detailSelections,
  finishingNotes,
  loading,
  error,
  summary,
  brandOptions,
  bodyStyleOptions,
  carTypeOptions,
  finishOptions,
  viewpointOptions,
  sceneryOptions,
  lightingOptions,
  detailOptions,
  detailIntensityOptions,
  onSubmit,
  onBrandChange,
  onCustomBrandChange,
  onColorChange,
  onWheelCountChange,
  onBodyStyleChange,
  onCarTypeChange,
  onFinishChange,
  onViewpointChange,
  onSceneryChange,
  onLightingChange,
  onFinishingNotesChange,
  onToggleDetail,
  onDetailIntensityChange,
  onClearGallery,
}) {
  const selectFields = [
    { id: 'car-body-style', label: 'Body style', value: bodyStyle, onChange: onBodyStyleChange, options: bodyStyleOptions },
    { id: 'car-type', label: 'Car type', value: carType, onChange: onCarTypeChange, options: carTypeOptions },
    { id: 'car-finish', label: 'Finish', value: finish, onChange: onFinishChange, options: finishOptions },
    { id: 'car-viewpoint', label: 'Viewpoint', value: viewpoint, onChange: onViewpointChange, options: viewpointOptions },
    { id: 'car-scenery', label: 'Scenery', value: scenery, onChange: onSceneryChange, options: sceneryOptions },
    { id: 'car-lighting', label: 'Lighting', value: lighting, onChange: onLightingChange, options: lightingOptions },
  ]

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Configure your hero car</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Shape every visible detail, then let Groq author a cinematic prompt and render the shot on the right.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <BrandSelector
          options={brandOptions}
          value={brandChoice}
          customBrand={customBrand}
          onChange={onBrandChange}
          onCustomBrandChange={onCustomBrandChange}
        />
        <TextField
          id="car-color"
          label="Exterior color"
          value={color}
          onChange={onColorChange}
          placeholder="e.g. deep sapphire blue"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="car-wheel-count"
          label="Wheel count"
          value={wheelCount}
          onChange={onWheelCountChange}
          placeholder="e.g. 4"
        />
        <SelectField {...selectFields[0]} />
      </div>

      <SelectFieldRow fields={selectFields.slice(1, 3)} />
      <SelectFieldRow fields={selectFields.slice(3)} />

      <DetailOptionsList
        options={detailOptions}
        selections={detailSelections}
        intensityOptions={detailIntensityOptions}
        onToggle={onToggleDetail}
        onIntensityChange={onDetailIntensityChange}
      />

      <div>
        <label htmlFor="car-notes" className={labelClass}>
          Extra direction
        </label>
        <textarea
          id="car-notes"
          value={finishingNotes}
          onChange={(event) => onFinishingNotesChange(event.target.value)}
          rows={3}
          placeholder="Optional styling notes visible from the exterior..."
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <FormActions loading={loading} onClearGallery={onClearGallery} />

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <SummaryPanel summary={summary} />
    </form>
  )
}
