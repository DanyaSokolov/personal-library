import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { accountApi } from "../../api/api.js"
import { notifications } from '@mantine/notifications';
import handleError from "./error/error.js"

const initialState = {
    
    connection: {
        
    }
}

export const booksSlice = createSlice({
    name: "books",
    initialState,
    reducers: {},
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

export default booksSlice.reducer