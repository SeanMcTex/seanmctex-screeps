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

var structuresNeedingRepair = (creep) => {
	return creep.room.find(FIND_STRUCTURES, {
		filter: (structure) => {
			return  structure.hits < structure.hitsMax;
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

var goRepair = (creep, structure) => {
	if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
		creep.moveTo(structure, {
			visualizePathStyle: {
				stroke: '#ff0000'
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
		creep.say('RUN');
		if (creep.carry.energy < creep.carryCapacity && !creep.memory.building) {
			creep.say('HFS');
			harvestFromSource(creep);
		} else {
			var targets = structuresNeedingEnergy(creep);
			if (targets.length > 0 && creep.carry.energy > 0) {
				creep.say('GET');
				giveEnergyTo(creep, targets[0]);
			} else {
				var structures = structuresNeedingRepair(creep)
				if (structures.length > 0) {
					creep.say('GR');
					
					goRepair(creep,structures[0]);
				}
				if (creep.memory.building && creep.carry.energy == 0) {
					creep.say('FB');
					
					finishedBuilding(creep);
				}
				if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
					creep.say('SBM');
					setBuildMode(creep);
				}

				if (creep.memory.building) {
					var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
					if (targets.length) {
						creep.say('BAS');
						
						buildAtSite(creep, targets[0]);
					}
					
				} else {
					creep.say('HFS');
					
					harvestFromSource(creep);
				}
			}
		}
	}

};

module.exports = roleHarvester;
