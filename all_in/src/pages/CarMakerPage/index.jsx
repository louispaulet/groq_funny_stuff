import CarMakerForm from './CarMakerForm'
import CarMakerGallery from './CarMakerGallery'
import CarMakerPrompt from './CarMakerPrompt'
import { CAR_GALLERY_LIMIT } from '../../lib/carGalleryCookie'
import { formatTimestamp } from './carMakerUtils'
import { useCarGallery } from './useCarGallery'
import { useCarGeneration } from './useCarGeneration'
import { useCarMakerFormState } from './useCarMakerFormState'

export default function CarMakerPage({ experience }) {
  const { fields, setters, summary, resolvedBrand, toggleDetail, updateDetailIntensity, options } = useCarMakerFormState()
  const { gallery, addEntry, clear } = useCarGallery(CAR_GALLERY_LIMIT)
  const { loading, error, prompt, imageUrl, generate } = useCarGeneration({
    experience,
    configuration: {
      brand: resolvedBrand,
      color: fields.color,
      wheelCount: fields.wheelCount,
      bodyStyle: fields.bodyStyle,
      carType: fields.carType,
      finish: fields.finish,
      viewpoint: fields.viewpoint,
      scenery: fields.scenery,
      lighting: fields.lighting,
      detailSelections: fields.detailSelections,
      finishingNotes: fields.finishingNotes,
    },
    summary,
    detailOptions: options.detailOptions,
    addGalleryEntry: addEntry,
  })

  const formProps = {
    brandChoice: fields.brandChoice,
    customBrand: fields.customBrand,
    color: fields.color,
    wheelCount: fields.wheelCount,
    bodyStyle: fields.bodyStyle,
    carType: fields.carType,
    finish: fields.finish,
    viewpoint: fields.viewpoint,
    scenery: fields.scenery,
    lighting: fields.lighting,
    detailSelections: fields.detailSelections,
    finishingNotes: fields.finishingNotes,
    loading,
    error,
    summary,
    brandOptions: options.brandOptions,
    bodyStyleOptions: options.bodyStyleOptions,
    carTypeOptions: options.carTypeOptions,
    finishOptions: options.finishOptions,
    viewpointOptions: options.viewpointOptions,
    sceneryOptions: options.sceneryOptions,
    lightingOptions: options.lightingOptions,
    detailOptions: options.detailOptions,
    detailIntensityOptions: options.detailIntensityOptions,
    onSubmit: generate,
    onBrandChange: setters.setBrandChoice,
    onCustomBrandChange: setters.setCustomBrand,
    onColorChange: setters.setColor,
    onWheelCountChange: setters.setWheelCount,
    onBodyStyleChange: setters.setBodyStyle,
    onCarTypeChange: setters.setCarType,
    onFinishChange: setters.setFinish,
    onViewpointChange: setters.setViewpoint,
    onSceneryChange: setters.setScenery,
    onLightingChange: setters.setLighting,
    onFinishingNotesChange: setters.setFinishingNotes,
    onToggleDetail: toggleDetail,
    onDetailIntensityChange: updateDetailIntensity,
    onClearGallery: clear,
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <CarMakerForm {...formProps} />
      <div className="space-y-6">
        <CarMakerPrompt prompt={prompt} imageUrl={imageUrl} />
        <CarMakerGallery gallery={gallery} limit={CAR_GALLERY_LIMIT} formatTimestamp={formatTimestamp} />
      </div>
    </section>
  )
}
