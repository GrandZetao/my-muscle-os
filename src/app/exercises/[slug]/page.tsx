import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleAlert, Repeat2 } from "lucide-react";
import { ExerciseDemo } from "@/features/exercises/exercise-demo";
import { exercises, getExercise } from "@/features/exercises/data";

export function generateStaticParams() { return exercises.map(({ slug }) => ({ slug })); }

export default async function ExerciseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exercise = getExercise(slug);
  if (!exercise) notFound();
  const alternatives = exercise.alternatives.map((id) => getExercise(id)).filter(Boolean);

  return (
    <div className="page-wrap">
      <Link href="/exercises" className="btn-ghost -ml-3 mb-6"><ArrowLeft size={18} />返回动作库</Link>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="eyebrow">{exercise.equipment} / {exercise.difficulty}</p>
          <h1 className="page-title">{exercise.name}</h1>
          <p className="mt-4 text-muted">主练 {exercise.primaryMuscle}{exercise.secondaryMuscles.length ? ` · 辅助 ${exercise.secondaryMuscles.join("、")}` : ""}</p>
          <div className="mt-6"><ExerciseDemo movement={exercise.movement} muscle={exercise.primaryMuscle} name={exercise.name} /></div>
          <p className="mt-3 text-xs text-muted">{exercise.media.author} · {exercise.media.licenseName}</p>
        </div>
        <div className="space-y-4">
          <section className="panel rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><CheckCircle2 className="text-success" size={20} />动作步骤</h2>
            <ol className="mt-5 space-y-4">{exercise.steps.map((step, index) => <li key={step} className="grid grid-cols-[30px_1fr] gap-3 text-sm leading-7"><span className="font-display text-2xl text-primary">{index + 1}</span><span>{step}</span></li>)}</ol>
          </section>
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="panel rounded-xl p-5"><h2 className="flex items-center gap-2 font-bold"><CheckCircle2 size={18} className="text-success" />发力提示</h2><ul className="mt-4 space-y-3 text-sm text-muted">{exercise.cues.map((cue) => <li key={cue}>— {cue}</li>)}</ul></section>
            <section className="panel rounded-xl p-5"><h2 className="flex items-center gap-2 font-bold"><CircleAlert size={18} className="text-danger" />常见错误</h2><ul className="mt-4 space-y-3 text-sm text-muted">{exercise.mistakes.map((mistake) => <li key={mistake}>— {mistake}</li>)}</ul></section>
          </div>
          <section className="panel rounded-xl p-5"><h2 className="flex items-center gap-2 font-bold"><Repeat2 size={18} className="text-primary" />替代动作</h2><div className="mt-4 flex flex-wrap gap-2">{alternatives.map((item) => item && <Link className="tag hover:border-primary hover:text-white" href={`/exercises/${item.slug}`} key={item.id}>{item.name}</Link>)}</div></section>
        </div>
      </div>
    </div>
  );
}
