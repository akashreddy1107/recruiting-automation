import { useState, useEffect } from 'react';
import { X, Save, Briefcase, MapPin, DollarSign, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JobModal({ isOpen, onClose, onSave, job }) {
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        status: 'Active',
        description: '',
        requirements: '',
        salaryMin: '',
        salaryMax: '',
        currency: 'USD'
    });

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || '',
                department: job.department || '',
                location: job.location || '',
                type: job.type || 'Full-time',
                status: job.status || 'Active',
                description: job.description || '',
                requirements: job.requirements ? job.requirements.join('\n') : '',
                salaryMin: job.salaryRange?.min || '',
                salaryMax: job.salaryRange?.max || '',
                currency: job.salaryRange?.currency || 'USD'
            });
        } else {
            setFormData({
                title: '',
                department: '',
                location: '',
                type: 'Full-time',
                status: 'Active',
                description: '',
                requirements: '',
                salaryMin: '',
                salaryMax: '',
                currency: 'USD'
            });
        }
    }, [job, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            requirements: formData.requirements.split('\n').filter(line => line.trim() !== ''),
            salaryRange: {
                min: Number(formData.salaryMin),
                max: Number(formData.salaryMax),
                currency: formData.currency
            }
        };
        delete payload.salaryMin;
        delete payload.salaryMax;

        onSave(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-charcoal border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Briefcase className="text-accent-blue" size={24} />
                        {job ? 'Edit Job' : 'Create New Job'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Job Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-2.5 text-primary focus:border-accent-blue focus:outline-none transition-colors"
                                placeholder="e.g. Senior React Developer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Department</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-2.5 text-primary focus:border-accent-blue focus:outline-none transition-colors"
                                placeholder="e.g. Engineering"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-secondary" size={16} />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full bg-graphite border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-primary focus:border-accent-blue focus:outline-none transition-colors"
                                    placeholder="e.g. Remote / New York"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Employment Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-2.5 text-primary focus:border-accent-blue focus:outline-none transition-colors"
                            >
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Internship</option>
                                <option>Freelance</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-secondary uppercase tracking-wider">Salary Range</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 text-secondary" size={16} />
                                <input
                                    type="number"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleChange}
                                    className="w-full bg-graphite border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-primary focus:border-accent-blue focus:outline-none transition-colors"
                                    placeholder="Min"
                                />
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 text-secondary" size={16} />
                                <input
                                    type="number"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    className="w-full bg-graphite border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-primary focus:border-accent-blue focus:outline-none transition-colors"
                                    placeholder="Max"
                                />
                            </div>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="bg-graphite border border-white/10 rounded-lg px-4 py-2.5 text-primary focus:border-accent-blue focus:outline-none transition-colors"
                            >
                                <option>USD</option>
                                <option>EUR</option>
                                <option>GBP</option>
                                <option>INR</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-secondary uppercase tracking-wider">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            required
                            className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-2.5 text-primary focus:border-accent-blue focus:outline-none transition-colors resize-none"
                            placeholder="Job description..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-secondary uppercase tracking-wider">Requirements (One per line)</label>
                        <textarea
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-2.5 text-primary focus:border-accent-blue focus:outline-none transition-colors resize-none"
                            placeholder="- 5+ years of experience&#10;- Strong knowledge of React"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-secondary uppercase tracking-wider">Status</label>
                        <div className="flex gap-4">
                            {['Active', 'Closed', 'Draft'].map(s => (
                                <label key={s} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${formData.status === s ? 'border-accent-blue bg-accent-blue' : 'border-secondary group-hover:border-accent-blue'}`}>
                                        {formData.status === s && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s}
                                        checked={formData.status === s}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className={`text-sm ${formData.status === s ? 'text-primary' : 'text-secondary group-hover:text-primary'}`}>{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg text-secondary hover:text-primary hover:bg-white/5 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors font-medium flex items-center gap-2 shadow-lg shadow-accent-blue/20"
                        >
                            <Save size={18} />
                            Save Job
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
