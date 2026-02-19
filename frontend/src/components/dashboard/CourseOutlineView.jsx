import { X, CheckCircle, Clock, BookOpen, AlertCircle, FileText, Printer } from 'lucide-react';

const CourseOutlineView = ({ isOpen, onClose, outline, subjectName }) => {
    if (!isOpen) return null;

    const content = outline?.content || [];

    const handlePrint = () => {
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>${subjectName} - Course Syllabus</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
                        h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                        .prepared-by { color: #6b7280; font-size: 0.875rem; margin-bottom: 30px; }
                        .module { margin-bottom: 25px; page-break-inside: avoid; }
                        .module-type { font-weight: 700; color: #2563eb; font-size: 0.75rem; text-transform: uppercase; }
                        .module-title { font-size: 1.25rem; font-weight: 700; margin: 5px 0; }
                        .module-desc { color: #4b5563; font-size: 0.9375rem; line-height: 1.5; }
                        .module-date { color: #9ca3af; font-size: 0.8125rem; font-weight: 500; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <h1>${subjectName}</h1>
                    <div class="prepared-by">
                        Course Outline & Syllabus
                        ${outline?.teacher ? ` | Prepared by ${outline.teacher.firstName} ${outline.teacher.lastName}` : ''}
                    </div>
                    ${content.map(m => `
                        <div class="module">
                            <div class="module-type">${m.type} • ${m.date}</div>
                            <div class="module-title">${m.title}</div>
                            <div class="module-desc">${m.description}</div>
                        </div>
                    `).join('')}
                    <script>window.onload = function() { window.print(); }</script>
                </body>
            </html>
        `);
        win.document.close();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-teal-600 text-white">
                    <div>
                        <h2 className="text-xl font-bold">{subjectName}</h2>
                        <div className="flex items-center gap-2 text-sm opacity-80">
                            <span>Course Outline & Syllabus</span>
                            {outline?.teacher && (
                                <>
                                    <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                                    <span>Prepared by {outline.teacher.firstName} {outline.teacher.lastName}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all"
                            title="Print Syllabus"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="relative space-y-8">
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 rounded-full"></div>

                        {content.length > 0 ? (
                            content.map((module, i) => (
                                <div key={i} className="relative flex gap-8">
                                    <div className={`mt-1 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 
                    ${module.type === 'CAT' || module.type === 'EXAM' ? 'bg-red-500' :
                                            module.type === 'ASSIGNMENT' ? 'bg-orange-500' : 'bg-primary-500'}`}>
                                        {module.type === 'CAT' || module.type === 'EXAM' ? <AlertCircle className="w-4 h-4 text-white" /> :
                                            module.type === 'ASSIGNMENT' ? <FileText className="w-4 h-4 text-white" /> :
                                                <BookOpen className="w-4 h-4 text-white" />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">{module.type}</span>
                                            <span className="text-xs text-gray-400 font-medium">{module.date}</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">{module.title}</h4>
                                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                            {module.description}
                                        </p>
                                        {module.topics && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {module.topics.map((t, ti) => (
                                                    <span key={ti} className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-600">#{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Outline TBA</h3>
                                <p className="text-gray-500">The teacher hasn't published the outline for this term yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg"
                    >
                        Close Viewer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseOutlineView;
