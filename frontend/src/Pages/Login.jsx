// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { loginUser, clearError } from '../features/Auth/LoginSlice';
// import { useNavigate } from 'react-router-dom';
// import { LogIn, Sparkles, Zap } from 'lucide-react';

// const Login = () => {
//   const [showLanding, setShowLanding] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

//   // Landing animation: 3 seconds ke baad login form show
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowLanding(false);
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, []);

//   // Agar already authenticated hai (localStorage se load hua), to direct dashboard
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/dashboard', { replace: true });
//     }
//   }, [isAuthenticated, navigate]);

//   const handleSubmit = (e) => {
//     e?.preventDefault(); // form submit hone pe page reload na ho

//     if (!email.trim() || !password) {
//       dispatch(clearError());
//       // You can show a custom message if needed, but backend error will handle most cases
//       return;
//     }

//     dispatch(clearError());
//     dispatch(loginUser({ email, password }));
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && email.trim() && password) {
//       handleSubmit();
//     }
//   };

//   // Landing Page
//   if (showLanding) {
//     return (
//       <div className="fixed inset-0 bg-black to-indigo-900 flex items-center justify-center overflow-hidden">
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
//           <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
//           <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
//         </div>

//         <div className="relative z-10 text-center animate-fade-in">
//           <div className="mb-8 relative">
//             <div className="absolute inset-0 flex items-center justify-center">
//               <Sparkles className="w-32 h-32 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
//             </div>
//             <Zap className="w-24 h-24 text-white mx-auto relative z-10 animate-bounce" />
//           </div>
          
//           <h1 className="text-6xl font-bold text-white mb-4 animate-slide-up">Welcome To VRN Infa Payment System</h1>
          
//           <div className="flex items-center justify-center space-x-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
//             <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
//             <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//             <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
//           </div>
          
//           <p className="text-2xl text-blue-200 mt-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
//             Loading your experience...
//           </p>
//         </div>

//         <style jsx>{`
//           @keyframes fade-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
//           @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
//           .animate-fade-in { animation: fade-in 1s ease-out; }
//           .animate-slide-up { animation: slide-up 0.8s ease-out forwards; opacity: 0; }
//         `}</style>
//       </div>
//     );
//   }
  

//   // Main Login Form
//   return (
//     <div className="min-h-screen bg-black to-pink-900 flex items-center justify-center p-4">
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {[...Array(20)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute w-2 h-2 bg-white rounded-full opacity-20"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
//               animationDelay: `${Math.random() * 5}s`
//             }}
//           />
//         ))}
//       </div>

//       <div className="relative z-10 w-full max-w-md">
//         <div className=" bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white border-opacity-20 transform transition-all ">
//           <div className="flex justify-center mb-6">
//             <div className="relative">
//               <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full blur-xl opacity-50" />
//               <div className="relative bg-white p-4 rounded-full">
//                 {/* <img src='rcc-logo.png' className="w-9 h-9 text-white" /> */}
//               </div>
//             </div>
//           </div>

//           <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
//            VRN  Payment System
//           </h2>
//           <p className="text-center text-blue-200 mb-8">Login to access your dashboard</p>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-white">Email Address</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 required
//                 placeholder="your@email.com"
//                 className="w-full px-4 py-3 bg-black bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-blue-100">Password</label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 required
//                 placeholder="••••••••"
//                 className="w-full px-4 py-3 bg-black bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
//               />
//             </div>

//             {error && (
//               <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded-xl text-sm text-center">
//                 {error}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={isLoading || !email.trim() || !password}
//               className="w-full py-3 px-4 bg-gray-800 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                   </svg>
//                   Logging in...
//                 </span>
//               ) : (
//                 'Login'
//               )}
//             </button>
//           </form>

//           {/* Optional: Remove in production */}
//           {/* <div className="mt-6 p-4 bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10">
//             <p className="text-xs text-blue-200 text-center">
//               <span className="font-semibold">Demo Credentials:</span><br />
//               Use your registered email & password
//             </p>
//           </div> */}

//           <div className="mt-6 text-center">
//             <button className="text-sm text-white hover:text-white transition-colors">
//               Forgot Password?
//             </button>
//           </div>
//         </div>

     
//       </div>

//       <style jsx>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0) translateX(0); }
//           50% { transform: translateY(-20px) translateX(10px); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Login;





import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../features/Auth/LoginSlice';
import { useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, Zap, FileText } from 'lucide-react';

const Login = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Landing animation: 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLanding(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Already authenticated → dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!email.trim() || !password) {
      dispatch(clearError());
      return;
    }
    dispatch(clearError());
    dispatch(loginUser({ email, password }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && email.trim() && password) {
      handleSubmit();
    }
  };

  // ============================================
  // Landing Page - Light Theme
  // ============================================
  if (showLanding) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center overflow-hidden">
        {/* Background Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"
          />
          <div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center animate-fade-in">
          <div className="mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles
                className="w-32 h-32 text-yellow-400 animate-spin"
                style={{ animationDuration: '3s' }}
              />
            </div>
            <Zap className="w-24 h-24 text-blue-600 mx-auto relative z-10 animate-bounce" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4 animate-slide-up">
            Welcome To VRN Infra Payment System
          </h1>

          <div
            className="flex items-center justify-center space-x-2 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            />
          </div>

          <p
            className="text-2xl text-gray-500 mt-6 animate-slide-up"
            style={{ animationDelay: '0.5s' }}
          >
            Loading your experience...
          </p>
        </div>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 1s ease-out; }
          .animate-slide-up { animation: slide-up 0.8s ease-out forwards; opacity: 0; }
        `}</style>
      </div>
    );
  }

  // ============================================
  // Main Login Form - Light Theme
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Floating Dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 transform transition-all">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0  blur-xl opacity-30" />
              <div className="relative  p-4 rounded-full w-40">
                
              <img src="vrn1.jpg"  />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            VRN Payment System
          </h2>
          <p className="text-center text-gray-400 mb-8">
            Login to access your dashboard
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transform transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* ============================================ */}
          {/* Divider */}
          {/* ============================================ */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ============================================ */}
          {/* Office Expenses Form Button */}
          {/* ============================================ */}
          <button
            type="button"
            onClick={() => navigate('/OfficeForm')}
            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transform transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-300 flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Office Expenses Form
          </button>

          {/* Forgot Password */}
          <div className="mt-6 text-center">
            <button className="text-sm text-gray-400 hover:text-blue-500 transition-colors">
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © 2025 VRN Infra. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default Login;