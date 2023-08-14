import {Dispatch} from 'redux'

import {authAPI, LoginParamsType} from 'api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunk} from "app/store";
import {appReducerActions} from "app/app-reducer";
import {clearTasksAndTodolists} from "features/TodolistsList/Todolist/common/common.actions";

const initialState = {
    isLoggedIn: false
}

const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setIsLoggedIn:(state,action:PayloadAction<{value:boolean}>):void =>{
            state.isLoggedIn = action.payload.value
        }
    }
})



/*export const _authReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'login/SET-IS-LOGGED-IN':
            return {...state, isLoggedIn: action.value}
        default:
            return state
    }
}*/

// actions
export const authReducer = slice.reducer
export const authActions = slice.actions
// thunks
export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch) => {
    dispatch(appReducerActions.setAppStatusAC({status:'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(authActions.setIsLoggedIn({value:true}))
                dispatch(appReducerActions.setAppStatusAC({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const logoutTC = ():AppThunk => (dispatch: Dispatch) => {
    dispatch(appReducerActions.setAppStatusAC({status:'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(authActions.setIsLoggedIn({value:false}))
               dispatch(clearTasksAndTodolists())
                dispatch(appReducerActions.setAppStatusAC({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}

// types

/*type ActionsType = ReturnType<typeof setIsLoggedInAC>
type InitialStateType = {
    isLoggedIn: boolean
}*/

/*
type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
*/
