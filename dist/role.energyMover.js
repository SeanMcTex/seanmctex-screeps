// State Management
var StatesEnum = Object.freeze ({
	'idle': 'idle',
	'harvest': 'harvest',
	'deliver': 'deliver',
	'build': 'build',
	'repair': 'repair'
})

var setState = ( creep, newState) => {
	creep.memory.state = newState;
}

var getState = ( creep ) => {
	if ( !( 'state' in creep.memory ) ) {
		creep.memory.state = 'idle';
	}
	
	return creep.memory.state;
}

// Target Management
var setTarget = ( creep, target ) => {
	creep.memory.targetId = target.id;
}

var getTarget = ( creep ) => {
	return Game.getObjectById( creep.memory.targetId );
}

var clearTarget = ( creep ) => {
	delete creep.memory.targetId;
}

// Helpers
var getBestSource = ( creep ) => {
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

// State Logic
var idle = (creep) => {
	var structuresNeedingEnergy = getStructuresNeedingEnergy( creep );
	
	if ( creep.carry.energy == 0 ) {
		setTarget( creep, getBestSource( creep) );
		setState( creep, StatesEnum.harvest );
	} else if ( structuresNeedingEnergy.length > 0 ) {
		setTarget( creep, structuresNeedingEnergy[0] );
		setState( creep, StatesEnum.deliver );
	}
}

var harvest = (creep) => {
	var capacityReached = creep.carry.energy >= creep.carryCapacity;
	if ( capacityReached ) {
		setState( creep, StatesEnum.idle );
		return;
	}
	
	var result = creep.harvest( getTarget( creep ) );
	
	switch ( result ) {
	case ERR_NOT_IN_RANGE:
		creep.moveTo( getTarget( creep ), {
			visualizePathStyle: {
				stroke: '#ffaa00'
			}
		});
		break;	
	}
}

var deliver = (creep) => {
	var energyStorageEmpty = creep.carry.energy == 0;
	if ( energyStorageEmpty ) {
		setState( creep, StatesEnum.idle );
		return;
	}
	
	var result = creep.transfer( getTarget( creep ), RESOURCE_ENERGY );
	
	switch ( result ) {
	case ERR_NOT_IN_RANGE:
		creep.moveTo( getTarget( creep ), {
			visualizePathStyle: {
				stroke: '#ffaa00'
			}
		});
		break;	
	case ERR_FULL:
	case ERR_INVALID_TARGET:
		setState( creep, StatesEnum.idle );
		break;
	}
}

// Main

var roleEnergyMover = {

	/** @param {Creep} creep **/
	run: function(creep) {
		creep.say( getState( creep ) );
		
		switch ( getState( creep ) ) {
		case StatesEnum.harvest:
			harvest(creep);
			break;
		case StatesEnum.deliver:
			deliver(creep);
			break;
		case StatesEnum.idle:
		default:
			idle(creep);
			break;
		}
	}

};

module.exports = roleEnergyMover;
