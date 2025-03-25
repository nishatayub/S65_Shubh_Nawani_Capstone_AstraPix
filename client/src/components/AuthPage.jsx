import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import BackgroundImage from '../assets/bg.jpg';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const url = `http://localhost:8000/api/${isLogin ? 'login' : 'signup'}`;
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Response:', response.data);

      localStorage.setItem('authToken', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center filter brightness-50" style={{ backgroundImage: `url(${BackgroundImage})`, backgroundPosition: 'center', backgroundSize: 'cover', zIndex: -1 }} />
      <motion.div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden relative z-10" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring', stiffness: 50 }}>
        <div className="p-8">
          <motion.div className="flex justify-between items-center mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-bold text-gray-800">{isLogin ? 'Login' : 'Signup'}</h2>
            <motion.button onClick={handleToggle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-sm text-purple-600 hover:text-purple-800 transition-colors">{isLogin ? 'Signup' : 'Login'}</motion.button>
          </motion.div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <AnimatePresence mode="wait">
            <motion.form key={isLogin ? 'login' : 'signup'} onSubmit={handleSubmit} initial={{ opacity: 0, x: isLogin ? -50 : 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, type: 'spring', stiffness: 100 }} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className="w-full px-4 py-3 rounded-lg bg-white/70 backdrop-blur-sm border-transparent focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300" required />
              </div>
              <div className="relative">
                <label className="block text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className="w-full px-4 py-3 rounded-lg bg-white/70 backdrop-blur-sm border-transparent focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300 pr-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition duration-300 ease-in-out transform">{isLogin ? 'Login' : 'Signup'}</motion.button>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
