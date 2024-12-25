import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authApi, accountApi } from "../../api/api.js"
import { notifications } from '@mantine/notifications';
import handleError from "./error/error.js"

const initialState = {
    name: "",
    isAuth: false,
    connection: {
        isAuthFetch: true,
        isLoginingFetch: false,
        isLogoutingFetch: false
    }
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: { 
        setIsAuth: (state, action) => {
            state.isAuth = action.payload
        },
    },
    extraReducers(builder) {
        builder
            .addCase(apiIsUser.pending, (state, _) => {
                state.isAuth = false
                state.connection.isAuthFetch = true
            })
            .addCase(apiIsUser.fulfilled, (state, action) => { 
                if(action.payload.status == "success") {
                    state.name = action.payload.data.name
                    state.isAuth = true
                }
                state.connection.isAuthFetch = false
            })
            .addCase(apiLogin.pending, (state, _) => {
                state.connection.isLoginingFetch = true
            })
            .addCase(apiLogin.fulfilled, (state, _) => { 
                state.connection.isLoginingFetch = false
            })
            .addCase(apiLogin.rejected, (state, _) => { 
                state.connection.isLoginingFetch = false
            })
            .addCase(apiLogout.pending, (state, _) => {
                state.connection.isLogoutingFetch = true
            })
            .addCase(apiLogout.fulfilled, (state, _) => { 
                state.connection.isLogoutingFetch = false
            }) 
            .addCase(apiLogout.rejected, (state, _) => { 
                state.connection.isLogoutingFetch = false
            })
    }
})

export const apiLogin = createAsyncThunk(
    "auth/apiLogin",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            console.log(JSON.stringify(data))
            const res = await authApi.Login(JSON.stringify(data))

            if (res.data.status == "success") {
                notifications.show({
                    color: "green",
                    title: 'Successfully logged in',
                    position: "bottom-center",
                })
            }

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiLogout = createAsyncThunk(
    "auth/apiLogout",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const res = await authApi.Logout()

            if(res.data.status == "success") {
                dispatch(toast("primary", "Logged out of account"))
            }

            return res.data 
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiIsUser = createAsyncThunk(
    "auth/apiIsUser",
    async (_, { dispatch, rejectWithValue }) => {
        console.log("apiIsUser")
        try {
            const res = await accountApi.IsUser()

            console.log(res.data)

            return res.data 
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const { setIsAuth } = authSlice.actions
export default authSlice.reducer