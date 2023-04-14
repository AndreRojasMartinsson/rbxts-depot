import { _combinedDepot } from "./CombinedDepot";
import {
	ConstructorData,
	DepotMap,
	DepotRecord,
	EmptyFunction,
	Listener,
	UnknownObject,
	Payload,
	Mutator,
} from "../Types";

export const Immutable = <O extends object>(object: O): Readonly<O> => {
	if (table.isfrozen(object)) return table.clone(object) as Readonly<O>;

	return table.clone(table.freeze(object)) as unknown as Readonly<O>;
};

export class _depot<TState extends object, TMutator extends object> {
	// Class Types
	private listeners: Listener<TState>[];
	private state: TState;
	readonly initialState: Readonly<TState>;
	readonly mutator: TMutator;

	// Static methods
	static Combine<TState extends object, TMutator extends object>(
		Map: DepotMap<TState>,
	): _combinedDepot<TState, TMutator> {
		const initialState: UnknownObject = {};
		const mutators: UnknownObject = {};

		for (const [childName, childDepot] of pairs(Map as unknown as DepotRecord)) {
			initialState[childName] = Immutable(childDepot.initialState);
			mutators[childName] = Immutable(childDepot.mutator);
		}

		return new _combinedDepot<TState, TMutator>({
			Mutator: mutators as TMutator,
			InitialState: initialState as TState,
		});
	}

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
		const currentState = this.getState();
		const newState = Immutable((this.mutator[Type] as Mutator<TState>)(currentState, ...Payload));

		this.state = newState;
		this.emit(Type, newState, currentState);
	}

	emit(Action: string, NewState: TState, OldState: TState): void {
		for (const listener of this.listeners) {
			listener(Action, NewState, OldState);
		}
	}
}
