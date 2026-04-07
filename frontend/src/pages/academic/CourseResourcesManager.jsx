import { useState, useEffect } from 'react';
import { BookOpen, Link as LinkIcon, FileText, Plus, Trash2, Loader2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CourseResourcesManager = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingResources, setFetchingResources] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'LINK',
        url: '',
        file: null,
    });

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const fetchMyClasses = async () => {
        try {
            const res = await api.get('/staff/my-classes');
            const assignments = res.data.data || [];
            const classMap = {};
            assignments.forEach(a => {
                const cls = a.class;
                if (!cls) return;
                if (!classMap[cls.id]) {
                    classMap[cls.id] = { ...cls, classSubjects: [] };
                }
                if (a.subject) {
                    const exists = classMap[cls.id].classSubjects.find(cs => cs.subject.id === a.subject.id);
                    if (!exists) {
                        classMap[cls.id].classSubjects.push({ subject: a.subject });
                    }
                }
            });
            setClasses(Object.values(classMap));
        } catch (error) {
            toast.error('Failed to load classes');
        }
    };

    const fetchResources = async () => {
        if (!selectedClass || !selectedSubject) return;
        setFetchingResources(true);
        try {
            const res = await api.get(`/academic/resources/${selectedClass}/${selectedSubject}`);
            setResources(res.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch resources');
            setResources([]);
        } finally {
            setFetchingResources(false);
        }
    };

    useEffect(() => {
        if (selectedClass && selectedSubject) {
            fetchResources();
        } else {
            setResources([]);
        }
    }, [selectedClass, selectedSubject]);

    const handleCreateResource = async (e) => {
        e.preventDefault();
        if (!selectedClass || !selectedSubject) {
            toast.error('Please select a class and subject');
            return;
        }

        const isFileUpload = formData.type === 'UPLOAD_PDF' || formData.type === 'UPLOAD_DOCX';

        if (isFileUpload && !formData.file) {
            toast.error('Please select a file to upload');
            return;
        }

        if (!isFileUpload && !formData.url) {
            toast.error('Please enter a URL');
            return;
        }

        setLoading(true);
        try {
            if (isFileUpload) {
                const submitData = new FormData();
                submitData.append('classId', selectedClass);
                submitData.append('subjectId', selectedSubject);
                submitData.append('title', formData.title);
                submitData.append('type', formData.type === 'UPLOAD_PDF' ? 'PDF' : 'DOCX');
                submitData.append('file', formData.file);

                await api.post('/academic/resources', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/academic/resources', {
                    classId: selectedClass,
                    subjectId: selectedSubject,
                    title: formData.title,
                    type: formData.type,
                    url: formData.url,
                    size: 'External',
                });
            }
            
            toast.success('Resource added successfully');
            setShowModal(false);
            setFormData({ title: '', type: 'LINK', url: '', file: null });
            fetchResources();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add resource');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            await api.delete(`/academic/resources/${resourceId}`);
            toast.success('Resource deleted successfully');
            fetchResources();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete resource');
        }
    };

    const subjects = classes.find(c => c.id === selectedClass)?.classSubjects.map(cs => cs.subject) || [];

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Study Resources Manager</h1>
                        <p className="text-gray-500 mt-1">Upload and manage study materials for your classes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Select Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject(''); }}
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Choose a class...</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.grade?.name} {c.stream?.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Select Subject</label>
                        <select
                            value={selectedSubject}
                            disabled={!selectedClass}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                            <option value="">Choose a subject...</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedClass && selectedSubject && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-gray-900">Uploaded Resources</h2>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-sm"
                        >
                            <Plus className="w-5 h-5" /> Add Resource
                        </button>
                    </div>

                    <div className="space-y-4">
                        {fetchingResources ? (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                                <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
                                <p className="font-medium">Loading resources...</p>
                            </div>
                        ) : resources.length > 0 ? (
                            resources.map((res) => (
                                <div key={res.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${res.type === 'PFD' || res.type === 'DOC' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {res.type === 'LINK' ? <LinkIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">{res.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                <span className="font-medium text-teal-600">{res.type}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <a 
                                                    href={res.url?.startsWith('/public') ? `https://kyamatu-sms-backend.onrender.com${res.url}` : res.url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="hover:underline flex items-center gap-1"
                                                    download={res.url?.startsWith('/public')}
                                                >
                                                    {res.url?.startsWith('/public') ? 'Download Resource' : 'View Resource'} <ExternalLink className="w-3 h-3" />
                                                </a>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteResource(res.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group-hover:opacity-100 opacity-50"
                                        title="Delete Resource"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-12 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No resources added yet.</p>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="mt-4 text-teal-600 font-bold hover:underline"
                                >
                                    Click here to add the first resource
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Resource Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Add New Resource</h2>
                        </div>
                        <form onSubmit={handleCreateResource} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Resource Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Chapter 1 Notes"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Resource Type</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="LINK">External Link</option>
                                    <option value="UPLOAD_PDF">Upload PDF File</option>
                                    <option value="UPLOAD_DOCX">Upload DOCX File</option>
                                    <option value="VIDEO">YouTube Video Link</option>
                                </select>
                            </div>

                            {(formData.type === 'UPLOAD_PDF' || formData.type === 'UPLOAD_DOCX') ? (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Select File</label>
                                    <input
                                        type="file"
                                        required
                                        accept={formData.type === 'UPLOAD_PDF' ? '.pdf' : '.doc,.docx'}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                        onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Resource URL</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://..."
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Paste the shareable link to the resource (Google Drive, YouTube, etc.)</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Resource'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseResourcesManager;
