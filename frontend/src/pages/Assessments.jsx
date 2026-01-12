import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, FileText, BarChart3 } from 'lucide-react';

function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CAT',
    date: new Date().toISOString().split('T')[0],
    subjectId: '',
    termId: '',
    maxScore: 30,
    weight: 10, // Percentage
  });

  // Enter Scores State
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loadingScores, setLoadingScores] = useState(false);
  const [scoreStudents, setScoreStudents] = useState([]);
  const [scoresData, setScoresData] = useState({});
  const [modalMode, setModalMode] = useState('enter'); // 'enter' or 'view'

  useEffect(() => {
    fetchAssessments();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const [subjectsRes, termsRes] = await Promise.all([
        api.get('/academic/subjects'),
        api.get('/academic/terms'),
      ]);
      setSubjects(subjectsRes.data.data);
      setTerms(termsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dependencies');
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await api.get('/assessments');
      setAssessments(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assessments', {
        ...formData,
        weight: parseFloat(formData.weight) / 100, // Convert to decimal
        maxScore: parseInt(formData.maxScore),
      });
      toast.success('Assessment created successfully');
      setShowModal(false);
      fetchAssessments();
      setFormData({
        name: '',
        type: 'CAT',
        date: new Date().toISOString().split('T')[0],
        subjectId: '',
        termId: '',
        maxScore: 30,
        weight: 10,
      });
    } catch (error) {
      toast.error('Failed to create assessment');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      CAT: 'badge-primary',
      EXAM: 'badge-danger',
      PROJECT: 'badge-success',
      OBSERVATION: 'badge-warning',
    };
    return colors[type] || 'badge-primary';
  };

  const openScoresModal = async (assessment, mode = 'enter') => {
    setSelectedAssessment(assessment);
    setModalMode(mode);
    setShowScoresModal(true);
    setLoadingScores(true);
    setScoreStudents([]);
    setScoresData({});

    try {
      // 1. Get full assessment details (marks)
      const assessmentRes = await api.get(`/assessments/${assessment.id}`);
      const fullAssessment = assessmentRes.data.data;
      
      // 2. Get students for the subject's grade
      // Assuming subject has gradeId. If not, we might need a different strategy.
      // But based on our schema, Subject usually links Grade.
      const gradeId = fullAssessment.subject?.gradeId;
      
      if (!gradeId) {
        toast.error('Could not determine grade for this assessment');
        setLoadingScores(false);
        return;
      }

      const studentsRes = await api.get('/students', {
        params: { gradeId, limit: 100 }
      });
      
      setScoreStudents(studentsRes.data.data);

      // 3. Map existing scores
      const existingScores = {};
      if (fullAssessment.scores) {
        fullAssessment.scores.forEach(s => {
          existingScores[s.studentId] = {
            score: s.score,
            comment: s.comment,
            studentId: s.studentId
          };
        });
      }
      setScoresData(existingScores);

    } catch (error) {
      console.error(error);
      toast.error('Failed to load students');
    } finally {
      setLoadingScores(false);
    }
  };

  const handleScoresSubmit = async (e) => {
    e.preventDefault();
    try {
      const scoresPayload = Object.values(scoresData).map(s => ({
        studentId: s.studentId,
        score: parseFloat(s.score),
        comment: s.comment
      })).filter(s => !isNaN(s.score));

      await api.post('/assessments/scores/bulk', {
        assessmentId: selectedAssessment.id,
        scores: scoresPayload
      });

      toast.success('Scores saved successfully');
      setShowScoresModal(false);
      fetchAssessments(); // Refresh list stats
    } catch (error) {
      toast.error('Failed to save scores');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-500">Manage tests, exams, and CBC competencies</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ... stats cards ... */}
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
            <p className="text-sm text-gray-500">Total Assessments</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">85%</p>
            <p className="text-sm text-gray-500">Avg Pass Rate</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-500">Pending Grading</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Date</th>
                <th>Max Score</th>
                <th>Entries</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">Loading...</td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No assessments found
                  </td>
                </tr>
              ) : (
                assessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="font-medium">{assessment.name}</td>
                    <td>{assessment.subject?.name}</td>
                    <td>
                      <span className={`badge ${getTypeColor(assessment.type)}`}>
                        {assessment.type}
                      </span>
                    </td>
                    <td>{new Date(assessment.date).toLocaleDateString()}</td>
                    <td>{assessment.maxScore}</td>
                    <td>{assessment._count?.scores || 0}</td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openScoresModal(assessment)}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          Enter Scores
                        </button>
                        <button 
                          onClick={() => openScoresModal(assessment, 'view')}
                          className="text-gray-600 hover:underline text-sm"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Create Assessment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Assessment Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g., Term 1 Opener"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select
                    className="input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="CAT">CAT</option>
                    <option value="EXAM">Exam</option>
                    <option value="PROJECT">Project</option>
                    <option value="OBSERVATION">Observation</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Subject</label>
                  <select
                    required
                    className="input"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Term</label>
                  <select
                    required
                    className="input"
                    value={formData.termId}
                    onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
                  >
                    <option value="">Select Term</option>
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Max Score</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Weight (%)</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Enter Scores Modal */}
      {showScoresModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">{modalMode === 'enter' ? 'Enter Scores' : 'View Scores'}</h2>
                <p className="text-gray-500">
                  {selectedAssessment.name} - {selectedAssessment.subject?.name} (Max: {selectedAssessment.maxScore})
                </p>
              </div>
              <button onClick={() => setShowScoresModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>

            {loadingScores ? (
              <div className="text-center py-12">Loading students and scores...</div>
            ) : (
              <form onSubmit={handleScoresSubmit} className="space-y-6">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Score</th>
                        <th>%</th>
                        <th>Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {scoreStudents.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-500">
                            No students found for this subject/grade
                          </td>
                        </tr>
                      ) : (
                        scoreStudents.map((student) => {
                          const currentScore = scoresData[student.id]?.score || '';
                          const percentage = currentScore ? ((parseFloat(currentScore) / selectedAssessment.maxScore) * 100).toFixed(1) : '-';
                          
                          return (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="font-mono text-sm">{student.admissionNumber}</td>
                              <td className="font-medium">
                                {student.firstName} {student.lastName}
                              </td>
                              <td className="w-32">
                                {modalMode === 'enter' ? (
                                  <input
                                    type="number"
                                    className="input py-1"
                                    min="0"
                                    max={selectedAssessment.maxScore}
                                    value={currentScore}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= selectedAssessment.maxScore)) {
                                        setScoresData(prev => ({
                                          ...prev,
                                          [student.id]: { ...prev[student.id], score: val, studentId: student.id }
                                        }));
                                      }
                                    }}
                                  />
                                ) : (
                                  <span className="font-medium text-gray-900">{currentScore || '-'}</span>
                                )}
                              </td>
                              <td className="text-sm text-gray-500">{percentage}%</td>
                              <td>
                                {modalMode === 'enter' ? (
                                  <input
                                    type="text"
                                    className="input py-1"
                                    placeholder="Optional comment"
                                    value={scoresData[student.id]?.comment || ''}
                                    onChange={(e) => setScoresData(prev => ({
                                      ...prev,
                                      [student.id]: { ...prev[student.id], comment: e.target.value, studentId: student.id }
                                    }))}
                                  />
                                ) : (
                                  <span className="text-gray-600">{scoresData[student.id]?.comment || '-'}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {modalMode === 'enter' && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowScoresModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Scores
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Assessments;
