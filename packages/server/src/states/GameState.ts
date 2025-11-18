import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { Bullet, Game, Monster, Player, Prop } from '../entities';
import { Collisions, Constants, Entities, Geometry, Maps, Maths, Models, Tiled, Types } from '@tosios/common';
import { BotAI } from '../ai/BotAI';

export class GameState extends Schema {
    @type(Game)
    public game: Game;

    @type({ map: Player })
    public players: MapSchema<Player> = new MapSchema<Player>();

    @type({ map: Monster })
    public monsters: MapSchema<Monster> = new MapSchema<Monster>();

    @type([Prop])
    public props: ArraySchema<Prop> = new ArraySchema<Prop>();

    @type([Bullet])
    public bullets: ArraySchema<Bullet> = new ArraySchema<Bullet>();

    private map: Entities.Map;

    private walls: Collisions.TreeCollider;

    private spawners: Geometry.RectangleBody[] = [];

    private actions: Models.ActionJSON[] = [];

    private botAIs: Map<string, BotAI> = new Map(); // Bot AI controllers

    private botCounter: number = 0; // Counter for bot IDs

    // Monster system
    private monsterCounter: number = 0; // Counter for monster IDs

    // Monster wave system
    private waveNumber: number = 0;

    private lastWaveTime: number = 0;

    // Kill Feed system
    private killFeed: Models.KillFeedEntry[] = [];

    private killFeedCounter: number = 0;

    private onMessage: (message: Models.MessageJSON) => void;

    //
    // Init
    //
    constructor(
        roomName: string,
        mapName: string,
        maxPlayers: number,
        mode: Types.GameMode,
        onMessage: (message: Models.MessageJSON) => void,
    ) {
        super();

        // Game
        this.game = new Game({
            roomName,
            mapName,
            maxPlayers,
            mode,
            onWaitingStart: this.handleWaitingStart,
            onLobbyStart: this.handleLobbyStart,
            onGameStart: this.handleGameStart,
            onGameEnd: this.handleGameEnd,
        });

        // Map
        this.initializeMap(mapName);

        // Callback
        this.onMessage = onMessage;
    }

    //
    // Updates
    //
    update() {
        this.updateGame();
        this.updateBots(); // Update bot AI
        this.updatePlayers();
        this.updateMonsters();
        this.updateBullets();
    }

    private updateGame() {
        this.game.update(this.players);
    }

    private updatePlayers() {
        let action: Models.ActionJSON;

        while (this.actions.length > 0) {
            action = this.actions.shift();

            switch (action.type) {
                case 'move':
                    this.playerMove(action.playerId, action.ts, action.value);
                    break;
                case 'rotate':
                    this.playerRotate(action.playerId, action.ts, action.value.rotation);
                    break;
                case 'shoot':
                    this.playerShoot(action.playerId, action.ts, action.value.angle);
                    break;
                default:
                    break;
            }
        }

        // Update powerup timers for all players
        const currentTime = Date.now();
        this.players.forEach((player) => {
            player.updatePowerups(currentTime);
        });
    }

    private updateMonsters() {
        this.monsters.forEach((monster, monsterId) => {
            this.monsterUpdate(monsterId);
        });

        // Monster wave system
        if (Constants.MONSTER_WAVES_ENABLED && this.game.state === 'game') {
            this.updateMonsterWaves();
        }
    }

    private updateMonsterWaves() {
        const currentTime = Date.now();
        const monstersAlive = Array.from(this.monsters.values()).filter((m) => m.isAlive).length;

        // Spawn new wave if:
        // 1. Enough time has passed since last wave
        // 2. Not at maximum monsters
        if (
            currentTime - this.lastWaveTime > Constants.MONSTER_WAVE_INTERVAL &&
            monstersAlive < Constants.MONSTER_WAVE_MAX_MONSTERS
        ) {
            this.waveNumber++;
            const monstersToSpawn = Math.min(
                Constants.MONSTER_WAVE_INCREMENT,
                Constants.MONSTER_WAVE_MAX_MONSTERS - monstersAlive,
            );

            // Increase boss chance with each wave (caps at 30%)
            const bossChance = Math.min(0.05 + this.waveNumber * 0.02, 0.3);

            this.monstersAdd(monstersToSpawn, bossChance);
            this.lastWaveTime = currentTime;

            // Notify players of new wave
            this.onMessage({
                type: 'wave',
                from: 'server',
                ts: currentTime,
                params: {
                    wave: this.waveNumber,
                    count: monstersToSpawn,
                },
            });
        }
    }

    private updateBullets() {
        for (let i: number = 0; i < this.bullets.length; i++) {
            this.bulletUpdate(i);
        }
    }

    //
    // Game: State changes
    //
    private handleWaitingStart = () => {
        this.setPlayersActive(false);
        this.onMessage({
            type: 'waiting',
            from: 'server',
            ts: Date.now(),
            params: {},
        });
    };

    private handleLobbyStart = () => {
        this.setPlayersActive(false);
    };

    private handleGameStart = () => {
        // Auto-fill with bots if needed
        if (Constants.BOTS_ENABLED) {
            this.manageBotsAutoFill();
        }

        if (this.game.mode === 'team deathmatch') {
            this.setPlayersTeamsRandomly();
        }

        this.setPlayersPositionRandomly();
        this.setPlayersActive(true);

        // Reset match-specific stats (kills only)
        // Score, level, XP, deaths persist across matches
        this.players.forEach((player) => {
            player.resetMatchStats();
        });

        this.propsAdd(Constants.FLASKS_COUNT);
        this.powerupsAdd(Constants.POWERUPS_COUNT); // Add powerups!
        this.monstersAdd(Constants.MONSTERS_COUNT);

        // Reset monster wave system
        this.waveNumber = 0;
        this.lastWaveTime = Date.now();

        this.onMessage({
            type: 'start',
            from: 'server',
            ts: Date.now(),
            params: {},
        });
    };

    private handleGameEnd = (message?: Models.MessageJSON) => {
        if (message) {
            this.onMessage(message);
        }

        this.propsClear();
        this.monstersClear();
        this.onMessage({
            type: 'stop',
            from: 'server',
            ts: Date.now(),
            params: {},
        });
    };

    //
    // Map
    //
    initializeMap = (mapName: string) => {
        const data = Maps.List[mapName];
        const tiledMap = new Tiled.Map(data, Constants.TILE_SIZE);

        // Set the map boundaries
        this.map = new Entities.Map(tiledMap.widthInPixels, tiledMap.heightInPixels);

        // Create a R-Tree for walls
        this.walls = new Collisions.TreeCollider();
        tiledMap.collisions.forEach((tile) => {
            if (tile.tileId > 0) {
                this.walls.insert({
                    minX: tile.minX,
                    minY: tile.minY,
                    maxX: tile.maxX,
                    maxY: tile.maxY,
                    collider: tile.type,
                });
            }
        });

        // Create spawners
        tiledMap.spawners.forEach((tile) => {
            if (tile.tileId > 0) {
                this.spawners.push(new Geometry.RectangleBody(tile.minX, tile.minY, tile.maxX, tile.maxY));
            }
        });
    };

    //
    // Players: single
    //
    playerAdd(id: string, name: string) {
        const spawner = this.getSpawnerRandomly();
        const player = new Player(
            id,
            spawner.x + Constants.PLAYER_SIZE / 2,
            spawner.y + Constants.PLAYER_SIZE / 2,
            Constants.PLAYER_SIZE / 2,
            Constants.PLAYER_MAX_LIVES,
            Constants.PLAYER_MAX_LIVES,
            name || id,
        );

        // Add the user to the "red" team by default
        if (this.game.mode === 'team deathmatch') {
            player.setTeam('Red');
        }

        this.players.set(id, player);

        // Broadcast message to other players
        this.onMessage({
            type: 'joined',
            from: 'server',
            ts: Date.now(),
            params: {
                name: this.players.get(id).name,
            },
        });
    }

    playerPushAction(action: Models.ActionJSON) {
        this.actions.push(action);
    }

    private playerMove(id: string, ts: number, dir: Geometry.Vector2) {
        const player = this.players.get(id);
        if (!player || dir.empty) {
            return;
        }

        // Apply speed boost if active
        const speed = player.hasSpeedBoost
            ? Constants.PLAYER_SPEED * Constants.POWERUP_SPEED_BOOST_MULTIPLIER
            : Constants.PLAYER_SPEED;
        player.move(dir.x, dir.y, speed);

        // Collisions: Map
        const clampedPosition = this.map.clampCircle(player.body);
        player.setPosition(clampedPosition.x, clampedPosition.y);

        // Collisions: Walls
        const correctedPosition = this.walls.correctWithCircle(player.body);
        player.setPosition(correctedPosition.x, correctedPosition.y);

        // Acknoledge last treated action
        player.ack = ts;

        // Collisions: Props and Powerups
        if (!player.isAlive) {
            return;
        }

        let prop: Prop;
        const currentTime = Date.now();
        for (let i: number = 0; i < this.props.length; i++) {
            prop = this.props[i];
            if (!prop.active) {
                continue;
            }

            if (Collisions.circleToCircle(player.body, prop.body)) {
                switch (prop.type) {
                    case 'potion-red':
                        if (!player.isFullLives) {
                            prop.active = false;
                            player.heal();
                        }
                        break;
                    case 'speed-boost':
                    case 'shield':
                    case 'rapid-fire':
                    case 'invisibility':
                    case 'double-damage':
                        prop.active = false;
                        player.activatePowerup(prop.type, currentTime);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private playerRotate(id: string, ts: number, rotation: number) {
        const player = this.players.get(id);
        if (!player) {
            return;
        }

        player.setRotation(rotation);
    }

    private playerShoot(id: string, ts: number, angle: number) {
        const player = this.players.get(id);
        if (!player || !player.isAlive || this.game.state !== 'game') {
            return;
        }

        // Check if player can shoot (apply rapid fire multiplier if active)
        const fireRate = player.hasRapidFire
            ? Constants.BULLET_RATE * Constants.POWERUP_RAPID_FIRE_MULTIPLIER
            : Constants.BULLET_RATE;
        const delta = ts - player.lastShootAt;
        if (player.lastShootAt && delta < fireRate) {
            return;
        }
        player.lastShootAt = ts;
        player.recordShot(false); // Track shot fired (will update to true if hit)

        // Make the bullet start at the staff
        const bulletX = player.x + Math.cos(angle) * Constants.PLAYER_WEAPON_SIZE;
        const bulletY = player.y + Math.sin(angle) * Constants.PLAYER_WEAPON_SIZE;

        // Recycle bullets if some are unused to prevent instantiating too many
        const index = this.bullets.findIndex((bullet) => !bullet.active);
        if (index === -1) {
            this.bullets.push(
                new Bullet(id, player.team, bulletX, bulletY, Constants.BULLET_SIZE, angle, player.color, Date.now()),
            );
        } else {
            this.bullets[index].reset(
                id,
                player.team,
                bulletX,
                bulletY,
                Constants.BULLET_SIZE,
                angle,
                player.color,
                Date.now(),
            );
        }
    }

    private playerUpdateKills(playerId: string) {
        const player = this.players.get(playerId);
        if (!player) {
            return;
        }

        player.addKill(); // Now tracks kill streaks, score, and XP!
    }

    playerRemove(id: string) {
        this.onMessage({
            type: 'left',
            from: 'server',
            ts: Date.now(),
            params: {
                name: this.players.get(id).name,
            },
        });

        this.players.delete(id);
    }

    //
    // Players: multiple
    //
    private setPlayersActive(active: boolean) {
        this.players.forEach((player) => {
            player.setLives(active ? player.maxLives : 0);
        });
    }

    private setPlayersPositionRandomly() {
        let spawner: Geometry.RectangleBody;

        this.players.forEach((player) => {
            spawner = this.getSpawnerRandomly();
            player.setPosition(spawner.x + Constants.PLAYER_SIZE / 2, spawner.y + Constants.PLAYER_SIZE / 2);
            player.ack = 0;
        });
    }

    private getPositionRandomly(
        body: Geometry.CircleBody,
        snapToGrid: boolean,
        withCollisions: boolean,
    ): Geometry.CircleBody {
        body.x = Maths.getRandomInt(Constants.TILE_SIZE, this.map.width - Constants.TILE_SIZE);
        body.y = Maths.getRandomInt(Constants.TILE_SIZE, this.map.height - Constants.TILE_SIZE);

        // Should we compute collisions?
        if (withCollisions) {
            while (this.walls.collidesWithCircle(body)) {
                body.x = Maths.getRandomInt(Constants.TILE_SIZE, this.map.width - Constants.TILE_SIZE);
                body.y = Maths.getRandomInt(Constants.TILE_SIZE, this.map.height - Constants.TILE_SIZE);
            }
        }

        // We want the items to snap to the grid
        if (snapToGrid) {
            body.x += Maths.snapPosition(body.x, Constants.TILE_SIZE);
            body.y += Maths.snapPosition(body.y, Constants.TILE_SIZE);
        }

        return body;
    }

    private setPlayersTeamsRandomly() {
        const playersIds = Maths.shuffleArray(Array.from(this.players.keys()));

        const minimumPlayersPerTeam = Math.floor(playersIds.length / 2);
        const rest = playersIds.length % 2;

        for (let i = 0; i < playersIds.length; i++) {
            const playerId = playersIds[i];
            const player = this.players.get(playerId);
            const isBlueTeam = i < minimumPlayersPerTeam + rest;

            player.setTeam(isBlueTeam ? 'Blue' : 'Red');
        }
    }

    private getSpawnerRandomly(): Geometry.RectangleBody {
        return this.spawners[Maths.getRandomInt(0, this.spawners.length - 1)];
    }

    //
    // Monsters
    //
    private monstersAdd = (count: number, bossChance: number = 0.1) => {
        for (let i = 0; i < count; i++) {
            // Determine monster type (weighted random)
            let monsterType: Models.MonsterType;
            let size: number;
            let lives: number;

            const rand = Math.random();
            if (rand < bossChance) {
                // Boss - rare (10% by default)
                monsterType = 'boss';
                size = Constants.MONSTER_BOSS_SIZE;
                lives = Constants.MONSTER_BOSS_LIVES;
            } else if (rand < 0.3) {
                // Spider - 20% chance (fast, low health)
                monsterType = 'spider';
                size = Constants.MONSTER_SPIDER_SIZE;
                lives = Constants.MONSTER_SPIDER_LIVES;
            } else if (rand < 0.5) {
                // Golem - 20% chance (slow, high health)
                monsterType = 'golem';
                size = Constants.MONSTER_GOLEM_SIZE;
                lives = Constants.MONSTER_GOLEM_LIVES;
            } else if (rand < 0.65) {
                // Ghost - 15% chance (teleports)
                monsterType = 'ghost';
                size = Constants.MONSTER_GHOST_SIZE;
                lives = Constants.MONSTER_GHOST_LIVES;
            } else {
                // Bat - 35% chance (balanced)
                monsterType = 'bat';
                size = Constants.MONSTER_BAT_SIZE;
                lives = Constants.MONSTER_BAT_LIVES;
            }

            const body = this.getPositionRandomly(
                new Geometry.CircleBody(0, 0, size / 2),
                false,
                false,
            );
            const monster = new Monster(
                body.x,
                body.y,
                body.width / 2,
                this.map.width,
                this.map.height,
                lives,
                monsterType,
            );

            this.monsters.set(`monster_${this.monsterCounter++}`, monster);
        }
    };

    private monsterUpdate = (id: string) => {
        const monster = this.monsters.get(id);
        if (!monster || !monster.isAlive) {
            return;
        }

        // Update monster
        monster.update(this.players);

        // Collisions: Players
        this.players.forEach((player) => {
            // Check if the monster can hurt the player
            if (!player.isAlive || !monster.canAttack || !Collisions.circleToCircle(monster.body, player.body)) {
                return;
            }

            monster.attack();

            // Apply damage (supports different damage amounts per monster type)
            for (let dmg = 0; dmg < monster.attackDamage; dmg++) {
                if (player.isAlive) {
                    player.hurt();
                }
            }

            if (!player.isAlive) {
                // Get monster name for death message
                const monsterNames: Record<Models.MonsterType, string> = {
                    bat: 'a Bat',
                    spider: 'a Spider',
                    golem: 'a Golem',
                    ghost: 'a Ghost',
                    boss: 'the BOSS',
                };

                const monsterName = monsterNames[monster.monsterType] || 'a monster';

                this.onMessage({
                    type: 'killed',
                    from: 'server',
                    ts: Date.now(),
                    params: {
                        killerName: monsterName,
                        killedName: player.name,
                    },
                });

                // Add to kill feed
                this.addKillFeedEntry(monsterName, player.name, monster.monsterType);
            }
        });
    };

    private monsterRemove = (id: string) => {
        this.monsters.delete(id);
    };

    private monstersClear = () => {
        const monstersIds = Array.from(this.monsters.keys());
        monstersIds.forEach(this.monsterRemove);
    };

    //
    // Bullets
    //
    private bulletUpdate(bulletId: number) {
        const bullet = this.bullets[bulletId];
        if (!bullet || !bullet.active) {
            return;
        }

        bullet.move(Constants.BULLET_SPEED);

        // Collisions: Players
        this.players.forEach((player) => {
            // Check if the bullet can hurt the player
            if (
                !player.canBulletHurt(bullet.playerId, bullet.team) ||
                !Collisions.circleToCircle(bullet.body, player.body)
            ) {
                return;
            }

            bullet.active = false;

            // Track hit for accuracy
            const shooter = this.players.get(bullet.playerId);
            if (shooter) {
                shooter.shotsHit += 1;
                shooter.accuracy = shooter.shotsFired > 0 ? (shooter.shotsHit / shooter.shotsFired) * 100 : 0;
            }

            // Apply damage (2x if shooter has double damage powerup)
            if (shooter && shooter.hasDoubleDamage) {
                player.hurt();
                if (player.isAlive) {
                    player.hurt(); // Deal second damage
                }
            } else {
                player.hurt();
            }

            if (!player.isAlive) {
                const killer = this.players.get(bullet.playerId);
                this.onMessage({
                    type: 'killed',
                    from: 'server',
                    ts: Date.now(),
                    params: {
                        killerName: killer.name,
                        killedName: player.name,
                    },
                });
                this.playerUpdateKills(bullet.playerId);

                // Add to kill feed
                this.addKillFeedEntry(killer.name, player.name, 'pistol');
            }
        });

        // Collisions: Monsters
        this.monsters.forEach((monster, monsterId) => {
            // Check if the bullet can hurt the player
            if (!Collisions.circleToCircle(bullet.body, monster.body)) {
                return;
            }

            bullet.active = false;
            monster.hurt();

            if (!monster.isAlive) {
                // Award kill to player who killed the monster
                this.playerUpdateKills(bullet.playerId);

                // Monster loot drops
                if (Constants.MONSTER_LOOT_ENABLED) {
                    const dropChance =
                        monster.monsterType === 'boss'
                            ? Constants.MONSTER_BOSS_LOOT_DROP_CHANCE
                            : Constants.MONSTER_LOOT_DROP_CHANCE;

                    if (Math.random() < dropChance) {
                        // Drop a random powerup at monster's location
                        this.powerupAdd(monster.x, monster.y);
                    }
                }

                this.monsterRemove(monsterId);
            }
        });

        // Collisions: Walls
        if (this.walls.collidesWithCircle(bullet.body, 'half')) {
            bullet.active = false;
            return;
        }

        // Collisions: Map
        if (this.map.isCircleOutside(bullet.body)) {
            bullet.active = false;
        }
    }

    //
    // Props
    //
    private propsAdd(count: number) {
        for (let i = 0; i < count; i++) {
            const body = this.getPositionRandomly(new Geometry.CircleBody(0, 0, Constants.FLASK_SIZE / 2), false, true);
            const prop = new Prop('potion-red', body.x, body.y, body.radius);

            this.props.push(prop);
        }
    }

    private propsClear() {
        if (!this.props) {
            return;
        }

        while (this.props.length > 0) {
            this.props.pop();
        }
    }

    //
    // Powerups
    //
    private powerupsAdd(count: number) {
        const powerupTypes: Models.PropType[] = ['speed-boost', 'shield', 'rapid-fire', 'invisibility', 'double-damage'];

        for (let i = 0; i < count; i++) {
            const body = this.getPositionRandomly(
                new Geometry.CircleBody(0, 0, Constants.POWERUP_SIZE / 2),
                false,
                true
            );
            const randomType = powerupTypes[Maths.getRandomInt(0, powerupTypes.length - 1)];
            const powerup = new Prop(randomType, body.x, body.y, body.radius);

            this.props.push(powerup);
        }
    }

    private powerupAdd(x: number, y: number) {
        const powerupTypes: Models.PropType[] = ['speed-boost', 'shield', 'rapid-fire', 'invisibility', 'double-damage'];
        const randomType = powerupTypes[Maths.getRandomInt(0, powerupTypes.length - 1)];
        const powerup = new Prop(randomType, x, y, Constants.POWERUP_SIZE / 2);
        this.props.push(powerup);
    }

    //
    // Bots
    //
    private updateBots() {
        if (!Constants.BOTS_ENABLED || this.game.state !== 'game') {
            return;
        }

        const currentTime = Date.now();

        // Update each bot AI
        this.botAIs.forEach((botAI, botId) => {
            const bot = this.players.get(botId);
            if (!bot) {
                return;
            }

            const action = botAI.update(currentTime, this.players, this.monsters, Array.from(this.props), this.walls);

            if (action) {
                // Add bot action to action queue
                this.actions.push(action);

                // Debug logging
                if (Math.random() < 0.02) { // Log 2% of actions to see bot activity
                    console.log(`[Bot ${bot.name}] ${action.type} (Lives: ${bot.lives}, Score: ${bot.score})`);
                }
            }
        });

        // Check if we need to spawn or remove bots (auto-fill)
        this.manageBotsAutoFill();
    }

    private manageBotsAutoFill() {
        // Count real players (non-bots)
        let realPlayerCount = 0;
        let botCount = 0;

        this.players.forEach((player) => {
            if (this.botAIs.has(player.playerId)) {
                botCount++;
            } else {
                realPlayerCount++;
            }
        });

        const totalPlayers = realPlayerCount + botCount;

        // Add bots if below minimum
        if (totalPlayers < Constants.BOTS_MIN_PLAYERS && botCount < Constants.BOTS_MAX_COUNT) {
            const botsToAdd = Math.min(
                Constants.BOTS_MIN_PLAYERS - totalPlayers,
                Constants.BOTS_MAX_COUNT - botCount,
            );

            for (let i = 0; i < botsToAdd; i++) {
                this.botAdd();
            }
        }

        // Remove bots if we have real players joining
        if (realPlayerCount > 0 && totalPlayers > Constants.BOTS_MIN_PLAYERS && botCount > 0) {
            // Remove one bot to make room
            const botToRemove = Array.from(this.botAIs.keys())[0];
            if (botToRemove) {
                this.botRemove(botToRemove);
            }
        }
    }

    private botAdd() {
        const botId = `bot_${this.botCounter++}`;
        const botName = BotAI.getBotName(
            this.botCounter,
            Constants.BOTS_DIFFICULTY as 'easy' | 'medium' | 'hard',
        );

        // Get random spawn position - ensure it's not in a wall
        let spawner = this.getSpawnerRandomly();
        let x = spawner.x + Constants.PLAYER_SIZE / 2;
        let y = spawner.y + Constants.PLAYER_SIZE / 2;

        // Verify spawn position is valid (not in wall)
        let attempts = 0;
        const testBody = new Geometry.CircleBody(x, y, Constants.PLAYER_SIZE / 2);
        while (this.walls.collidesWithCircle(testBody) && attempts < 20) {
            spawner = this.getSpawnerRandomly();
            x = spawner.x + Constants.PLAYER_SIZE / 2;
            y = spawner.y + Constants.PLAYER_SIZE / 2;
            testBody.x = x;
            testBody.y = y;
            attempts++;
        }

        // Create bot player
        const bot = new Player(
            botId,
            x,
            y,
            Constants.PLAYER_SIZE / 2,
            Constants.PLAYER_MAX_LIVES,
            Constants.PLAYER_MAX_LIVES,
            botName,
            this.game.mode === 'team deathmatch' ? this.getRandomTeam() : undefined,
        );

        // Give bots unique visible colors (not white) if not in team mode
        if (!bot.team) {
            const botColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B500', '#7DCEA0'];
            bot.color = botColors[this.botCounter % botColors.length];
        }

        // Create bot AI controller
        const botAI = new BotAI(bot, Constants.BOTS_DIFFICULTY as 'easy' | 'medium' | 'hard');

        // Add to state
        this.players.set(botId, bot);
        this.botAIs.set(botId, botAI);

        console.log(`[Bot] Added bot: ${botName} (${Constants.BOTS_DIFFICULTY})`);

        this.onMessage({
            type: 'joined',
            from: 'server',
            ts: Date.now(),
            params: {
                name: botName,
            },
        });
    }

    private botRemove(botId: string) {
        const bot = this.players.get(botId);
        if (!bot) {
            return;
        }

        console.log(`[Bot] Removed bot: ${bot.name}`);

        this.botAIs.delete(botId);
        this.players.delete(botId);

        this.onMessage({
            type: 'left',
            from: 'server',
            ts: Date.now(),
            params: {
                name: bot.name,
            },
        });
    }

    private botsRemoveAll() {
        const botIds = Array.from(this.botAIs.keys());
        botIds.forEach((botId) => {
            this.botRemove(botId);
        });
    }

    private getRandomTeam(): Types.Teams {
        return Math.random() < 0.5 ? 'Blue' : 'Red';
    }

    //
    // Kill Feed
    //
    private addKillFeedEntry(killerName: string, killedName: string, weapon?: string) {
        const entry: Models.KillFeedEntry = {
            id: `kill_${this.killFeedCounter++}`,
            killerName,
            killedName,
            weapon,
            timestamp: Date.now(),
        };

        this.killFeed.unshift(entry);

        // Keep only last N entries
        if (this.killFeed.length > Constants.KILL_FEED_MAX_ENTRIES) {
            this.killFeed.pop();
        }

        // Broadcast kill feed update
        this.onMessage({
            type: 'killfeed',
            from: 'server',
            ts: Date.now(),
            params: { entry },
        });
    }
}
