import RotatingMealImage from './RotatingMealImage'
import { MEAL_IMAGE_POOL } from '../utils/mealImages'

export default function ShowcaseCard({
  eyebrow,
  title,
  description,
  tone = 'warm',
  images = MEAL_IMAGE_POOL,
  imageSize,
  imageRounded,
  imageWrapperClass = '',
}) {
  const toneStyles = {
    warm: {
      wrapper: 'bg-[#FFF7EC] border-[#F4E4CF] hover:shadow-[0_24px_50px_rgba(243,193,130,0.25)]',
      accent: 'bg-[#FFE2C2] text-[#A4532C]',
    },
    calm: {
      wrapper: 'bg-[#F0F7F4] border-[#D9EDE4] hover:shadow-[0_24px_50px_rgba(122,170,147,0.25)]',
      accent: 'bg-[#D6EEE4] text-[#2F6F55]',
    },
    blush: {
      wrapper: 'bg-[#F9F2F6] border-[#F0DDE8] hover:shadow-[0_24px_50px_rgba(196,120,150,0.2)]',
      accent: 'bg-[#F3D8E5] text-[#7C3F58]',
    },
  }

  const current = toneStyles[tone] || toneStyles.warm

  return (
    <div
      className={`group relative overflow-hidden rounded-[32px] border px-6 py-8 shadow-card transition-all duration-300 hover:-translate-y-2 ${current.wrapper}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%)]" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {eyebrow && (
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-ink/40">{eyebrow}</p>
        )}
        <div className={`rounded-3xl p-4 shadow-inner ${current.accent} ${imageWrapperClass}`}>
          <RotatingMealImage
            images={images}
            sizeClass={imageSize}
            roundedClass={imageRounded}
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-ink">{title}</h3>
          <p className="text-sm text-ink/60">{description}</p>
        </div>
        <div className="h-1 w-12 rounded-full bg-ink/10 transition group-hover:bg-ink/25" />
      </div>
    </div>
  )
}
