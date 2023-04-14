/// <reference types="@rbxts/compiler-types" />
/// <reference types="@rbxts/compiler-types" />
import { ConstructorData, EmptyFunction, Listener, Payload, Middleware } from "../Types";
export declare const Immutable: <O extends object>(object: O) => Readonly<O>;
export declare class _combinedDepot<TState extends object, TMutator extends object> {
    private listeners;
    private state;
    private middleware;
    readonly initialState: Readonly<TState>;
    readonly mutator: TMutator;
    constructor(Data: ConstructorData<TState, TMutator>);
    getState(): Readonly<TState>;
    listen(callback: Listener<TState>): EmptyFunction;
    flush(): void;
    dispatch<TKey extends Extract<keyof TMutator, string>>(Type: TKey, ...Payload: Payload<TKey, TMutator>): void;
    _emitMiddlewares(Action: string, NewState: TState, OldState: TState): Promise<boolean>;
    _unstableSetState(NewState: TState): Promise<void>;
    addMiddleware(middleware: Middleware<TState>): void;
    emit(Action: string, NewState: TState, OldState: TState): void;
}
