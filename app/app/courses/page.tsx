'use client';
import { useRouter } from 'next/navigation';
import { useLearning } from '@/app/providers';
import {
  assignedModules,
  courseState,
  moduleProgress,
} from '@/lib/learning/progression';
import { CourseCard } from '@/components/learning/CourseCard';
export default function CoursesPage() {
  const router = useRouter();
  const { state, ready } = useLearning();
  const modules = assignedModules(state);
  if (!ready) return <div className="state-message">Loading your courses…</div>;
  if (!state.path)
    return (
      <div className="state-message">
        <h1>Your courses start with three answers.</h1>
        <button className="btn" onClick={() => router.push('/assessment')}>
          Create my path
        </button>
      </div>
    );
  return (
    <div className="courses-view routed-courses">
      <header className="courses-head">
        <h1>My courses</h1>
        <div className="course-counts">
          <span>{modules.length} modules</span>
          <span>{modules.length * 7} lessons</span>
        </div>
      </header>
      <div className="course-sheet">
        <div className="course-intro">
          <b>Your personalised sequence</b>
          <span>
            Learn in order. Completed material always stays available.
          </span>
        </div>
        {(['Current', 'Upcoming', 'Complete'] as const).map((section) => {
          const inSection = modules
            .map((module, index) => ({ module, position: index + 1 }))
            .filter(({ module }) => courseState(state, module) === section);
          if (inSection.length === 0) return null;
          return (
            <div className="course-section" key={section}>
              <h3 className="course-section-heading">
                {section === 'Complete' ? 'Done' : section}
              </h3>
              {inSection.map(({ module, position }) => (
                <CourseCard
                  key={module.id}
                  module={module}
                  position={position}
                  progress={moduleProgress(state, module).percentage}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
