import {addTodolistAC, removeTodolistAC, setTodolistsAC} from './todolists-reducer'
import {
    CreateTaskType, RemoveTask,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    TodolistType,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from 'app/store'
import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils'
import {appReducerActions} from "app/app-reducer";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "features/TodolistsList/Todolist/common/common.actions";
import {createAppAsyncThunk} from "utils/create-app-async-thunk";

const initialState: TasksStateType = {}


export const fetchTasksTC = createAppAsyncThunk<{tasks:TaskType[], todolistId:string},string>("fetch/Tasks", async (todolistId: string, {dispatch,rejectWithValue}) => {
    dispatch(appReducerActions.setAppStatusAC({status: 'loading'}))
   try{
       const res = await todolistsAPI.getTasks(todolistId)
       const tasks = res.data.items
       dispatch(setTasksAC({tasks, todolistId})) 
       dispatch(appReducerActions.setAppStatusAC({status: 'succeeded'}))
       return {tasks, todolistId}
   } catch (e:any)
   {handleServerNetworkError(e, dispatch)
       return rejectWithValue(null)
   }


})

export const addTaskTC = createAppAsyncThunk<{task:TaskType},CreateTaskType >("tasks/add", async (arg , thunkApi) => {
    try{
        const res = await  todolistsAPI.createTask(arg)
        if (res.data.resultCode === 0) {
            const task = res.data.data.item
            return {task}
        } else {
            handleServerAppError(res.data, thunkApi.dispatch)
            return thunkApi.rejectWithValue(null);
        }
    }
    catch(error){
        handleServerNetworkError(error, thunkApi.dispatch)
        return thunkApi.rejectWithValue(null);
    }
})
export const removeTaskTC = createAsyncThunk
("task/delete", async (param:{taskId: string, todolistId: string},thunkApi) => {
    try{
        const res = await  todolistsAPI.deleteTask(param)
        if (res.data.resultCode === 0) {
            return {taskId:param.taskId, todolistId:param.todolistId}
        } else {
            handleServerAppError(res.data, thunkApi.dispatch)
            return thunkApi.rejectWithValue(null);
        }
    }
    catch(error){
        handleServerNetworkError(error, thunkApi.dispatch)
        return thunkApi.rejectWithValue(null);
    }
})

export type UpdateTaskType ={
taskId: string
    domainModel: UpdateDomainTaskModelType
    todolistId: string
}

export const updateTaskTC = createAppAsyncThunk<any, UpdateTaskType>
("task/update", async (param, thunkAPI)=>{
const {dispatch, rejectWithValue, getState} = thunkAPI
    try{
        const state = getState()
        const task = state.tasks[param.todolistId].find(t => t.id === param.taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return rejectWithValue(null)
        }
            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...param.domainModel

            }
       const res = await todolistsAPI.updateTask(param.todolistId, param.taskId, apiModel)
                if (res.data.resultCode === 0) {
                 return  param

                } else {
                    handleServerAppError(res.data, dispatch);
                    rejectWithValue(null)
                }
        }
    catch(error){
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null);
    }
})

    /*(taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC({taskId, model: domainModel, todolistId})
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }*/


const slice = createSlice({
    name: "tasks/reducer",
    initialState,
    reducers: {
/*        removeTaskAC: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index) {
                tasks.splice(index, 1)
            }
        },*/

     /*   updateTaskAC: (state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            tasks[index] = {...tasks[index], ...action.payload.model}

        },*/
        setTasksAC: (state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) => {
            state[action.payload.todolistId] = action.payload.tasks
        },
    },
    extraReducers: builder => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = []
        })
            .addCase(removeTodolistAC, (state, action) => {
                delete state[action.payload.id]
            })
            .addCase(updateTaskTC.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(t => t.id === action.payload.taskId)
                tasks[index] = {...tasks[index], ...action.payload.domainModel}
            })
            .addCase(setTodolistsAC, (state, action) => {
                action.payload.todolists.forEach((tl: TodolistType) => {
                    state[tl.id] = []
                })
            })
            .addCase(clearTasksAndTodolists, () => {
                return {}
            })
            .addCase(fetchTasksTC.fulfilled, (state, action)=>{
                state[action.payload.todolistId] = action.payload.tasks
            })
            .addCase(addTaskTC.fulfilled, (state, action)=> {
                state[action.payload.task.todoListId].unshift(action.payload.task)
            })
            .addCase(removeTaskTC.fulfilled,(state,action)=> {
                const todo = state[action.payload.todolistId]
                const index = todo.findIndex(t => t.id === action.payload.taskId)
                todo.splice(index, 1)
            }
            )
    }
})
export const tasksReducer = slice.reducer
export const { setTasksAC} = slice.actions

/*export const tasksReducer = (state: TasksStateType = initialState, action: any): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id != action.taskId)}
        case 'ADD-TASK':
            return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
        case 'UPDATE-TASK':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            }

        case setTodolistsAC.type: {
            const copyState = {...state}
            action.payload.todolists.forEach((tl:any) => {
                copyState[tl.id] = []
            })
            return copyState
        }
        case 'SET-TASKS':
            return {...state, [action.todolistId]: action.tasks}
        default:
            return state
    }
}*/

// actions
/*
export const removeTaskAC = (taskId: string, todolistId: string) =>
    ({type: 'REMOVE-TASK', taskId, todolistId} as const)
export const addTaskAC = (task: TaskType) =>
    ({type: 'ADD-TASK', task} as const)
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
    ({type: 'SET-TASKS', tasks, todolistId} as const)
*/

// thunks
/*
export const _fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
    dispatch(appReducerActions.setAppStatusAC({status: 'loading'}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTasksAC({tasks, todolistId}))
            dispatch(appReducerActions.setAppStatusAC({status: 'succeeded'}))
        })
}
*/


/*export const _addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(appReducerActions.setAppStatusAC({status: 'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC({task})
                dispatch(action)
                dispatch(appReducerActions.setAppStatusAC({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}*/
/*export const _updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC({taskId, model: domainModel, todolistId})
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }*/

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
/*type ActionsType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsActionType
    | ReturnType<typeof setTasksAC>*/
/*
type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
*/
