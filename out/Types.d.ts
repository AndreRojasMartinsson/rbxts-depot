/// <reference types="@rbxts/compiler-types" />
import { _depot } from "./depots/Depot";
type PayloadParam<T extends unknown[]> = T extends [unknown, ...infer P] ? P : never;
export type Payload<TKey extends keyof TMutator, TMutator> = PayloadParam<Parameters<TMutator[TKey]>>;
export type Mutator<S> = (State: S, ...args: unknown[]) => S;
export type Listener<S> = (Action: string, NewState: S, OldState: S) => void;
export type EmptyFunction = () => void;
export type MutatorMap<T> = Record<string, Mutator<T>>;
export type DepotMap<S> = {
    [key in keyof S]: unknown;
};
export type UnknownObject = Record<string, unknown>;
export type DepotRecord = Record<string, _depot<{}, {}>>;
export type MutatorRecord = Record<string, Mutator<{}>>;
export interface ConstructorData<TState, TMutator> {
    Mutator: TMutator;
    InitialState: TState;
}
export {};
