import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { accountApi } from "../../api/api.js"
import handleError from "./error/error.js"

const initialState = {
    loans: {
        loans: [],
        limit: 12,
        count: 0,
        connection: {
            isLoansFetch: true,
        },
        loansNotFound: false,
    },
    create_info: {
        users: [],
        connection: {
            isLoanAddingInfoFetch: false,
            isCreatingFetch: false
        }
    },
    loan_info: {
        ID_Book: 0,
        date_loan: 0,
        termin_loan: 0,
        status: 0,
        number_grade: 0,
        date_return: 0,
        connection: {
            isInfoFetch: true,
            isReturningLoan: false
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
            .addCase(apiGetLoans.pending, (state, _) => {
                state.loans.connection.isLoansFetch = true
                state.loans.loansNotFound = false
            })
            .addCase(apiGetLoans.fulfilled, (state, action) => {
                switch (action.payload.status) {
                    case "no_loans":
                        state.loans.loansNotFound = true
                        break
                    case "success":
                        state.loans.loans = action.payload.data.loans
                        state.loans.count = action.payload.data.count
                        break
                }
                state.loans.connection.isLoansFetch = false
            })
            .addCase(apiGetLoans.rejected, (state, _) => {
                state.loans.connection.isLoansFetch = false
            })
            .addCase(apiGetLoanInfo.pending, (state, _) => {
                state.loan_info.connection.isInfoFetch = true
            })
            .addCase(apiGetLoanInfo.fulfilled, (state, action) => {
                if (action.payload.status == "success") {
                    Object.assign(state.loan_info, action.payload.data)
                }
                state.loan_info.connection.isInfoFetch = false
            })
            .addCase(apiReturnedLoan.pending, (state, _) => {
                state.loan_info.connection.isReturningLoan = true
            })
            .addCase(apiReturnedLoan.fulfilled, (state, _) => {
                state.loan_info.connection.isReturningLoan = false
            })
            .addCase(apiReturnedLoan.rejected, (state, _) => {
                state.loan_info.connection.isReturningLoan = false
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

export const apiGetLoans = createAsyncThunk(
    "loans/apiGetLoans",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetLoans(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetLoanInfo = createAsyncThunk(
    "loans/apiGetLoanInfo",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            console.log(data)
            const res = await accountApi.GetLoanInfo(JSON.stringify(data))

            console.log(res.data)

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiReturnedLoan = createAsyncThunk(
    "loans/apiReturnedLoan",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            console.log(data)
            const res = await accountApi.ReturnedLoan(JSON.stringify(data))

            console.log(res.data)

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export default loansSlice.reducer