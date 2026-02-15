import { useState, useEffect } from 'react';
import {
    Plus, Save, Trash2, Calendar, BookOpen, AlertCircle,
    ChevronDown, MessageSquare, List, Clock, Check
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CoursePlanner = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [outline, setOutline] = useState({ title: '', content: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const fetchMyClasses = async () => {
        try {
            const res = await api.get('/staff/my-classes');
            setClasses(res.data.data);
        } catch (error) {
            toast.error('Failed to load classes');
        }
    };

    const handleFetchOutline = async () => {
        if (!selectedClass || !selectedSubject) return;
        setLoading(true);
        try {
            const res = await api.get(`/academic/outlines/${selectedClass}/${selectedSubject}`);
            if (res.data.data) {
                setOutline(res.data.data);
            } else {
                setOutline({ title: '', content: [] });
            }
        } catch (error) {
            setOutline({ title: '', content: [] }); // Reset on 404
        } finally {
            setLoading(false);
        }
    };

    const addModule = () => {
        setOutline({
            ...outline,
            content: [
                ...outline.content,
                { id: Date.now(), type: 'LESSON', title: '', description: '', date: '', topics: [] }
            ]
        });
    };

    const updateModule = (id, field, value) => {
        setOutline({
            ...outline,
            content: outline.content.map(m => m.id === id || m.title === id ? { ...m, [field]: value } : m)
        });
    };

    const removeModule = (idx) => {
        const newContent = [...outline.content];
        newContent.splice(idx, 1);
        setOutline({ ...outline, content: newContent });
    };

    const handleSave = async () => {
        if (!selectedClass || !selectedSubject) {
            toast.error('Select Class and Subject');
            return;
        }
        setLoading(true);
        try {
            await api.post('/academic/outlines', {
                classId: selectedClass,
                subjectId: selectedSubject,
                title: outline.title || 'Term Syllabus',
                content: outline.content
            });
            toast.success('Outline saved successfully');
        } catch (error) {
            toast.error('Failed to save outline');
        } finally {
            setLoading(false);
        }
    };

    const subjects = classes.find(c => c.id === selectedClass)?.classSubjects.map(cs => cs.subject) || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Course Planner</h1>
                        <p className="text-gray-500 mt-1">Design and manage your syllabus for this term.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Review
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Select Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject(''); }}
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Choose a class...</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.grade.name} {c.stream.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Select Subject</label>
                        <select
                            value={selectedSubject}
                            disabled={!selectedClass}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                            <option value="">Choose a subject...</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleFetchOutline}
                        disabled={!selectedClass || !selectedSubject}
                        className="md:col-span-2 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                        <List className="w-5 h-5" /> Load Current Outline
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold text-gray-900">Syllabus Modules</h2>
                    <button
                        onClick={addModule}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-xl font-bold border border-primary-100 hover:bg-primary-50 transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Module
                    </button>
                </div>

                <div className="space-y-4">
                    {outline.content.length > 0 ? (
                        outline.content.map((module, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center text-white 
                    ${module.type === 'CAT' || module.type === 'EXAM' ? 'bg-red-500' :
                                            module.type === 'ASSIGNMENT' ? 'bg-orange-500' : 'bg-primary-500'}`}>
                                        {module.type === 'CAT' || module.type === 'EXAM' ? <AlertCircle className="w-5 h-5" /> :
                                            module.type === 'ASSIGNMENT' ? <FileText className="w-5 h-5" /> :
                                                <BookOpen className="w-5 h-5" />}
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <select
                                                value={module.type}
                                                onChange={(e) => updateModule(idx, 'type', e.target.value)}
                                                className="p-3 bg-gray-50 border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                            >
                                                <option value="LESSON">Lesson</option>
                                                <option value="CAT">CAT / Quiz</option>
                                                <option value="ASSIGNMENT">Assignment</option>
                                                <option value="EXAM">Main Exam</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Module Title (e.g. Introduction to Algebra)"
                                                className="md:col-span-2 p-3 bg-gray-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                                                value={module.title}
                                                onChange={(e) => updateModule(idx, 'title', e.target.value)}
                                            />
                                        </div>

                                        <textarea
                                            placeholder="Enter a brief description of what will be covered..."
                                            className="w-full p-4 bg-gray-50 border-none rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px]"
                                            value={module.description}
                                            onChange={(e) => updateModule(idx, 'description', e.target.value)}
                                        />

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                                <Calendar className="w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Week / Date (e.g. Week 1)"
                                                    className="text-xs font-bold bg-transparent border-none outline-none focus:ring-0 p-0"
                                                    value={module.date}
                                                    onChange={(e) => updateModule(idx, 'date', e.target.value)}
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeModule(idx)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl py-12 text-center">
                            <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No modules added yet.</p>
                            <button
                                onClick={addModule}
                                className="mt-4 text-primary-600 font-bold hover:underline"
                            >
                                Click here to start planning
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoursePlanner;
