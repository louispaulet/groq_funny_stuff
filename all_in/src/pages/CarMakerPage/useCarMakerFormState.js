import { useMemo, useState } from 'react'
import {
  BRAND_OPTIONS,
  BODY_STYLE_OPTIONS,
  CAR_TYPE_OPTIONS,
  CUSTOM_BRAND_VALUE,
  DETAIL_INTENSITY_OPTIONS,
  DETAIL_OPTIONS,
  FINISH_OPTIONS,
  LIGHTING_OPTIONS,
  SCENERY_OPTIONS,
  VIEWPOINT_OPTIONS,
} from './carMakerOptions'
import { initializeDetailSelections, summarizeConfiguration } from './carMakerUtils'

export function useCarMakerFormState() {
  const [brandChoice, setBrandChoice] = useState(BRAND_OPTIONS[0].value)
  const [customBrand, setCustomBrand] = useState('')
  const [color, setColor] = useState('candy apple red')
  const [wheelCount, setWheelCount] = useState('4')
  const [bodyStyle, setBodyStyle] = useState(BODY_STYLE_OPTIONS[0].value)
  const [carType, setCarType] = useState(CAR_TYPE_OPTIONS[0].value)
  const [finish, setFinish] = useState(FINISH_OPTIONS[0].value)
  const [viewpoint, setViewpoint] = useState(VIEWPOINT_OPTIONS[0].value)
  const [scenery, setScenery] = useState(SCENERY_OPTIONS[0].value)
  const [lighting, setLighting] = useState(LIGHTING_OPTIONS[0].value)
  const [detailSelections, setDetailSelections] = useState(() => initializeDetailSelections(DETAIL_OPTIONS))
  const [finishingNotes, setFinishingNotes] = useState('')

  const resolvedBrand =
    brandChoice === CUSTOM_BRAND_VALUE
      ? customBrand.trim() || 'bespoke concept car brand guided by the prompt'
      : brandChoice

  const summary = useMemo(
    () =>
      summarizeConfiguration({
        brand: resolvedBrand,
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
        detailOptions: DETAIL_OPTIONS,
      }),
    [
      resolvedBrand,
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
    ],
  )

  function toggleDetail(id) {
    setDetailSelections((current) => ({
      ...current,
      [id]: { ...current[id], enabled: !current[id]?.enabled },
    }))
  }

  function updateDetailIntensity(id, intensity) {
    setDetailSelections((current) => ({
      ...current,
      [id]: { ...current[id], intensity },
    }))
  }

  return {
    fields: {
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
    },
    setters: {
      setBrandChoice,
      setCustomBrand,
      setColor,
      setWheelCount,
      setBodyStyle,
      setCarType,
      setFinish,
      setViewpoint,
      setScenery,
      setLighting,
      setFinishingNotes,
    },
    summary,
    resolvedBrand,
    toggleDetail,
    updateDetailIntensity,
    options: {
      brandOptions: BRAND_OPTIONS,
      bodyStyleOptions: BODY_STYLE_OPTIONS,
      carTypeOptions: CAR_TYPE_OPTIONS,
      finishOptions: FINISH_OPTIONS,
      viewpointOptions: VIEWPOINT_OPTIONS,
      sceneryOptions: SCENERY_OPTIONS,
      lightingOptions: LIGHTING_OPTIONS,
      detailOptions: DETAIL_OPTIONS,
      detailIntensityOptions: DETAIL_INTENSITY_OPTIONS,
    },
  }
}
