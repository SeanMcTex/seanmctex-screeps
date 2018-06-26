var doneUpgrading = (creep) => {
	creep.memory.upgrading = false;
	creep.say('🔄 harvest');
}

var doneHarvesting = (creep) => {
	creep.memory.upgrading = true;
	creep.say('⚡ upgrade');
}

var doUpgrade = (creep) => {
	if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
		creep.moveTo(creep.room.controller, {
			visualizePathStyle: {
				stroke: '#ffffff'
			}
		});
	}
}

var harvestEnergy = (creep) => {
	var sources = creep.room.find(FIND_SOURCES);
	if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
		creep.moveTo(sources[0], {
			visualizePathStyle: {
				stroke: '#ffaa00'
			}
		});
	}
}


var roleUpgrader = {

	/** @param {Creep} creep **/
	run: function(creep) {

		if (creep.memory.upgrading && creep.carry.energy == 0) {
			doneUpgrading(creep);
		}
		if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
			doneHarvesting(creep);
		}

		if (creep.memory.upgrading) {
			doUpgrade(creep);
		} else {
			harvestEnergy(creep);
		}
	}
};

module.exports = roleUpgrader;
