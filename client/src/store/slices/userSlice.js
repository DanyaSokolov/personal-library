import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { accountApi } from "../../api/api.js"
import handleError from "./error/error.js"

const initialState = {
    users: {
        users: [],
        limit: 12,
        count: 0,
        connection: {
            isUsersFetch: true,
            isAddingFetch: false,
            isDeletingFetch: false,
        },
        deletingID: '',
        usersNotFound: false
    },
}

export const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        setDeletingUserID: (state, action) => {
            state.users.deletingID = action.payload
        },
    },
    extraReducers(builder) {
        builder
            .addCase(apiGetUsers.pending, (state, _) => { 
                state.users.connection.isUsersFetch = true
                state.users.usersNotFound = false
            }) 
            .addCase(apiGetUsers.fulfilled, (state, action) => { 
                switch (action.payload.status) {
                    case "no_users":
                        state.users.usersNotFound = true
                        break
                    case "success": 
                        state.users.users = action.payload.data.users
                        state.users.count = action.payload.data.count
                        break
                }
                state.users.connection.isUsersFetch = false 
            })
            .addCase(apiGetUsers.rejected, (state, _) => {
                state.users.connection.isUsersFetch = false
            })
            .addCase(apiAddUser.pending, (state, _) => {
                state.users.connection.isAddingFetch = true
            })
            .addCase(apiAddUser.fulfilled, (state, _) => { 
                state.users.connection.isAddingFetch = false 
            }) 
            .addCase(apiAddUser.rejected, (state, _) => {
                state.users.connection.isAddingFetch = false
            })
            .addCase(apiDeleteUser.pending, (state, _) => {
                state.users.connection.isDeletingFetch = true
            })
            .addCase(apiDeleteUser.fulfilled, (state, _) => { 
                state.users.connection.isDeletingFetch = false 
            })
            .addCase(apiDeleteUser.rejected, (state, _) => {
                state.users.connection.isDeletingFetch = false
            })
    }
})

export const apiGetUsers = createAsyncThunk(
    "books/apiGetUsers",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetUsers(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiAddUser = createAsyncThunk(
    "books/apiAddUser",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.AddUser(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiDeleteUser = createAsyncThunk(
    "books/apiDeleteUser",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.DeleteUser(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const { setDeletingUserID } = usersSlice.actions
export default usersSlice.reducer