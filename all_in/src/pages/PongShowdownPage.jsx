import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRemoteObject } from '../lib/objectApi'

const CANVAS_WIDTH = 720
const CANVAS_HEIGHT = 420
const PADDLE_WIDTH = 12
const PADDLE_HEIGHT = 96
const PADDLE_MARGIN = 32
const BALL_RADIUS = 10
const PADDLE_SPEED = 300
const BALL_SPEED = 280
const BALL_ACCELERATION = 18
const COLLISION_COOLDOWN = 0.12
const THEME_OBJECT_TYPE = 'pong_theme'
const THEME_MODEL_ID = 'meta-llama/llama-4-maverick-17b-128e-instruct'

const THEME_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    styleName: { type: 'string' },
    stylePrompt: { type: 'string' },
    colors: {
      type: 'array',
      minItems: 4,
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          role: {
            type: 'string',
            enum: ['background', 'leftPaddle', 'rightPaddle', 'ball', 'accent', 'scoreText'],
          },
          hex: { type: 'string' },
          prompt: { type: 'string' },
        },
        required: ['role', 'hex', 'prompt'],
      },
    },
  },
  required: ['styleName', 'stylePrompt', 'colors'],
}

const DEFAULT_THEME = {
  styleName: 'Neon Baseline',
  stylePrompt: 'Default neon training wheels for the first serve.',
  colors: [
    { role: 'background', hex: '#0f172a', prompt: 'Deep navy void so the rest of the palette glows.' },
    { role: 'leftPaddle', hex: '#f87171', prompt: 'Cherry paddle for Player One swagger.' },
    { role: 'rightPaddle', hex: '#34d399', prompt: 'Mint paddle for Player Two chill.' },
    { role: 'ball', hex: '#facc15', prompt: 'Electric canary ball to track the volley.' },
    { role: 'accent', hex: '#38bdf8', prompt: 'Icy cyan grid lines and HUD glints.' },
    { role: 'scoreText', hex: '#e2e8f0', prompt: 'Frosted typography keeps the score readable.' },
  ],
}

const ROLE_DEFAULTS = {
  background: '#0f172a',
  leftPaddle: '#ef4444',
  rightPaddle: '#22d3ee',
  ball: '#facc15',
  accent: '#38bdf8',
  scoreText: '#f8fafc',
}

const ROLE_LABELS = {
  background: 'Background',
  leftPaddle: 'Left Paddle',
  rightPaddle: 'Right Paddle',
  ball: 'Ball',
  accent: 'Accent & Lines',
  scoreText: 'Score Text',
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function sanitizeHex(hex) {
  if (typeof hex !== 'string') return null
  const trimmed = hex.trim()
  if (!trimmed) return null
  const match = trimmed.match(/#?[0-9a-fA-F]{6}/)
  if (!match) return null
  return match[0].startsWith('#') ? match[0].toUpperCase() : `#${match[0].toUpperCase()}`
}

function hexToRgba(hex, alpha) {
  const sanitized = sanitizeHex(hex)
  if (!sanitized) return `rgba(15, 23, 42, ${alpha})`
  const value = sanitized.slice(1)
  const bigint = Number.parseInt(value, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`
}

function normalizeThemePayload(payload) {
  const styleName = typeof payload?.styleName === 'string' ? payload.styleName.trim() : ''
  const stylePrompt = typeof payload?.stylePrompt === 'string' ? payload.stylePrompt.trim() : ''
  const colors = Array.isArray(payload?.colors) ? payload.colors : []
  const normalizedColors = colors
    .map((color) => {
      const role = typeof color?.role === 'string' ? color.role : ''
      const hex = sanitizeHex(color?.hex)
      const prompt = typeof color?.prompt === 'string' ? color.prompt.trim() : ''
      if (!role || !hex || !prompt) return null
      if (!Object.prototype.hasOwnProperty.call(ROLE_DEFAULTS, role)) return null
      return { role, hex, prompt }
    })
    .filter(Boolean)

  if (!normalizedColors.length) {
    return DEFAULT_THEME
  }

  return {
    styleName: styleName || 'Untitled Theme',
    stylePrompt: stylePrompt || 'A surprise volley of color from the model.',
    colors: normalizedColors,
  }
}

function buildThemePrompt({ reason, scores, previousStyle }) {
  const reasonBlurb =
    reason === 'left-paddle'
      ? 'Left paddle just made contact—reward the defense with a fresh look.'
      : reason === 'right-paddle'
        ? 'Right paddle returned the shot—give the offense a new flair.'
        : reason === 'score-left'
          ? 'Left side scored. Celebrate with a confident palette shift.'
          : reason === 'score-right'
            ? 'Right side scored. Cue a comeback-ready palette.'
            : 'Opening serve deserves a stylish stage.'

  const avoidReuse = previousStyle ? `Avoid reusing the exact style name "${previousStyle}".` : ''

  return [
    'You design vivid, legible themes for a web-based Pong arena.',
    'Return JSON that satisfies the provided schema. Provide between four and six colors.',
    'Each color entry must have a role from the allowed enum, a #RRGGBB hex value, and a prompt sentence describing how the color looks in the scene.',
    'Ensure the background contrasts strongly with paddles and ball for accessibility.',
    'Let the accent color cover center line, particle sparks, and UI chrome.',
    `Current score: Left ${scores.left} · Right ${scores.right}.`,
    reasonBlurb,
    'Keep styleName to 2-4 words, and let stylePrompt be one energetic sentence about the vibe.',
    'Make each palette feel distinct from the previous round and embrace playful arcade moods.',
    avoidReuse,
  ]
    .filter(Boolean)
    .join('\n')
}

function resolveColorMap(theme) {
  const map = { ...ROLE_DEFAULTS }
  if (!theme?.colors) return map
  theme.colors.forEach((color) => {
    if (color?.role && sanitizeHex(color?.hex)) {
      map[color.role] = sanitizeHex(color.hex)
    }
  })
  return map
}

function useThemeManager() {
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([
    {
      theme: DEFAULT_THEME,
      reason: 'Opening serve',
      timestamp: Date.now(),
    },
  ])
  const fetchingRef = useRef(false)
  const themeRef = useRef(DEFAULT_THEME)
  const pendingReasonRef = useRef('initial')

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  const requestTheme = useCallback(async ({ reason, scores }) => {
    if (fetchingRef.current) {
      pendingReasonRef.current = reason
      return
    }

    fetchingRef.current = true
    pendingReasonRef.current = 'initial'
    setLoading(true)
    setError('')

    try {
      const prompt = buildThemePrompt({ reason, scores, previousStyle: themeRef.current?.styleName })
      const { payload } = await createRemoteObject({
        structure: THEME_STRUCTURE,
        objectType: THEME_OBJECT_TYPE,
        prompt,
        strict: true,
        model: THEME_MODEL_ID,
      })
      const normalized = normalizeThemePayload(payload)
      setTheme(normalized)
      setHistory((prev) => [
        { theme: normalized, reason, timestamp: Date.now(), prompt },
        ...prev,
      ].slice(0, 8))
    } catch (err) {
      console.error('Theme request failed', err)
      setError(err?.message || 'Theme request failed')
    } finally {
      setLoading(false)
      fetchingRef.current = false
      if (pendingReasonRef.current !== 'initial') {
        const nextReason = pendingReasonRef.current
        pendingReasonRef.current = 'initial'
        requestTheme({ reason: nextReason, scores })
      }
    }
  }, [])

  return {
    theme,
    loading,
    error,
    history,
    requestTheme,
  }
}

export default function PongShowdownPage() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const lastTimestampRef = useRef(null)
  const ballRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: BALL_SPEED,
    vy: BALL_SPEED * 0.6,
    cooldown: 0,
  })
  const leftPaddleRef = useRef({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 })
  const rightPaddleRef = useRef({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 })
  const scoresRef = useRef({ left: 0, right: 0 })
  const [scores, setScores] = useState({ left: 0, right: 0 })
  const [statusMessage, setStatusMessage] = useState('Spooling up the arena…')

  const { theme, loading, error, history, requestTheme } = useThemeManager()
  const themeMap = useMemo(() => resolveColorMap(theme), [theme])
  const themeMapRef = useRef(themeMap)

  useEffect(() => {
    themeMapRef.current = themeMap
  }, [themeMap])

  const resetBall = useCallback((direction) => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: (direction === 'left' ? -1 : 1) * BALL_SPEED,
      vy: (Math.random() > 0.5 ? 1 : -1) * (BALL_SPEED * (0.4 + Math.random() * 0.4)),
      cooldown: COLLISION_COOLDOWN,
    }
  }, [])

  const triggerTheme = useCallback(
    (reason) => {
      const reasonCopy = reason
      requestTheme({ reason: reasonCopy, scores: scoresRef.current })
      const descriptions = {
        'left-paddle': 'Left paddle deflects the rally—palette remix unlocked.',
        'right-paddle': 'Right paddle counters in style—new colors inbound.',
        'score-left': 'Left side banks a point and claims a fresh vibe.',
        'score-right': 'Right side scores and the court reinvents itself.',
        initial: 'Opening serve ignites the palette generator.',
      }
      setStatusMessage(descriptions[reasonCopy] || 'New theme charging up…')
    },
    [requestTheme],
  )

  useEffect(() => {
    triggerTheme('initial')
  }, [triggerTheme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    lastTimestampRef.current = null

    const update = (timestamp) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000
      lastTimestampRef.current = timestamp

      const ball = ballRef.current
      const left = leftPaddleRef.current
      const right = rightPaddleRef.current

      ball.cooldown = Math.max(0, ball.cooldown - delta)

      // AI paddles track the ball gently
      const leftCenter = left.y + PADDLE_HEIGHT / 2
      const rightCenter = right.y + PADDLE_HEIGHT / 2
      const targetEase = 0.6
      const leftTarget = ball.y - PADDLE_HEIGHT * 0.25
      const rightTarget = ball.y + PADDLE_HEIGHT * 0.25

      if (leftCenter < leftTarget) {
        left.y += PADDLE_SPEED * targetEase * delta
      } else if (leftCenter > leftTarget) {
        left.y -= PADDLE_SPEED * targetEase * delta
      }

      if (rightCenter < rightTarget) {
        right.y += PADDLE_SPEED * targetEase * delta
      } else if (rightCenter > rightTarget) {
        right.y -= PADDLE_SPEED * targetEase * delta
      }

      left.y = clamp(left.y, 0, CANVAS_HEIGHT - PADDLE_HEIGHT)
      right.y = clamp(right.y, 0, CANVAS_HEIGHT - PADDLE_HEIGHT)

      ball.x += ball.vx * delta
      ball.y += ball.vy * delta

      if (ball.y - BALL_RADIUS <= 0 && ball.vy < 0) {
        ball.y = BALL_RADIUS
        ball.vy = Math.abs(ball.vy)
      } else if (ball.y + BALL_RADIUS >= CANVAS_HEIGHT && ball.vy > 0) {
        ball.y = CANVAS_HEIGHT - BALL_RADIUS
        ball.vy = -Math.abs(ball.vy)
      }

      const handlePaddleCollision = (paddle, side) => {
        if (ball.cooldown > 0) return false
        const paddleTop = paddle.y
        const paddleBottom = paddle.y + PADDLE_HEIGHT
        if (ball.y + BALL_RADIUS < paddleTop || ball.y - BALL_RADIUS > paddleBottom) {
          return false
        }
        if (side === 'left') {
          if (ball.x - BALL_RADIUS <= PADDLE_MARGIN + PADDLE_WIDTH && ball.vx < 0) {
            ball.x = PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS
            ball.vx = Math.abs(ball.vx) + BALL_ACCELERATION
          } else {
            return false
          }
        } else if (ball.x + BALL_RADIUS >= CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH && ball.vx > 0) {
          ball.x = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_RADIUS
          ball.vx = -(Math.abs(ball.vx) + BALL_ACCELERATION)
        } else {
          return false
        }
        const relativeIntersect = (ball.y - (paddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)
        ball.vy += relativeIntersect * 120
        ball.cooldown = COLLISION_COOLDOWN
        return true
      }

      const leftHit = handlePaddleCollision(left, 'left')
      const rightHit = handlePaddleCollision(right, 'right')

      if (leftHit) {
        triggerTheme('left-paddle')
      } else if (rightHit) {
        triggerTheme('right-paddle')
      }

      if (ball.x + BALL_RADIUS < 0) {
        const nextScores = { left: scoresRef.current.left, right: scoresRef.current.right + 1 }
        scoresRef.current = nextScores
        setScores({ ...nextScores })
        triggerTheme('score-right')
        resetBall('right')
      } else if (ball.x - BALL_RADIUS > CANVAS_WIDTH) {
        const nextScores = { left: scoresRef.current.left + 1, right: scoresRef.current.right }
        scoresRef.current = nextScores
        setScores({ ...nextScores })
        triggerTheme('score-left')
        resetBall('left')
      }

      const colors = themeMapRef.current

      ctx.fillStyle = colors.background
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.strokeStyle = hexToRgba(colors.accent, 0.6)
      ctx.setLineDash([10, 14])
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH / 2, 16)
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 16)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = colors.leftPaddle
      ctx.fillRect(PADDLE_MARGIN, left.y, PADDLE_WIDTH, PADDLE_HEIGHT)
      ctx.fillStyle = colors.rightPaddle
      ctx.fillRect(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, right.y, PADDLE_WIDTH, PADDLE_HEIGHT)

      ctx.fillStyle = colors.ball
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fill()

      animationRef.current = requestAnimationFrame(update)
    }

    animationRef.current = requestAnimationFrame(update)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [resetBall, triggerTheme])

  const accentBorderColor = useMemo(() => hexToRgba(themeMap.accent, 0.35), [themeMap.accent])
  const accentBgColor = useMemo(() => hexToRgba(themeMap.accent, 0.18), [themeMap.accent])

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2.75rem] border border-slate-200/40 bg-slate-900 text-slate-50 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),_transparent_55%)]" aria-hidden />
        <div className="relative z-10 grid gap-8 p-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-200/70">Groq Arcade · Auto Pong</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Pong Showdown</h1>
            <p className="text-base leading-relaxed text-slate-200/90">
              Watch two AI paddles volley while Groq LLAMA 4 models remix the arena&apos;s palette on every clutch play.
              Each collision or score fires a structured <code className="mx-1 rounded bg-slate-50/10 px-1 py-0.5 text-[0.7rem] font-semibold">/obj</code> call that returns
              fresh colors, usage prompts, and a vibe-forward style name.
            </p>
            <p className="text-sm text-slate-300/80">{statusMessage}</p>
          </div>
          <div className="relative flex flex-col gap-4">
            <div
              className="flex items-center justify-between rounded-2xl px-5 py-4 shadow-lg"
              style={{
                backgroundColor: accentBgColor,
                border: `1px solid ${accentBorderColor}`,
                color: themeMap.scoreText,
              }}
            >
              <div className="text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-100/70">Current Theme</p>
                <p className="text-2xl font-semibold text-slate-50">{theme?.styleName}</p>
                <p className="text-sm text-slate-100/80">{theme?.stylePrompt}</p>
              </div>
              <div className="flex flex-col items-end text-right text-sm text-slate-100/90">
                <div className="flex items-center gap-3 text-lg font-semibold">
                  <span>Left</span>
                  <span>{scores.left}</span>
                </div>
                <div className="flex items-center gap-3 text-lg font-semibold">
                  <span>Right</span>
                  <span>{scores.right}</span>
                </div>
                {loading ? <span className="mt-2 text-xs uppercase tracking-wide text-slate-100/60">Updating theme…</span> : null}
                {error ? (
                  <span className="mt-2 text-xs text-rose-200">{error}</span>
                ) : null}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/30 bg-slate-950/60 p-4 text-xs text-slate-300/80 backdrop-blur">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">How the palette arrives</p>
              <p>
                Themes are minted via <span className="font-semibold">meta-llama/llama-4-maverick-17b-128e-instruct</span> on the Groq endpoint with a
                schema demanding named roles and prompts. The paddle AI sticks to classic Pong so the colors steal the show.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/40 bg-slate-950 shadow-inner">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="h-full w-full object-contain"
              style={{ backgroundColor: themeMap.background }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/40 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Palette roles</p>
            <ul className="mt-4 space-y-3 text-sm">
              {Object.keys(ROLE_DEFAULTS).map((role) => {
                const colorEntry = theme?.colors?.find((item) => item.role === role)
                const colorHex = themeMap[role]
                return (
                  <li key={role} className="flex gap-3">
                    <span
                      className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold"
                      style={{ backgroundColor: colorHex, color: role === 'background' ? '#0f172a' : '#020617' }}
                    >
                      {role.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{ROLE_LABELS[role]}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{colorHex}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{colorEntry?.prompt || 'Default prompt applied.'}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-5 text-sm shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Recent volleys</p>
            <ul className="mt-3 space-y-3">
              {history.map((entry) => (
                <li key={entry.timestamp} className="rounded-2xl border border-slate-200/40 bg-white/60 p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
                  <p className="font-semibold text-slate-700 dark:text-slate-100">{entry.theme.styleName}</p>
                  <p className="text-slate-500 dark:text-slate-400">{entry.theme.stylePrompt}</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-wide text-slate-400">
                    Trigger: {entry.reason.replace('-', ' ')} · {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
