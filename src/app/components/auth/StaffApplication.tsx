import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { User, Mail, Phone, CreditCard, Briefcase, FileText, Upload, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const SKILLS = [
  'General Cleaning',
  'Deep Cleaning',
  'Laundry & Ironing',
  'Dry Cleaning',
  'Window Cleaning',
  'Carpet Cleaning'
];

export default function StaffApplication() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nic: '',
    experience: '',
    skills: [] as string[],
    cv: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/verify-success');
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Info Side */}
          <div className="w-full md:w-1/3 space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Staff Application</h1>
              <p className="text-gray-600 leading-relaxed">
                Join our professional cleaning network. We offer flexible hours, competitive pay, and comprehensive insurance coverage for all our staff members.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Verified Process</h3>
                  <p className="text-sm text-gray-500">We prioritize safety and quality through a rigorous verification process.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Training Provided</h3>
                  <p className="text-sm text-gray-500">Get access to professional cleaning workshops and equipment training.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">Next Steps</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-900 shrink-0">1</span>
                  Submit your details & documents
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-900 shrink-0">2</span>
                  Application review (24-48 hrs)
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-900 shrink-0">3</span>
                  In-person interview & onboarding
                </li>
              </ul>
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-2/3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@work.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+94 7X XXX XXXX"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">National ID / Verification ID</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="nic"
                        required
                        value={formData.nic}
                        onChange={handleChange}
                        placeholder="199XXXXXXXXX"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Years of Experience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="experience"
                      required
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none text-gray-700"
                    >
                      <option value="">Select Experience</option>
                      <option value="0">Less than 1 year</option>
                      <option value="1-2">1 - 2 years</option>
                      <option value="3-5">3 - 5 years</option>
                      <option value="5+">5+ years</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 ml-1">Service Skills</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SKILLS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-between group ${
                          formData.skills.includes(skill)
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'
                        }`}
                      >
                        {skill}
                        {formData.skills.includes(skill) && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Document Upload (CV / ID Proof)</label>
                  <div className="relative border-2 border-dashed border-gray-200 rounded-[24px] p-10 hover:border-emerald-500/50 transition-colors bg-gray-50/30 flex flex-col items-center justify-center text-center">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setFormData({ ...formData, cv: e.target.files?.[0] || null })}
                    />
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">
                      {formData.cv ? formData.cv.name : "Click to upload CV or ID Proof"}
                    </p>
                    <p className="text-sm text-gray-400">PDF, JPG, or PNG up to 10MB</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Apply as Staff Member"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  By applying, you agree to our <span className="text-emerald-600 font-bold cursor-pointer">Staff Agreement</span> and <span className="text-emerald-600 font-bold cursor-pointer">Conduct Policy</span>.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
