import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { accountApi } from "../../api/api.js"
import handleError from "./error/error.js"

const initialState = {
    create_info: {
        users: [],
        connection: {
            isLoanAddingInfoFetch: false,
            isCreatingFetch: false
        }
    }
}

export const loansSlice = createSlice({
    name: "loans",
    initialState,
    reducers: {
    },
    extraReducers(builder) {
        builder
            .addCase(apiGetLoanAddingInfo.pending, (state, _) => {
                state.create_info.connection.isLoanAddingInfoFetch = true
            })
            .addCase(apiGetLoanAddingInfo.fulfilled, (state, action) => {
                if (action.payload.status == "success") {
                    state.create_info.users = action.payload.data.users
                }
                state.create_info.connection.isLoanAddingInfoFetch = false
            })
            .addCase(apiCreateLoan.pending, (state, _) => {
                state.create_info.connection.isCreatingFetch = true
            })
            .addCase(apiCreateLoan.fulfilled, (state, _) => {
                state.create_info.connection.isCreatingFetch = false
            })
            .addCase(apiCreateLoan.rejected, (state, _) => {
                state.create_info.connection.isCreatingFetch = false
            })
    }
})

export const apiGetLoanAddingInfo = createAsyncThunk(
    "loans/apiGetLoanAddingInfo",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetLoanAddingInfo()

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiCreateLoan = createAsyncThunk(
    "loans/apiCreateLoan",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.CreateLoan(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export default loansSlice.reducer