// State Management
var StatesEnum = Object.freeze({
	'idle': 'idle',
	'harvest': 'harvest',
	'deliver': 'deliver',
	'build': 'build',
	'repair': 'repair'
})

var setState = (creep, newState) => {
	creep.memory.state = newState;
}

var getState = (creep) => {
	if (!('state' in creep.memory)) {
		creep.memory.state = 'idle';
	}

	return creep.memory.state;
}

// Target Management
var setTarget = (creep, target) => {
	creep.memory.targetId = target.id;
}

var getTarget = (creep) => {
	return Game.getObjectById(creep.memory.targetId);
}

var clearTarget = (creep) => {
	delete creep.memory.targetId;
}

// Helpers
var getBestSource = (creep) => {
	return creep.room.find(FIND_SOURCES)[0];
}

var getStructuresNeedingEnergy = (creep) => {
	return creep.room.find(FIND_STRUCTURES, {
		filter: (structure) => {
			return (structure.structureType == STRUCTURE_EXTENSION ||
				structure.structureType == STRUCTURE_SPAWN ||
				structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
		}
	});
}

var getConstructionSites = (creep) => {
	return creep.room.find(FIND_CONSTRUCTION_SITES);
}

// State Logic
var idle = (creep) => {
	var structuresNeedingEnergy = getStructuresNeedingEnergy( creep );
	var constructionSites = getConstructionSites( creep );

	if (creep.carry.energy == 0) {
		setTarget(creep, getBestSource(creep));
		setState(creep, StatesEnum.harvest);
	} else if (structuresNeedingEnergy.length > 0) {
		setTarget(creep, structuresNeedingEnergy[0]);
		setState(creep, StatesEnum.deliver);
	} else if (constructionSites.length > 0) {
		setTarget(creep, constructionSites[0]);
		setState(creep, StatesEnum.build);
	}
}

var harvest = (creep) => {
	var capacityReached = creep.carry.energy >= creep.carryCapacity;
	if (capacityReached) {
		setState(creep, StatesEnum.idle);
		return;
	}

	var result = creep.harvest(getTarget(creep));

	switch (result) {
		case OK:
			break;
		case ERR_NOT_IN_RANGE:
			creep.moveTo(getTarget(creep), {
				visualizePathStyle: {
					stroke: '#ffaa00'
				}
			});
			break;
		default:
			setState(creep, StatesEnum.idle);
			break;

	}
}

var deliver = (creep) => {
	var energyStorageEmpty = creep.carry.energy == 0;
	var targetEnergyDeficit = getTarget( creep ).energyCapacity - getTarget( creep ).energy;
	if (energyStorageEmpty || ( targetEnergyDeficit == 0 ) ) {
		setState(creep, StatesEnum.idle);
		return;
	}
	
	

	var result = creep.transfer(getTarget(creep), RESOURCE_ENERGY);

	switch (result) {
		case OK:
			break;
		case ERR_NOT_IN_RANGE:
			creep.moveTo(getTarget(creep), {
				visualizePathStyle: {
					stroke: '#ffaa00'
				}
			});
			break;
		default:
			setState(creep, StatesEnum.idle);
			break;
	}
}

var build = (creep) => {
	var energyStorageEmpty = creep.carry.energy == 0;
	if (energyStorageEmpty) {
		setState(creep, StatesEnum.idle);
		return;
	}

	var result = creep.build( getTarget(creep) );

	switch (result) {
		case OK:
			break;
		case ERR_NOT_IN_RANGE:
			creep.moveTo(getTarget(creep), {
				visualizePathStyle: {
					stroke: '#ffaa00'
				}
			});
			break;
		default:
			setState(creep, StatesEnum.idle);
			break;
	}
}

// Main

var roleEnergyMover = {

	/** @param {Creep} creep **/
	run: function(creep) {
		// If we're idle, then pre-run the idle logic so we don't waste a whole tick sitting and thinking
		if ( getState( creep ) == StatesEnum.idle ) {
			idle( creep );
		}

		creep.say( getState(creep) );
		
		switch ( getState(creep) ) {
			case StatesEnum.harvest:
				harvest( creep );
				break;
			case StatesEnum.deliver:
				deliver( creep );
				break;
			case StatesEnum.build:
				build( creep );
				break;
			case StatesEnum.idle:
				// We already ran the idle logic; no need to do it twice.
				break;
			default:
				idle( creep );
				break;
		}
		
		if ( getState( creep ) == StatesEnum.idle ) {
			idle( creep );
		}
		
	}

};

module.exports = roleEnergyMover;
