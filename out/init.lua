-- Compiled with roblox-ts v2.1.0
local TS = _G[script]
local _depot = TS.import(script, script, "depots", "Depot")._depot
local _combinedDepot = TS.import(script, script, "depots", "CombinedDepot")._combinedDepot
return {
	Depot = _depot,
	CombinedDepot = _combinedDepot,
}
