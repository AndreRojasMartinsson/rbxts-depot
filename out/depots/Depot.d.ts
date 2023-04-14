/// <reference types="@rbxts/compiler-types" />
import { _combinedDepot } from "./CombinedDepot";
import { ConstructorData, DepotMap, EmptyFunction, Listener, Payload } from "../Types";
export declare const Immutable: <O extends object>(object: O) => Readonly<O>;
export declare class _depot<TState extends object, TMutator extends object> {
    private listeners;
    private state;
    readonly initialState: Readonly<TState>;
    readonly mutator: TMutator;
    static Combine<TState extends object, TMutator extends object>(Map: DepotMap<TState>): _combinedDepot<TState, TMutator>;
    constructor(Data: ConstructorData<TState, TMutator>);
    getState(): Readonly<TState>;
    listen(callback: Listener<TState>): EmptyFunction;
    flush(): void;
    dispatch<TKey extends Extract<keyof TMutator, string>>(Type: TKey, ...Payload: Payload<TKey, TMutator>): void;
    emit(Action: string, NewState: TState, OldState: TState): void;
}
