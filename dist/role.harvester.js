var setBuildMode = (creep) => {
	creep.memory.building = true;
	creep.say('🚧 build');
}

var harvestFromSource = (creep) => {
	var sources = creep.room.find(FIND_SOURCES);
	if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
		creep.moveTo(sources[0], {
			visualizePathStyle: {
				stroke: '#ffaa00'
			}
		});
	}
}

var structuresNeedingEnergy = (creep) => {
	return creep.room.find(FIND_STRUCTURES, {
		filter: (structure) => {
			return (structure.structureType == STRUCTURE_EXTENSION ||
				structure.structureType == STRUCTURE_SPAWN ||
				structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
		}
	});
}

var giveEnergyTo = (creep, structure) => {
	if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
		creep.moveTo(structure, {
			visualizePathStyle: {
				stroke: '#ffffff'
			}
		});
	}
}

var buildAtSite = (creep, site) => {
	if (creep.build(site) == ERR_NOT_IN_RANGE) {
		creep.moveTo(site, {
			visualizePathStyle: {
				stroke: '#ffffff'
			}
		});
	}
}

var finishedBuilding = (creep) => {
	creep.memory.building = false;
	creep.say('🔄 harvest');
}

var roleHarvester = {

	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.carry.energy < creep.carryCapacity && !creep.memory.building) {
			harvestFromSource(creep);
		} else {
			var targets = structuresNeedingEnergy(creep);
			if (targets.length > 0) {
				giveEnergyTo(creep, targets[0]);
			} else {
				if (creep.memory.building && creep.carry.energy == 0) {
					finishedBuilding(creep);
				}
				if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
					setBuildMode(creep);
				}

				if (creep.memory.building) {
					var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
					if (targets.length) {
						buildAtSite(creep, targets[0]);
					}
				} else {
					harvestFromSource(creep);
				}
			}
		}
	}

};

module.exports = roleHarvester;
