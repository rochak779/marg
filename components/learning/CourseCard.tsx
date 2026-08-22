import Link from 'next/link';
import type { CurriculumModule } from '@/lib/learning/types';
import { shortModuleTitle } from '@/content/modules';

const ModuleIcon = ({ id }: { id: number }) => (
  <svg viewBox="0 0 24 24">
    {id === 1 && (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m14.8 9.2-1.5 4.1-4.1 1.5 1.5-4.1 4.1-1.5Z" />
      </>
    )}
    {id === 2 && (
      <>
        <path d="M5 6h14v9H9l-4 3V6Z" />
        <path d="M9 10h6" />
      </>
    )}
    {id === 3 && (
      <>
        <path d="M5 6h14v12H5z" />
        <path d="M5 13h4l2 2h2l2-2h4" />
      </>
    )}
    {id === 4 && (
      <>
        <path d="M7 4h8l3 3v13H7z" />
        <path d="M10 10h5m-5 4h5" />
      </>
    )}
    {id === 5 && (
      <>
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="7" r="2" />
        <circle cx="12" cy="17" r="2" />
        <path d="m8.7 8.1 2.2 6.9m4.4-6.9L13.1 15M9 7h6" />
      </>
    )}
  </svg>
);
export function CourseCard({
  module,
  position,
  progress,
  state,
}: {
  module: CurriculumModule;
  position: number;
  progress: number;
  state: string;
}) {
  return (
    <Link
      href={`/app/modules/${module.slug}`}
      className="track-card dark real-course"
    >
      <span className="track-curve" />
      <span className="track-icon" aria-hidden>
        <ModuleIcon id={module.id} />
      </span>
      <span className="track-open" aria-hidden>
        <svg viewBox="0 0 24 24">
          <path d="M8 16 16 8m-6 0h6v6" />
        </svg>
      </span>
      <div className="track-copy">
        <small>
          MODULE {position} · {state.toUpperCase()}
        </small>
        <h2>{shortModuleTitle(module.id)}</h2>
      </div>
      <div className="track-foot">
        <div className="course-meta">
          <b>{progress}%</b>
          <span>7 units</span>
        </div>
        <span className="track-arrow" aria-hidden>
          <svg viewBox="0 0 24 24">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
