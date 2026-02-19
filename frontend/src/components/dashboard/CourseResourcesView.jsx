import { FileText, Download, ExternalLink, X, Book } from 'lucide-react';

const CourseResourcesView = ({ isOpen, onClose, subjectName, teacher }) => {
    if (!isOpen) return null;

    // Mock resources for now, similar to how outlines are seeded
    const resources = [
        { id: 1, title: 'Term 1 Course Notes', type: 'PDF', size: '2.4 MB', date: 'Feb 10, 2026' },
        { id: 2, title: 'Weekly Assignment Pack', type: 'DOCX', size: '1.2 MB', date: 'Feb 15, 2026' },
        { id: 3, title: 'Reference Website', type: 'LINK', url: 'https://example.com/resources', date: 'Feb 05, 2026' },
        { id: 4, title: 'Past Exam Papers', type: 'PDF', size: '5.8 MB', date: 'Jan 20, 2026' }
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Book className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{subjectName}</h2>
                            <div className="flex items-center gap-2 text-sm opacity-80">
                                <span>Academic Resources & Materials</span>
                                {teacher && (
                                    <>
                                        <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                                        <span>Managed by {teacher.firstName} {teacher.lastName}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        {resources.map((res) => (
                            <div key={res.id} className="group p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500 transition-all hover:shadow-md cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${res.type === 'PDF' ? 'bg-red-50 text-red-600' :
                                                res.type === 'LINK' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-teal-50 text-teal-600'
                                            }`}>
                                            {res.type === 'LINK' ? <ExternalLink className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors">
                                                {res.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span>{res.type}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{res.size || 'External'}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{res.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-all">
                                        {res.type === 'LINK' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {resources.length === 0 && (
                        <div className="py-12 text-center text-gray-500">
                            <Book className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p>No resources have been uploaded yet.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Close Resources
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseResourcesView;
