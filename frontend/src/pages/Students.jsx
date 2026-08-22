import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Eye, Edit, Trash2, GraduationCap, X, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Students() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [meta, setMeta] = useState(null);

  // Edit State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    classId: '',
    gender: 'Male',
    upiNumber: '',
    assessmentNumber: '',
    sneStatus: 'NO'
  });
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (loading) return;

    // 1. Filter
    const filtered = allStudents.filter(s => {
      const query = search.toLowerCase().trim();
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const admission = (s.admissionNumber || '').toLowerCase();
      const upi = (s.upiNumber || '').toLowerCase();
      const assessment = (s.assessmentNumber || '').toLowerCase();
      const className = (s.class?.name || s.class?.grade?.name || '').toLowerCase();

      const matchesSearch = !query ||
        fullName.includes(query) ||
        admission.includes(query) ||
        upi.includes(query) ||
        assessment.includes(query) ||
        className.includes(query);

      const matchesGrade = selectedGrade === 'ALL' ||
        s.class?.grade?.name === selectedGrade ||
        s.class?.name === selectedGrade ||
        (s.class?.grade?.level && `Grade ${s.class.grade.level}` === selectedGrade);

      return matchesSearch && matchesGrade;
    });

    // 2. Paginate
    const limit = pageSize === 0 ? filtered.length : pageSize;
    const totalPages = limit > 0 ? Math.ceil(filtered.length / limit) || 1 : 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);

    const startIndex = (currentPage - 1) * limit;
    const paginated = limit > 0 ? filtered.slice(startIndex, startIndex + limit) : filtered;

    setStudents(paginated);
    setMeta({
      total: filtered.length,
      page: currentPage,
      lastPage: totalPages,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages
    });

  }, [search, selectedGrade, page, pageSize, allStudents, loading]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students', {
        params: { limit: 1000 },
      });
      setAllStudents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/academic/classes');
      setClasses(res.data.data || []);
    } catch (e) {
      console.error('Failed to load classes', e);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      classId: student.class?.id || '',
      gender: student.gender || 'Male',
      upiNumber: student.upiNumber || '',
      assessmentNumber: student.assessmentNumber || '',
      sneStatus: student.sneStatus || 'NO'
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/students/${editingStudent.id}`, editForm);
      toast.success('Student record updated successfully');
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update student');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleExportPDF = () => {
    try {
      toast.loading('Generating Student Register PDF...');

      // Filtered records to export
      const exportList = allStudents.filter(s => {
        const query = search.toLowerCase().trim();
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const admission = (s.admissionNumber || '').toLowerCase();
        const upi = (s.upiNumber || '').toLowerCase();
        const assessment = (s.assessmentNumber || '').toLowerCase();
        const className = (s.class?.name || s.class?.grade?.name || '').toLowerCase();

        const matchesSearch = !query ||
          fullName.includes(query) ||
          admission.includes(query) ||
          upi.includes(query) ||
          assessment.includes(query) ||
          className.includes(query);

        const matchesGrade = selectedGrade === 'ALL' ||
          s.class?.grade?.name === selectedGrade ||
          s.class?.name === selectedGrade ||
          (s.class?.grade?.level && `Grade ${s.class.grade.level}` === selectedGrade);

        return matchesSearch && matchesGrade;
      });

      if (exportList.length === 0) {
        toast.dismiss();
        toast.error('No student records found to export');
        return;
      }

      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4

      // Header Banner
      doc.setFillColor(30, 64, 175); // Primary Navy
      doc.rect(0, 0, 297, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('KYAMATU PRIMARY SCHOOL / MATUNDU ACADEMY', 14, 10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL CBC & NEMIS STUDENT ENROLLMENT REGISTER (2026)', 14, 17);

      // Metadata right aligned
      doc.setFontSize(8);
      doc.text(`Filter: ${selectedGrade} | Total: ${exportList.length} Learners | Date: ${new Date().toLocaleDateString()}`, 297 - 14, 15, { align: 'right' });

      // Table Data
      const headers = [['#', 'Adm No', 'Student Name', 'Grade', 'Gender', 'NEMIS UPI / Assess No', 'Parent / Guardian', 'Parent Phone', 'Status']];
      
      const rows = exportList.map((st, idx) => {
        const guardian = st.guardians?.[0]?.guardian;
        const parentName = guardian ? `${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() : 'N/A';
        const parentPhone = guardian?.user?.phone || 'N/A';
        const nemisOrAssess = st.upiNumber || st.assessmentNumber || '---';

        return [
          idx + 1,
          st.admissionNumber || `MAT/2026/${String(idx + 1).padStart(4, '0')}`,
          `${st.firstName} ${st.lastName}`,
          st.class?.grade?.name || st.class?.name || 'Grade 1',
          st.gender || 'Male',
          nemisOrAssess,
          parentName,
          parentPhone,
          st.admissionStatus || 'APPROVED',
        ];
      });

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 28,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 28, fontStyle: 'bold' },
          2: { cellWidth: 48 },
          3: { cellWidth: 24 },
          4: { cellWidth: 18 },
          5: { cellWidth: 46 },
          6: { cellWidth: 42 },
          7: { cellWidth: 30 },
          8: { cellWidth: 24, halign: 'center' },
        },
        didDrawPage: (data) => {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Page ${data.pageNumber} of ${pageCount} - Confidential School Records`, 14, 205);
        }
      });

      const gradeSuffix = selectedGrade === 'ALL' ? 'All_Grades' : selectedGrade.replace(/\s+/g, '_');
      doc.save(`Student_Register_${gradeSuffix}_2026.pdf`);
      toast.dismiss();
      toast.success('Student Register PDF exported successfully!');
    } catch (err) {
      toast.dismiss();
      console.error('PDF export error:', err);
      toast.error('Failed to export PDF: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
    };
    return `px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
  };

  // Grade list for filtering
  const availableGrades = ['ALL', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learners & Students</h1>
          <p className="text-gray-500">Official student records, NEMIS identifiers, and CBC grade registers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="btn btn-secondary flex items-center gap-2"
            title="Download formatted Student Register PDF"
          >
            <Download className="w-4 h-4 text-primary-600" />
            <span>Export Register PDF</span>
          </button>
          <Link
            to="/admissions"
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, admission no, NEMIS UPI, assessment no..."
              className="input pl-10 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Grade:</span>
            </div>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setPage(1);
              }}
              className="input text-sm py-2 px-3 bg-white border border-gray-300 rounded-lg"
            >
              {availableGrades.map(g => (
                <option key={g} value={g}>{g === 'ALL' ? 'All Grades' : g}</option>
              ))}
            </select>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="input text-sm py-2 px-3 bg-white border border-gray-300 rounded-lg"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={0}>Show All</option>
            </select>
          </div>
        </div>

        {/* Quick Grade Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {availableGrades.map(g => (
            <button
              key={g}
              onClick={() => { setSelectedGrade(g); setPage(1); }}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                selectedGrade === g
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {g === 'ALL' ? `All (${allStudents.length})` : g}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="font-semibold text-gray-700">Adm No</th>
                <th className="font-semibold text-gray-700">Learner Name</th>
                <th className="font-semibold text-gray-700">NEMIS Identifiers</th>
                <th className="font-semibold text-gray-700">Class / Grade</th>
                <th className="font-semibold text-gray-700">Gender</th>
                <th className="font-semibold text-gray-700">Status</th>
                <th className="font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <GraduationCap className="w-8 h-8 text-blue-500 animate-bounce" />
                      <span className="text-sm text-gray-500">Loading student registry...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    <p className="font-medium text-gray-700">No learners found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search keywords or grade filter.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="font-mono text-sm font-semibold text-gray-800">
                      {student.admissionNumber}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                          {student.firstName?.charAt(0)}
                          {student.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{student.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        {student.upiNumber ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                              UPI: {student.upiNumber}
                            </span>
                          </div>
                        ) : null}
                        {student.assessmentNumber ? (
                          <div className="text-[11px] text-gray-500 font-mono">
                            Index: {student.assessmentNumber}
                          </div>
                        ) : null}
                        {!student.upiNumber && !student.assessmentNumber && (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800">
                        {student.class
                          ? (student.class.name || student.class.grade?.name)
                          : 'Not Assigned'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-700">{student.gender || '—'}</span>
                    </td>
                    <td>
                      <span className={getStatusBadge(student.admissionStatus)}>
                        {student.admissionStatus}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/students/${student.id}`}
                          title="View Profile"
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(student)}
                          title="Edit Student"
                          className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          title="Delete Student"
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{students.length}</span> of <span className="font-semibold text-gray-900">{meta.total}</span> students
              {selectedGrade !== 'ALL' ? ` in ${selectedGrade}` : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={!meta.hasPrev}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="btn btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 font-medium px-2">
                Page {meta.page} of {meta.lastPage}
              </span>
              <button
                disabled={!meta.hasNext}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Learner Profile</h2>
                <p className="text-xs text-gray-500">{editingStudent.admissionNumber}</p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-semibold">First Name *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs font-semibold">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-semibold">Class / Grade *</label>
                  <select
                    className="input w-full"
                    value={editForm.classId}
                    onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.grade?.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs font-semibold">Gender</label>
                  <select
                    className="input w-full"
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-xs font-semibold">NEMIS Unique Learner Identifier (ULI / UPI)</label>
                <input
                  type="text"
                  placeholder="e.g. KEN202615126ZJLE2-0"
                  className="input w-full font-mono text-sm"
                  value={editForm.upiNumber}
                  onChange={(e) => setEditForm({ ...editForm, upiNumber: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-semibold">Assessment / Index No.</label>
                  <input
                    type="text"
                    placeholder="e.g. B005105012"
                    className="input w-full font-mono text-sm"
                    value={editForm.assessmentNumber}
                    onChange={(e) => setEditForm({ ...editForm, assessmentNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs font-semibold">SNE Status</label>
                  <select
                    className="input w-full"
                    value={editForm.sneStatus}
                    onChange={(e) => setEditForm({ ...editForm, sneStatus: e.target.value })}
                  >
                    <option value="NO">No Special Needs</option>
                    <option value="YES">Special Needs (SNE)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
