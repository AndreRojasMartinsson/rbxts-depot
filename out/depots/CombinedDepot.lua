-- Compiled with roblox-ts v2.1.0
local TS = _G[script]
local Immutable = function(object)
	if table.isfrozen(object) then
		return table.clone(object)
	end
	return table.clone(table.freeze(object))
end
local _combinedDepot
do
	_combinedDepot = setmetatable({}, {
		__tostring = function()
			return "_combinedDepot"
		end,
	})
	_combinedDepot.__index = _combinedDepot
	function _combinedDepot.new(...)
		local self = setmetatable({}, _combinedDepot)
		return self:constructor(...) or self
	end
	function _combinedDepot:constructor(Data)
		self.initialState = Immutable(Data.InitialState)
		self.state = Immutable(Data.InitialState)
		self.mutator = Immutable(Data.Mutator)
		self.listeners = {}
		self.middleware = {}
	end
	function _combinedDepot:getState()
		return self.state
	end
	function _combinedDepot:listen(callback)
		local _listeners = self.listeners
		local _callback = callback
		table.insert(_listeners, _callback)
		return function()
			local _listeners_1 = self.listeners
			local _callback_1 = callback
			local index = (table.find(_listeners_1, _callback_1) or 0) - 1
			if index == -1 then
				return nil
			end
			-- ▼ Array.unorderedRemove ▼
			local _index = index + 1
			local _exp = self.listeners
			local _length = #_exp
			local _value = _exp[_index]
			if _value ~= nil then
				_exp[_index] = _exp[_length]
				_exp[_length] = nil
			end
			-- ▲ Array.unorderedRemove ▲
		end
	end
	function _combinedDepot:flush()
		table.clear(self.listeners)
	end
	function _combinedDepot:dispatch(Type, ...)
		local Payload = { ... }
		local DepotName = ""
		for depotName, mutators in pairs(self.mutator) do
			for mutatorName in pairs(mutators) do
				if mutatorName == Type then
					DepotName = depotName
					break
				end
			end
		end
		local currentState = self:getState()[DepotName]
		local mutators = self.mutator[DepotName]
		local newState = Immutable(mutators[Type](currentState, unpack(Payload)))
		self:_emitMiddlewares(Type, newState, currentState):andThen(function(result)
			if not result then
				return nil
			end
			local _object = {}
			if type(currentState) == "table" then
				for _k, _v in currentState do
					_object[_k] = _v
				end
			end
			_object[DepotName] = newState
			self.state = _object
			self:emit(Type, newState, currentState)
		end)
	end
	_combinedDepot._emitMiddlewares = TS.async(function(self, Action, NewState, OldState)
		local pass = true
		for _, middleware in self.middleware do
			local response = TS.await(middleware("__SETSTATE__", NewState, OldState))
			if not response then
				pass = false
				break
			end
		end
		return pass
	end)
	_combinedDepot._unstableSetState = TS.async(function(self, NewState)
		local oldState = self:getState()
		self:_emitMiddlewares("__SETSTATE__", NewState, oldState):andThen(function(result)
			if not result then
				return nil
			end
			self.state = Immutable(NewState)
			self:emit("__SETSTATE__", NewState, oldState)
		end)
	end)
	function _combinedDepot:addMiddleware(middleware)
		local _middleware = self.middleware
		local _middleware_1 = middleware
		table.insert(_middleware, _middleware_1)
	end
	function _combinedDepot:emit(Action, NewState, OldState)
		for _, listener in self.listeners do
			listener(Action, NewState, OldState)
		end
	end
end
return {
	Immutable = Immutable,
	_combinedDepot = _combinedDepot,
}
