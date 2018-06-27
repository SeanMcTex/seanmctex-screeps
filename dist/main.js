var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function() {

	var tower = Game.getObjectById('TOWER_ID');
	if (tower) {
		var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (structure) => structure.hits < structure.hitsMax
		});
		if (closestDamagedStructure) {
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


	if (harvesters.length < 3) {
		var newName = 'Harvester' + Game.time;
		console.log('Spawning new harvester: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
			{
				memory: {
					role: 'harvester'
				}
			});

	} else if (upgraders.length < 1) {
		var newName = 'Upgrader' + Game.time;
		console.log('Spawning new upgrader: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, CARRY, MOVE], newName,
			{
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
	}
}
