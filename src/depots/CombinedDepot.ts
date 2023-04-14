import { ConstructorData, EmptyFunction, Listener, Payload, MutatorRecord, Mutator, Middleware } from "../Types";

export const Immutable = <O extends object>(object: O): Readonly<O> => {
	if (table.isfrozen(object)) return table.clone(object) as Readonly<O>;

	return table.clone(table.freeze(object)) as unknown as Readonly<O>;
};

export class _combinedDepot<TState extends object, TMutator extends object> {
	// Class Types
	private listeners: Listener<TState>[];
	private state: TState;
	private middleware: Middleware<TState>[];
	readonly initialState: Readonly<TState>;
	readonly mutator: TMutator;

	constructor(Data: ConstructorData<TState, TMutator>, Middleware: Middleware<TState>[]) {
		this.initialState = Immutable(Data.InitialState);
		this.state = Immutable(Data.InitialState);
		this.mutator = Immutable(Data.Mutator);
		this.listeners = [];
		this.middleware = Middleware;

		this._emitMiddlewares("__INIT__", this.initialState, this.initialState);
	}

	getState(): Readonly<TState> {
		return this.state;
	}

	listen(callback: Listener<TState>): EmptyFunction {
		this.listeners.push(callback);

		return () => {
			const index = this.listeners.indexOf(callback);
			if (index === -1) return;

			this.listeners.unorderedRemove(index);
		};
	}

	flush() {
		this.listeners.clear();
	}

	dispatch<TKey extends Extract<keyof TMutator, string>>(Type: TKey, ...Payload: Payload<TKey, TMutator>): void {
		let DepotName = "";

		for (const [depotName, mutators] of pairs(this.mutator as unknown as MutatorRecord)) {
			for (const [mutatorName] of pairs(mutators as unknown as Record<TKey, unknown>)) {
				if (mutatorName === Type) {
					DepotName = depotName;
					break;
				}
			}
		}

		const oldState = this.getState();
		const currentState = this.getState()[DepotName as never] as TState;
		const mutators = this.mutator[DepotName as never] as unknown as TMutator;
		const newState = Immutable((mutators[Type] as Mutator<TState>)(currentState, ...Payload)) as TState;

		this._emitMiddlewares(Type, newState, oldState, ...Payload).andThen((result) => {
			if (!result) return;

			this.state = {
				...oldState,
				[DepotName]: newState,
			};
			this.emit(Type, newState, oldState);
		});
	}

	private async _emitMiddlewares(
		Action: string,
		NewState: TState,
		OldState: TState,
		...Payload: unknown[]
	): Promise<boolean> {
		let pass = true;
		for (const middleware of this.middleware) {
			const response = await middleware(Action, NewState, OldState, ...Payload);
			if (!response) {
				pass = false;
				break;
			}
		}

		return pass;
	}

	async _unstableSetState(NewState: TState) {
		const oldState = this.getState() as TState;

		this._emitMiddlewares("__SETSTATE__", NewState, oldState).andThen((result) => {
			if (!result) return;
			this.state = Immutable(NewState);
			this.emit("__SETSTATE__", NewState, oldState);
		});
	}

	addMiddleware(middleware: Middleware<TState>) {
		this.middleware.push(middleware);
	}

	private emit(Action: string, NewState: TState, OldState: TState): void {
		for (const listener of this.listeners) {
			listener(Action, NewState, OldState);
		}
	}
}
