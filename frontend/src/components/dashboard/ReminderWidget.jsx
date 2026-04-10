import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Circle, Clock, Trash2, Calendar, Sparkles } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ReminderWidget = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await api.get('/reminders');
            setReminders(res.data.data);
        } catch (error) {
            console.error('Error fetching reminders:', error);
            // Mock data fallback
            setReminders([
                { id: '1', title: 'Mathematics Homework', remindAt: new Date(Date.now() + 86400000).toISOString(), isCompleted: false },
                { id: '2', title: 'Bring Science Lab Manual', remindAt: new Date(Date.now() + 172800000).toISOString(), isCompleted: false }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (id, currentStatus) => {
        try {
            await api.patch(`/reminders/${id}/complete`, { isCompleted: !currentStatus });
            setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !currentStatus } : r));
            toast.success(currentStatus ? 'Reminder unmarked' : 'Reminder completed!');
        } catch (error) {
            toast.error('Failed to update reminder');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/reminders/${id}`);
            setReminders(prev => prev.filter(r => r.id !== id));
            toast.success('Reminder deleted');
        } catch (error) {
            toast.error('Failed to delete reminder');
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 animate-pulse">
                <div className="h-4 w-32 bg-gray-100 rounded mb-6"></div>
                <div className="space-y-4">
                    <div className="h-16 bg-gray-50 rounded-2xl"></div>
                    <div className="h-16 bg-gray-50 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
                        <Bell className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">My Reminders</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Personal Tasks & AI Plans</p>
                    </div>
                </div>
                {reminders.length > 0 && (
                    <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {reminders.filter(r => !r.isCompleted).length} PENDING
                    </span>
                )}
            </div>

            <div className="space-y-4 flex-1">
                {reminders.length > 0 ? (
                    reminders.map((reminder) => (
                        <div 
                            key={reminder.id}
                            className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                reminder.isCompleted 
                                    ? 'bg-gray-50 border-gray-100 opacity-60' 
                                    : 'bg-white border-gray-50 hover:border-amber-200 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <button 
                                    onClick={() => handleToggleComplete(reminder.id, reminder.isCompleted)}
                                    className={`transition-colors ${reminder.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-amber-500'}`}
                                >
                                    {reminder.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                                <div className="flex-1">
                                    <p className={`text-xs font-bold leading-tight ${reminder.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                        {reminder.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(reminder.remindAt), 'MMM d, h:mm a')}
                                        </div>
                                        {reminder.description?.includes('KyamaBot') && (
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-[#476C63] uppercase">
                                                <Sparkles className="w-3 h-3" />
                                                AI Plan
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(reminder.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            No active reminders.<br />
                            <span className="text-[10px] text-teal-600 lowercase font-medium">Ask KyamaBot to set one for you!</span>
                        </p>
                    </div>
                )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-50">
                <button 
                    onClick={() => toast('Ask KyamaBot to "Remind me to..."', { icon: '🤖' })}
                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-dashed border-gray-200"
                >
                    + Add New via KyamaBot
                </button>
            </div>
        </div>
    );
};

export default ReminderWidget;
