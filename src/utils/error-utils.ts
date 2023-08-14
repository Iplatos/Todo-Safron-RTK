import {ResponseType} from '../api/todolists-api'
import {Dispatch} from 'redux'
import {appReducerActions} from "app/app-reducer";
import axios, {AxiosError} from "axios";

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
    if (data.messages.length) {
        dispatch(appReducerActions.setAppErrorAC({error:data.messages[0]}))
    } else {
        dispatch(appReducerActions.setAppErrorAC({error:'Some error occurred'}))
    }
    dispatch(appReducerActions.setAppStatusAC({status:'failed'}))
}

export const _handleServerNetworkError = (error: { message: string }, dispatch: Dispatch) => {
    dispatch(appReducerActions.setAppErrorAC(error.message ? {error:error.message} : {error:'Some error occurred'}))
    dispatch(appReducerActions.setAppStatusAC({status:'failed'}))
}
export const handleServerNetworkError = (e: unknown, dispatch: Dispatch) => {
    const err = e as Error | AxiosError<{ error: string }>
    if (axios.isAxiosError(err)) {
        const error = err.message ? err.message : 'Some error occurred'
        dispatch(appReducerActions.setAppErrorAC({error}))
    } else {
        dispatch(appReducerActions.setAppErrorAC({error: `Native error ${err.message}`}))
    }
    dispatch(appReducerActions.setAppStatusAC({status: 'failed'}))
}