# Depot

Introducing "Depot" - a powerful and flexible state management library for modern
applications.

With Depot, you can easily manage the state of your application, keeping track of
changes and updating the user interface accordingly. Our library offers a simple and intuitive
API, making it easy for developers of all levels to get started.

Whether you are building complex applications with hundreds of components or a
simple application, Depot can help you manage state in a organized and scalable way. The library
works seamlessly with popular frontend frameworks such as Roact, albeit with setup needed.

## Installation

You can install Depot via NPM with the following command:

```properties
npm install @rbxts/depot
```

## Usage

To use Depot in your project import the Depot class from the package:

```typescript
import { Depot } from "@rbxts/depot";
```

Once you have the `Depot` class, you can create a new instance of it with initial state
and mutator functions:

```typescript
interface AppState {
	counter: number;
}

interface AppMutators {
	increment: (state: AppState) => AppState;
	decrement: (state: AppState) => AppState;
}

const appDepot = new Depot<AppState, AppMutators>({
	initialState: {
		counter: 0,
	},
	mutator: {
		increment: (state) => ({ ...state, counter: state.counter + 1 }),
		decrement: (state) => ({ ...state, counter: state.counter - 1 }),
	},
});
```

You can then access the current state of your application by calling the `getState` method:

```typescript
const state = appDepot.getState(); // { counter: 0 }
```

You can update the state by calling the `dispatch` method with the name of the mutator and any additional payload:

```typescript
appDepot.dispatch("increment");
const newState = appDepot.getState(); // { counter: 1 }
```

You can also listen for changes to the state by registering a callback with the `listen` method:

```typescript
const unsubscribe = appDepot.listen((action, newState, oldState) => {
	print(action, newState, oldState);
});

appDepot.dispatch("increment"); // logs "increment", { counter: 1 }, { counter: 0 }

unsubscribe(); // Removes the listener
```

### Combine Multiple Depots Into One

First you need to declare interfaces for the Combined State and Mutator.
Let's say you have 2 depots, Money & Counter.

```typescript
export type CombinedMutators = MoneyMutator & CounterMutator;
export interface CombinedState {
	Money: MoneyState;
	Counter: CounterState;
}
```

Then proceed to create a merged depot using the `Combine` static method.

```typescript
import { Depot } from "@rbxts/depot";
import { CombinedMutators, CombinedState } from "...";

const mergedStore = Depot.Combine<CombinedState, CombinedMutators>({
	Money: MoneyDepot,
	Counter: CounterDepot,
});
```

Now, when you call the `getState` method, the state of the Money & Counter depots are there. Likewhise if you use the `dispatch` method, then it will autocomplete all the given mutator functions.

**NOTE: _Duplicate mutator function names will get merged, and thus wont call all of them. Make sure to avoid name duplication. This ties in into the core fundementals of structuring the states._**

## API

```typescript
new Depot<TState, TMutator>(Data: ConstructorData<TState, TMutator>): Depot
```

Creates a new instance of the Depot class with the given initial state and mutator functions.

```typescript
depot.getState(): Readonly<TState>
```

Returns the current state of the depot.

```typescript
depot.listen(callback: Listener<TState>): () => void
```

Registers a callback to be called whenever the state of the depot changes. Returns a function that can be called to unsubscribe the listener.

```typescript
depot.dispatch<TKey extends Extract<keyof TMutator, string>>(Type: TKey, ...Payload: Payload<TKey, TMutator>): void
```

Dispatches a mutator in order to mutate the state and thus update it.

```typescript
depot.flush(): void
```

Removes all registered listeners.

```typescript
static Combine<TState extends object, TMutator extends object>(Map: DepotMap<TState>): CombinedDepot
```

Combines multiple depots into a single depot that can be used to manage multiple pieces of state at once.
