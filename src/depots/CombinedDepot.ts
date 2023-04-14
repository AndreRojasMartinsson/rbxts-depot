import { ConstructorData, EmptyFunction, Listener, Payload, MutatorRecord, Mutator } from "../Types";

export const Immutable = <O extends object>(object: O): Readonly<O> => {
	if (table.isfrozen(object)) return table.clone(object) as Readonly<O>;

	return table.clone(table.freeze(object)) as unknown as Readonly<O>;
};

export class _combinedDepot<TState extends object, TMutator extends object> {
	// Class Types
	private listeners: Listener<TState>[];
	private state: TState;
	readonly initialState: Readonly<TState>;
	readonly mutator: TMutator;

	constructor(Data: ConstructorData<TState, TMutator>) {
		this.initialState = Immutable(Data.InitialState);
		this.state = Immutable(Data.InitialState);
		this.mutator = Immutable(Data.Mutator);
		this.listeners = [];
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

		const currentState = this.getState()[DepotName as never] as TState;
		const mutators = this.mutator[DepotName as never] as unknown as TMutator;
		const newState = Immutable((mutators[Type] as Mutator<TState>)(currentState, ...Payload)) as TState;

		this.state = {
			...currentState,
			[DepotName]: newState,
		};
		this.emit(Type, newState, currentState);
	}

	emit(Action: string, NewState: TState, OldState: TState): void {
		for (const listener of this.listeners) {
			listener(Action, NewState, OldState);
		}
	}
}
