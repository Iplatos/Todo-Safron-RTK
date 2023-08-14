import {appReducer, appReducerActions, InitialStateType} from "app/app-reducer";

let startState: InitialStateType;

beforeEach(() => {
	startState = {
		error: null,
		status: 'idle',
		isInitialized: false
	}
})

test('correct error message should be set', () => {
	const endState = appReducer(startState, appReducerActions.setAppErrorAC({error:'some error'}))
	expect(endState.error).toBe('some error');
})

test('correct status should be set', () => {
	const endState = appReducer(startState, appReducerActions.setAppStatusAC({status:'loading'}))
	expect(endState.status).toBe('loading');
})

