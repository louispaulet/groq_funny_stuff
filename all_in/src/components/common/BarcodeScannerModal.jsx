import { useCallback, useEffect, useRef, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'

const SCAN_INTERVAL_MS = 1000
const SUPPORTED_FORMATS = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.ITF,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.UPC_EAN_EXTENSION,
]

function isNotFoundError(error) {
  if (!error) return false
  const normalizedName = `${error.name || ''}`.toLowerCase()
  if (normalizedName.includes('notfound')) return true
  const normalizedMessage = `${error.message || ''}`.toLowerCase()
  return normalizedMessage.includes('no multiformat readers') || normalizedMessage.includes('not found')
}

export default function BarcodeScannerModal({ open, onClose, onDetected }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const readerRef = useRef(null)
  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState('')
  const [initializing, setInitializing] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const lastFeedbackRef = useRef(0)
  const attemptsRef = useRef(0)

  const stopReader = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
    readerRef.current?.reset?.()
    readerRef.current = null
  }, [])

  useEffect(() => {
    if (!open) {
      stopReader()
      setDevices([])
      setDeviceId('')
      setError('')
      setStatus('')
      attemptsRef.current = 0
      lastFeedbackRef.current = 0
      setInitializing(false)
      return
    }

    let cancelled = false

    async function prepareDevices() {
      setError('')
      try {
        const videoInputs = await BrowserMultiFormatReader.listVideoInputDevices()
        if (cancelled) return
        setDevices(videoInputs)
        if (!videoInputs.length) {
          setError('No camera devices were detected. Please connect a camera and try again.')
          return
        }
        setDeviceId((prev) => prev || videoInputs[0]?.deviceId || '')
      } catch (err) {
        console.error('Barcode scanner: unable to enumerate video devices', err)
        if (!cancelled) {
          setError('Unable to access the camera. Please check browser permissions and try again.')
        }
      }
    }

    prepareDevices()

    return () => {
      cancelled = true
      stopReader()
    }
  }, [open, stopReader])

  useEffect(() => {
    if (!open || !deviceId) return undefined

    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, SUPPORTED_FORMATS)
    hints.set(DecodeHintType.TRY_HARDER, true)

    const reader = new BrowserMultiFormatReader(hints, SCAN_INTERVAL_MS)
    readerRef.current = reader
    let active = true

    attemptsRef.current = 0
    lastFeedbackRef.current = 0
    setInitializing(true)
    setError('')
    setStatus('Preparing camera…')

    reader
      .decodeFromVideoDevice(deviceId, videoRef.current, (result, err, controls) => {
        if (!active) return
        if (result) {
          const text = result.getText?.() || ''
          if (text) {
            onDetected?.(text)
          }
          controls?.stop()
          onClose?.()
        }
        if (err) {
          if (isNotFoundError(err)) {
            const now = Date.now()
            if (now - lastFeedbackRef.current >= SCAN_INTERVAL_MS) {
              lastFeedbackRef.current = now
              const nextAttempt = attemptsRef.current + 1
              attemptsRef.current = nextAttempt
              setStatus(`Still scanning… attempt ${nextAttempt}.`)
            }
            setError('')
            return
          }
          console.error('Barcode scanner: decode error', err)
          setError('Unable to read the barcode. Try holding the product steady and ensure it fills the frame.')
          const now = Date.now()
          if (now - lastFeedbackRef.current >= SCAN_INTERVAL_MS) {
            lastFeedbackRef.current = now
            const nextAttempt = attemptsRef.current + 1
            attemptsRef.current = nextAttempt
            setStatus(`Retrying in a second… attempt ${nextAttempt}.`)
          }
        }
      })
      .then((controls) => {
        if (!active) {
          controls?.stop()
          return
        }
        controlsRef.current = controls
        setInitializing(false)
        setStatus('Scanning for a barcode…')
      })
      .catch((err) => {
        if (!active) return
        console.error('Barcode scanner: failed to start video stream', err)
        setError('Unable to start the camera stream. Please verify permissions and refresh the page.')
        setInitializing(false)
      })

    return () => {
      active = false
      setInitializing(false)
      stopReader()
    }
  }, [deviceId, onClose, onDetected, open, stopReader])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Close barcode scanner"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Scan a barcode</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Allow camera access so we can scan the product barcode and look it up on OpenFoodFacts for you.
            </p>
          </div>

          {devices.length > 1 && (
            <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-200">
              Camera
              <select
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(-4)}`}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="relative overflow-hidden rounded-2xl bg-black shadow-inner">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              muted
              playsInline
            />
            {initializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow">
                  Initializing camera…
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {error && (
              <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-200">
                {error}
              </p>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {status || 'Once a barcode is detected it will automatically populate the chat.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
