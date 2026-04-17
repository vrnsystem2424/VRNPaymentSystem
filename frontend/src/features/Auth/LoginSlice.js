// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// // Async Thunk for Login
// export const loginUser = createAsyncThunk(
//   'auth/login',
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         return rejectWithValue(data.message || 'Invalid email or password');
//       }

//       const userType = data.user?.type || 'user';
//       const userEmail = data.user?.email || email;

//       // sessionStorage में save करो (tab close होते ही clear हो जाएगा)
//       sessionStorage.setItem('token', data.token);
//       sessionStorage.setItem('userType', userType);
//       sessionStorage.setItem('userEmail', userEmail);

//       return {
//         token: data.token,
//         userType,
//         email: userEmail,
//       };
//     } catch (error) {
//       return rejectWithValue('Network error. Please check your connection and try again.');
//     }
//   }
// );

// // Initial State – page load/refresh पर sessionStorage से values load करो
// const initialState = {
//   token: sessionStorage.getItem('token') || null,
//   userType: sessionStorage.getItem('userType') || null,
//   email: sessionStorage.getItem('userEmail') || null,
//   isLoading: false,
//   isAuthenticated: !!sessionStorage.getItem('token'),
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // Logout action
//     logout: (state) => {
//       state.token = null;
//       state.userType = null;
//       state.email = null;
//       state.isAuthenticated = false;
//       state.error = null;

//       // sessionStorage से सब remove करो
//       sessionStorage.removeItem('token');
//       sessionStorage.removeItem('userType');
//       sessionStorage.removeItem('userEmail');
//     },

//     // Error clear karne ke liye
//     clearError: (state) => {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isAuthenticated = true;
//         state.token = action.payload.token;
//         state.userType = action.payload.userType;
//         state.email = action.payload.email;
//         // Note: sessionStorage already set in thunk
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isAuthenticated = false;
//         state.error = action.payload || 'Login failed';
//       });
//   },
// });

// // Export actions
// export const { logout, clearError } = authSlice.actions;

// // Export reducer
// export default authSlice.reducer;





import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      console.log('🔍 Backend Response:', data); // Debug log

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || data.error || 'Invalid email or password');
      }

      // ✅ CORRECT: Direct access
      const userType = data.userType || 'user';
      const userEmail = email.trim().toLowerCase();

      // console.log('✅ UserType:', userType); // Debug log

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('userType', userType);
      sessionStorage.setItem('userEmail', userEmail);

      return {
        token: data.token,
        userType,
        email: userEmail,
      };
    } catch (error) {
      console.error('❌ Network Error:', error);
      return rejectWithValue('Network error. Please check your connection and try again.');
    }
  }
);

const initialState = {
  token: sessionStorage.getItem('token') || null,
  userType: sessionStorage.getItem('userType') || null,
  email: sessionStorage.getItem('userEmail') || null,
  isLoading: false,
  isAuthenticated: !!sessionStorage.getItem('token'),
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.userType = null;
      state.email = null;
      state.isAuthenticated = false;
      state.error = null;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userType');
      sessionStorage.removeItem('userEmail');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.userType = action.payload.userType;
        state.email = action.payload.email;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Login failed';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;