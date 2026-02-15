import { CheckCircle2 } from 'lucide-react';

interface OverviewTabProps {
    course: any;
}

export const OverviewTab = ({ course }: OverviewTabProps) => {
    return (
        <div className="space-y-12 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* What you'll learn */}
            {course.what_you_will_learn && course.what_you_will_learn.length > 0 && (
                <section className="bg-[#0B0F1A] border border-white/5 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6">What you'll learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.what_you_will_learn.map((item: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <span className="text-gray-400 font-medium text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
                <section>
                    <h3 className="text-xl font-bold text-white mb-6">Requirements</h3>
                    <ul className="space-y-3">
                        {course.requirements.map((req: string, index: number) => (
                            <li key={index} className="flex items-center gap-3 text-gray-400 font-medium text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                {req}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Description */}
            {course.description && (
                <section>
                    <h3 className="text-xl font-bold text-white mb-6">Description</h3>
                    <div className="prose prose-invert prose-gray max-w-none text-gray-400 font-medium">
                        <p>
                            {course.description}
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
};
