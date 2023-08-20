import { todolistsAPI, TodolistType } from "../../api/todolists-api";
import { Dispatch } from "redux";
import { appActions, RequestStatusType } from "../../app/app-reducer";
import { handleServerNetworkError } from "../../utils/error-utils";
import { AppThunk } from "../../app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Array<TodolistDomainType> = [];

const slice = createSlice({
  name: "todolist",
  initialState,
  reducers: {
    removeTodolistAC: (state, action: PayloadAction<{ id: string }>) => {
      let index = state.findIndex(t => t.id === action.payload.id);
      state.splice(index, 1);
    },
    addTodolistAC: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
      state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" });
    },
    changeTodolistTitleAC: (state, action: PayloadAction<{ id: string, title: string }>) => {
      let index = state.findIndex(t => t.id === action.payload.id);
      state[index].title = action.payload.title;
    },
    changeTodolistFilterAC: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {

      let index = state.findIndex(t => t.id === action.payload.id);
      state[index].title = action.payload.filter;
    },
    changeTodolistEntityStatusAC: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
      let index = state.findIndex(t => t.id === action.payload.id);
      state[index].title = action.payload.status;
    },
    setTodolistsAC: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
      return action.payload.todolists.map((tl: TodolistType) => ({ ...tl, filter: "all", entityStatus: "idle" }));

    }
  }
});

export const todolistsReducer = slice.reducer;
export const todolistActions = slice.actions;

/* (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
  switch (action.type) {
    case "REMOVE-TODOLIST":
      return state.filter(tl => tl.id != action.id);
    case "ADD-TODOLIST":
      return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state];

    case "CHANGE-TODOLIST-TITLE":
      return state.map(tl => tl.id === action.id ? { ...tl, title: action.title } : tl);
    case "CHANGE-TODOLIST-FILTER":
      return state.map(tl => tl.id === action.id ? { ...tl, filter: action.filter } : tl);
    case "CHANGE-TODOLIST-ENTITY-STATUS":
      return state.map(tl => tl.id === action.id ? { ...tl, entityStatus: action.status } : tl);
    case "SET-TODOLISTS":
      return action.todolists.map(tl => ({ ...tl, filter: "all", entityStatus: "idle" }));
    default:
      return state;
  }
};*/

// actions
/*export const removeTodolistAC = (id: string) => ({ type: "REMOVE-TODOLIST", id } as const);
export const addTodolistAC = (todolist: TodolistType) => ({ type: "ADD-TODOLIST", todolist } as const);
export const changeTodolistTitleAC = (id: string, title: string) => ({
  type: "CHANGE-TODOLIST-TITLE",
  id,
  title
} as const);
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
  type: "CHANGE-TODOLIST-FILTER",
  id,
  filter
} as const);
export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) => ({
  type: "CHANGE-TODOLIST-ENTITY-STATUS", id, status
} as const);
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({ type: "SET-TODOLISTS", todolists } as const);*/

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.getTodolists()
      .then((res) => {
        dispatch(todolistActions.setTodolistsAC({ todolists: res.data }));
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      })
      .catch(error => {
        handleServerNetworkError(error, dispatch);
      });
  };
};
export const removeTodolistTC = (todolistId: string): AppThunk => {
  return (dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appActions.setAppStatus({ status: "loading" }));
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todolistActions.changeTodolistEntityStatusAC({ id: todolistId, status: "loading" }));
    todolistsAPI.deleteTodolist(todolistId)
      .then((res) => {
        dispatch(todolistActions.removeTodolistAC({ id: todolistId }));
        //скажем глобально приложению, что асинхронная операция завершена
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      });
  };
};
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.createTodolist(title)
      .then((res) => {
        dispatch(todolistActions.addTodolistAC({ todolist: res.data.data.item }));
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      });
  };
};
export const changeTodolistTitleTC = (id: string, title: string) => {
  return (dispatch: Dispatch) => {
    todolistsAPI.updateTodolist(id, title)
      .then((res) => {
        dispatch(todolistActions.changeTodolistTitleAC({ id, title }));
      });
  };
};

// types
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
/*export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
type ActionsType =
  | RemoveTodolistActionType
  | AddTodolistActionType
  | ReturnType<typeof changeTodolistTitleAC>
  | ReturnType<typeof changeTodolistFilterAC>
  | SetTodolistsActionType
  | ReturnType<typeof changeTodolistEntityStatusAC>
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}*/
/*
type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
*/
