interface CourseTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const CourseTabs = ({ activeTab, setActiveTab }: CourseTabsProps) => {
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'curriculum', label: 'Curriculum' },
        { id: 'discussions', label: 'Discussions' },
        { id: 'resources', label: 'Resources' },
    ];

    return (
        <div className="border-b border-white/5 mb-8">
            <div className="flex items-center gap-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 text-sm font-bold transition-all relative
                        ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
