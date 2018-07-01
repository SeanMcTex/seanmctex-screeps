var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var energyMover = require('role.energyMover');

module.exports.loop = function() {

	var tower = Game.getObjectById('5b3330e21e593734fadcad8e');
	if (tower) {
		var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (structure) => { return ( structure.hits < structure.hitsMax ) && ( structure.structureType != STRUCTURE_WALL ) }
		});
		if (closestDamagedStructure && ( tower.energy > tower.energyCapacity * 0.75 ) ) {
			tower.repair(closestDamagedStructure);
		}

		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (closestHostile) {
			tower.attack(closestHostile);
		}
	}

	for (var name in Memory.creeps) {

		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
		}

	}



	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
	var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
	var energyMovers = _.filter(Game.creeps, (creep) => creep.memory.role == 'energyMover');


	if (harvesters.length < 0) {
		var newName = 'Harvester' + Game.time;
		console.log('Spawning new harvester: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, {
			memory: {
				role: 'harvester'
			}
		});

	} else if (energyMovers.length < 4) {
		var newName = 'EnergyMover' + Game.time;
		console.log('Spawning new EnergyMover: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, CARRY, MOVE], newName, {
			memory: {
				role: 'energyMover'
			}
		});
	} else if (upgraders.length < 3) {
		var newName = 'Upgrader' + Game.time;
		console.log('Spawning new upgrader: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE], newName, {
			memory: {
				role: 'upgrader'
			}
		});

	} 


	for (var name in Game.creeps) {
		var creep = Game.creeps[name];
		if (creep.memory.role == 'harvester') {
			roleHarvester.run(creep);
		}
		if (creep.memory.role == 'upgrader') {
			roleUpgrader.run(creep);
		}
		if (creep.memory.role == 'energyMover') {
			energyMover.run(creep);
		}
	}
}
