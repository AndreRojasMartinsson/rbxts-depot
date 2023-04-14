-- Compiled with roblox-ts v2.1.0
local TS = _G[script]
local _combinedDepot = TS.import(script, script.Parent, "CombinedDepot")._combinedDepot
local Immutable = function(object)
	if table.isfrozen(object) then
		return table.clone(object)
	end
	return table.clone(table.freeze(object))
end
local _depot
do
	_depot = setmetatable({}, {
		__tostring = function()
			return "_depot"
		end,
	})
	_depot.__index = _depot
	function _depot.new(...)
		local self = setmetatable({}, _depot)
		return self:constructor(...) or self
	end
	function _depot:constructor(Data)
		self.initialState = Immutable(Data.InitialState)
		self.state = Immutable(Data.InitialState)
		self.mutator = Immutable(Data.Mutator)
		self.listeners = {}
	end
	function _depot:Combine(Map, Middleware)
		local initialState = {}
		local mutators = {}
		for childName, childDepot in pairs(Map) do
			initialState[childName] = Immutable(childDepot.initialState)
			mutators[childName] = Immutable(childDepot.mutator)
		end
		return _combinedDepot.new({
			Mutator = mutators,
			InitialState = initialState,
		}, Middleware)
	end
	function _depot:getState()
		return self.state
	end
	function _depot:listen(callback)
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
	function _depot:flush()
		table.clear(self.listeners)
	end
	function _depot:dispatch(Type, ...)
		local Payload = { ... }
		local currentState = self:getState()
		local newState = Immutable(self.mutator[Type](currentState, unpack(Payload)))
		self.state = newState
		self:emit(Type, newState, currentState)
	end
	function _depot:emit(Action, NewState, OldState)
		for _, listener in self.listeners do
			listener(Action, NewState, OldState)
		end
	end
end
return {
	Immutable = Immutable,
	_depot = _depot,
}
