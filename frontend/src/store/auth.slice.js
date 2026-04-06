import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/axios";

export const getCurrentUser = createAsyncThunk("auth/getCurrentUser",
    async(_, thunkAPI)=>{
        try {
            const res = await api.get("/user/me");
            return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const loginUser = createAsyncThunk("auth/loginUser",
    async(formData, thunkAPI)=>{
        try {
            const res = await api.post("/user/login", formData);
            return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const logoutUser = createAsyncThunk("auth/logoutUser", 
    async(_, thunkAPI)=>{
        try {
            const res = await api.patch("/user/logout")
            return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
)

export const registerUser = createAsyncThunk("auth/registerUser", 
    async(formData, thunkAPI)=>{
        try {
            const res = await api.post("/user/register", formData);
            return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        isAuthenticated: false,
    },
    reducers: {
        logout: (state)=>{
            state.user =  null;
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder)=>{
        builder
        .addCase(getCurrentUser.pending, (state)=>{
            state.loading = true
        })
        .addCase(getCurrentUser.fulfilled, (state, action)=>{
            state.loading = false,
            state.user = action.payload,
            state.isAuthenticated = true
        })
        .addCase(getCurrentUser.rejected, (state)=>{
            state.user = null;
            state.loading = false,
            state.isAuthenticated = false
        })

        .addCase(loginUser.pending, (state)=>{
            state.loading = true
        })
        .addCase(loginUser.fulfilled, (state, action)=>{
            state.user = action.payload,
            state.loading = false,
            state.isAuthenticated = true
        })
        .addCase(loginUser.rejected, (state)=>{
            state.loading = false,
            state.user = null,
            state.isAuthenticated = false
        })
        .addCase(registerUser.pending, (status)=>{
            status.loading = true;
        })
        .addCase(registerUser.fulfilled, (status, action)=>{
            status.user = action.payload
            status.isAuthenticated = true
            status.loading = false
        })
        .addCase(registerUser.rejected, (status)=>{
            status.loading = false;
            status.isAuthenticated = false
            status.user = null
        })
        .addCase(logoutUser.pending, (status)=>{
            status.loading = true
        })
        .addCase(logoutUser.fulfilled, (status)=>{
            status.user = null;
            status.isAuthenticated = false
            status.loading = false
        })
        .addCase(logoutUser.rejected, (status)=>{
            status.loading = false
        })
    }
})

export const {logout} = authSlice.actions;
export default authSlice.reducer;