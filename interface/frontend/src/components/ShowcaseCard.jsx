import RotatingMealImage from './RotatingMealImage'
import { MEAL_IMAGE_POOL } from '../utils/mealImages'

export default function ShowcaseCard({
  eyebrow,
  title,
  description,
  tone = 'calm',
  images = MEAL_IMAGE_POOL,
  imageSize,
  imageRounded,
  imageWrapperClass = '',
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:shadow-md">
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {eyebrow && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {eyebrow}
          </span>
        )}
        <div className={`rounded-2xl p-3 bg-slate-50 border border-slate-100 ${imageWrapperClass}`}>
          <RotatingMealImage
            images={images}
            sizeClass={imageSize}
            roundedClass={imageRounded}
          />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 max-w-sm">{description}</p>
        </div>
      </div>
    </div>
  )
}
