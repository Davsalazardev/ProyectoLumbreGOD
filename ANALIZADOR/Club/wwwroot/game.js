


let connection = null;  
let myConnectionId = null;  
let players = {};  
let myPlayerName = "";  
let myPenguinType = "";  

console.log('🔵 game.js cargado - Inicializando variables globales');


let cameraX = 0;  
let cameraY = 0;  
const WORLD_WIDTH = 2400;  
const WORLD_HEIGHT = 1800;  


const HOME_WIDTH = 800;   
const HOME_HEIGHT = 600;  


let currentWorld = 'principal';  
let playerMenuOpen = false;  
let friendsPanelOpen = false;  
let friendsPanel = null;
let friendsList = [];
let pendingRequests = [];
let currentChatFriend = null;  
let privateChatMessages = [];  
let visitingHouse = null;  


const keysPressed = {};


let penguinImage = null;


let floatingMessages = {};  
const MESSAGE_DURATION = 5000;  


let showMap = false;
const mapCanvas = document.createElement('canvas');
const mapCtx = mapCanvas.getContext('2d');
mapCanvas.width = 300;
mapCanvas.height = 225;


let deviceType = 'desktop';


let chatInputFocused = false;  




let shopOpen = false;
let ownedCharacters = JSON.parse(localStorage.getItem('ownedCharacters')) || ['basico', 'chino'];  
let purchaseAnimationActive = false;


const SHOP_CHARACTERS = [
    { id: 'gato_naranja', name: 'Gato Naranja', price: 100, image: '/gato_naranja.png' },
    { id: 'gato_vampiro', name: 'Gato Vampiro', price: 250, image: '/gato_vampiro.png' },
    { id: 'gato_vaquero', name: 'Gato Vaquero', price: 300, image: '/gato_vaquero.png' },
    { id: 'gato_langosta', name: 'Gato Langosta', price: 500, image: '/gato_langosta.png' },
    { id: 'foca', name: 'Foca', price: 400, image: '/foca.png' },
    { id: 'conejo', name: 'Conejo', price: 350, image: '/conejo.png' }
];


let gunGameActive = false;
let gunGameOpponentId = null;
let gunGameOpponentName = null;
let myGunScore = 0;
let opponentGunScore = 0;


let gunGameZoneX = 1200;  
let gunGameZoneY = 900;   
let gunGameZoneSize = 80;  


let myCoins = parseInt(localStorage.getItem('userCoins')) || 0;  
let myUsername = localStorage.getItem('currentUser') || '';  


function updateCoinsDisplay() {
    const coinsElement = document.getElementById('coinsAmount');
    if (coinsElement) {
        coinsElement.textContent = myCoins;
    }
    
    localStorage.setItem('userCoins', myCoins);
}


async function saveCoinsToServer(amount) {
    if (!myUsername || !connection) return;
    
    try {
        await connection.invoke("UpdateCoins", myUsername, amount);
        console.log(`💾 Guardando ${amount} monedas en servidor para ${myUsername}`);
    } catch (error) {
        console.error("Error guardando monedas:", error);
    }
}


let inDuel = false;  
let arenaHasDuel = false;  
let duelArenaX = 1200;  
let duelArenaY = 900;   
let duelArenaSize = 500;  
let duelDetectionSize = 200;  
let duelOpponentId = null;  
let nearDuelArea = false;  
let duelAreaPanel = null;  
let duelWaiting = false;  
let duelCountdown = 0;  
let duelCountdownActive = false;  
let duelCanFire = false;  
let myReadyStatus = false;  
let opponentReadyStatus = false;  
let insideColiseo = false;  


let myHealth = 100;  
let opponentHealth = 100;  


let bullets = [];  


let pendingInviterId = null;  


let trees = [];  
let treeImageLarge = null;  
let treeImageSmall = null;  


let snowflakes = [];
let snowflakeImage = null;
const MAX_SNOWFLAKES = 30;


let pisoDeNieveImage = null;
const TILE_SIZE = 128;  


let coliseoImage = null;




const CTF_WIDTH = 1800;
const CTF_HEIGHT = 1000;
let inCTFWorld = false;
let ctfActive = false;
let ctfTeam = null;  
let ctfRedScore = 0;
let ctfBlueScore = 0;
let ctfMaxScore = 3;  
let ctfCarryingFlag = false;  
let ctfRedFlagTaken = false;  
let ctfBlueFlagTaken = false;  
let ctfRedFlagCarrier = null;  
let ctfBlueFlagCarrier = null;  
let ctfGameOver = false;
let ctfWinner = null;


let ctfInLobby = true;  
let ctfMyReady = false; 
let ctfReadyPlayers = []; 
let ctfSelectedTeam = null; 
let ctfRedPlayers = [];  
let ctfBluePlayers = [];  
const CTF_TEAM_SIZE = 3;  
let ctfRedDeaths = 0;  
let ctfBlueDeaths = 0;  
const CTF_MAX_DEATHS = 200;  
let ctfMyHealth = 2;  
let ctfBullets = [];  
let ctfCanShoot = true;  
let ctfShootCooldown = 500;  


const CTF_RED_BASE = { x: 150, y: 500 };
const CTF_BLUE_BASE = { x: 1650, y: 500 };
const CTF_FLAG_SIZE = 40;
const CTF_CAPTURE_RADIUS = 60;


const CTF_RED_SPAWNS = [
    { x: 150, y: 400 },
    { x: 150, y: 500 },
    { x: 150, y: 600 }
];
const CTF_BLUE_SPAWNS = [
    { x: 1650, y: 400 },
    { x: 1650, y: 500 },
    { x: 1650, y: 600 }
];


let castilloImage = null;


const CTF_ENTRANCE_X = 2000;
const CTF_ENTRANCE_Y = 1400;
const CTF_ENTRANCE_SIZE = 80;


let mouseX = 0;
let mouseY = 0;


let penguinImages = {};  


const loginContainer = document.getElementById('loginContainer');
const gameContainer = document.getElementById('gameContainer');
const playerNameInput = document.getElementById('playerNameInput');
const penguinTypeSelect = document.getElementById('penguinTypeSelect');
const joinButton = document.getElementById('joinButton');
const canvas = document.getElementById('canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const currentPlayerSpan = document.getElementById('currentPlayer');
const playerCountSpan = document.getElementById('playerCount');
const playersListContent = document.getElementById('playersListContent');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const deviceTypeSelect = document.getElementById('deviceTypeSelect');
const mobileControls = document.getElementById('mobileControls');
const gunGameContainer = document.getElementById('gunGameContainer');
const fireButton = document.getElementById('fireButton');
const exitGunButton = document.getElementById('exitGunButton');
const gunGameStatus = document.getElementById('gunGameStatus');
const opponentNameSpan = document.getElementById('opponentName');
const gunScoreSpan = document.getElementById('gunScore');
const gunOpponentScoreSpan = document.getElementById('gunOpponentScore');
const gameInvitationModal = document.getElementById('gameInvitationModal');
const invitePlayerModal = document.getElementById('invitePlayerModal');
const gameMainModal = document.getElementById('gameMainModal');
const inviterNameSpan = document.getElementById('inviterName');
const acceptInvitationBtn = document.getElementById('acceptInvitationBtn');
const rejectInvitationBtn = document.getElementById('rejectInvitationBtn');
const playerSelectForInvite = document.getElementById('playerSelectForInvite');
const sendInviteBtn = document.getElementById('sendInviteBtn');
const closeInviteModalBtn = document.getElementById('closeInviteModalBtn');
const startDuelBtn = document.getElementById('startDuelBtn');
const invitePlayerBtn = document.getElementById('invitePlayerBtn');
const closeGameModalBtn = document.getElementById('closeGameModalBtn');






function normalizePlayer(player) {
    if (!player) return player;
    
    
    player.connectionId = player.connectionId || player.ConnectionId || player.id || player.Id;
    
    
    player.x = (player.X !== undefined) ? player.X : (player.x || 0);
    player.y = (player.Y !== undefined) ? player.Y : (player.y || 0);
    
    
    player.name = player.name || player.Name || player.playerName || player.PlayerName || 'Jugador';
    
    
    player.penguinType = player.penguinType || player.PenguinType || player.penguin || player.Penguin || 'basico';
    
    
    player.color = player.color || player.Color || '#667eea';
    
    
    player.deviceType = player.deviceType || player.DeviceType || 'desktop';
    
    return player;
}


async function initializeSignalR() {
    
    const host = window.location.host;
    const protocol = window.location.protocol; 
    const baseUrl = `${protocol}//${host}`;
    
    console.log("Base URL:", baseUrl);
    console.log("Conectando a SignalR Hub...");
    
    
    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/gameHub`)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

    
    
    

    
        connection.on("SetConnectionId", (connectionId) => {
            myConnectionId = connectionId;
            console.log(`✅ SetConnectionId recibido: ${myConnectionId}`);
            console.log(`   Ahora puedo moverme y renderizar correctamente`);
            
            
            
            updateCoinsDisplay();
        });

        
        connection.on("CoinsUpdated", (newCoins) => {
            console.log(`💰 CoinsUpdated desde servidor: ${newCoins} monedas`);
            myCoins = newCoins;
            updateCoinsDisplay();
        });

        
    connection.on("InitializePlayers", (playersList) => {
        console.log(`📋 InitializePlayers: Recibiendo ${playersList.length} jugadores`);
        console.log(`   myConnectionId actual: ${myConnectionId}`);
        console.log(`   myPlayerName: ${myPlayerName}, myPenguinType: ${myPenguinType}`);
        
        players = {};
        playersList.forEach(p => {
            const normalized = normalizePlayer(p);
            const id = normalized.connectionId;
            if (!id) {
                console.warn('⚠️ Jugador sin connectionId:', p);
                return;
            }
            players[id] = normalized;
            console.log(`   ✅ Jugador agregado: ${normalized.name} (${id}) tipo=${normalized.penguinType} pos=(${normalized.x}, ${normalized.y})`);
        });
        
        
        
        
        if (!myConnectionId && myPlayerName) {
            console.log(`🔍 Buscando jugador por nombre/tipo (SetConnectionId no llegó aún)...`);
            for (const [id, p] of Object.entries(players)) {
                if (p.name === myPlayerName && p.penguinType === myPenguinType) {
                    myConnectionId = id;
                    console.log(`✅ Fallback detectado myConnectionId: ${myConnectionId}`);
                    updateCamera();
                    break;
                }
            }
        }

        console.log(`📋 InitializePlayers completo - Total jugadores: ${Object.keys(players).length}, myConnectionId: ${myConnectionId}`);
        updatePlayersList();
        render();
    });    
    connection.on("InitializeTrees", (treesList) => {
        console.log(`🌲 Recibiendo ${treesList.length} árboles del servidor`);
        trees = treesList.map(tree => ({
            x: tree.x,
            y: tree.y,
            size: tree.size,
            isLarge: tree.isLarge,
            collisionRadius: tree.size / 2
        }));
        console.log(`✅ ${trees.length} árboles cargados`);
    });

    
    connection.on("PlayerJoined", (player) => {
        const normalized = normalizePlayer(player);
        const id = normalized.connectionId;
        if (!id) {
            console.warn('PlayerJoined sin id:', player);
            return;
        }
        players[id] = normalized;
        console.log("👤 Jugador unido:", normalized.name, id, 'pos=', normalized.x, normalized.y);
        updatePlayersList();
        
        
        if (!myConnectionId && normalized.name === myPlayerName && normalized.penguinType === myPenguinType) {
            myConnectionId = id;
            console.log('Detectado myConnectionId desde PlayerJoined:', myConnectionId);
            updateCamera();
        }
        render();
    });

    
    connection.on("PlayerMoved", (connectionId, x, y) => {
        if (!players[connectionId]) {
            players[connectionId] = { connectionId, name: 'Jugador', color: '#45B7D1' };
        }
        players[connectionId].X = x;
        players[connectionId].Y = y;
        players[connectionId].x = x;
        players[connectionId].y = y;
        
        if (connectionId === myConnectionId) {
            updateCamera();
            
            
            
        }
        render();
    });

    
    connection.on("PlayerChangedWorld", (connectionId, worldName) => {
        if (players[connectionId]) {
            players[connectionId].world = worldName;
        }
        render();
    });

    
    connection.on("PlayerChangedPenguin", (connectionId, penguinType) => {
        if (players[connectionId]) {
            players[connectionId].penguinType = penguinType;
            players[connectionId].PenguinType = penguinType;
        }
        render();
    });

    
    
    
    
    connection.on("FriendRequestSent", (toUsername) => {
        showNotification(`Solicitud enviada a ${toUsername}`);
    });

    connection.on("FriendRequestReceived", (fromUsername) => {
        showNotification(`${fromUsername} quiere ser tu amigo`);
        pendingRequests.push(fromUsername);
        updateFriendsPanelData();
    });

    connection.on("FriendRequestAccepted", (friendUsername) => {
        showNotification(`Ahora eres amigo de ${friendUsername}`);
        connection.invoke("GetFriendsList").catch(err => console.error(err));
    });

    connection.on("FriendAcceptedYou", (friendUsername) => {
        showNotification(`${friendUsername} acepto tu solicitud`);
        connection.invoke("GetFriendsList").catch(err => console.error(err));
    });

    connection.on("FriendRequestRejected", (username) => {
        pendingRequests = pendingRequests.filter(u => u !== username);
        updateFriendsPanelData();
    });

    connection.on("FriendRemoved", (friendUsername) => {
        friendsList = friendsList.filter(f => f.username !== friendUsername);
        updateFriendsPanelData();
    });

    connection.on("FriendsListData", (friends, pending) => {
        friendsList = friends || [];
        pendingRequests = pending || [];
        updateFriendsPanelData();
    });

    connection.on("FriendError", (error) => {
        showNotification(error);
    });

    connection.on("PrivateMessageSent", (toUsername, message) => {
        if (currentChatFriend === toUsername) {
            privateChatMessages.push({ senderName: myPlayerName, message: message });
            updatePrivateChatUI();
        }
    });

    connection.on("PrivateMessageReceived", (fromUsername, message) => {
        showNotification(`Mensaje de ${fromUsername}`);
        if (currentChatFriend === fromUsername) {
            privateChatMessages.push({ senderName: fromUsername, message: message });
            updatePrivateChatUI();
        }
    });

    connection.on("PrivateMessagesData", (friendUsername, messages) => {
        if (currentChatFriend === friendUsername) {
            privateChatMessages = messages || [];
            updatePrivateChatUI();
        }
    });

    connection.on("PrivateMessageError", (error) => {
        showNotification(error);
    });

    connection.on("HouseInviteSent", (friendUsername) => {
        showNotification(`Invitacion enviada a ${friendUsername}`);
    });

    connection.on("HouseInviteReceived", (hostUsername) => {
        showHouseInviteModal(hostUsername);
    });

    connection.on("HouseInviteError", (error) => {
        showNotification(error);
    });

    connection.on("EnteredFriendHouse", (hostUsername, newX, newY) => {
        visitingHouse = hostUsername;
        currentWorld = `casa_${hostUsername}`;
        
        
        const posX = newX || HOME_WIDTH / 2;
        const posY = newY || HOME_HEIGHT / 2;
        
        if (players[myConnectionId]) {
            players[myConnectionId].x = posX;
            players[myConnectionId].X = posX;
            players[myConnectionId].y = posY;
            players[myConnectionId].Y = posY;
            players[myConnectionId].world = currentWorld;
        }
        
        
        cameraX = 0;
        cameraY = 0;
        
        showNotification(`Entraste a la casa de ${hostUsername}`);
        closeFriendsPanel();
        render();
    });

    connection.on("FriendEnteredYourHouse", (friendName) => {
        showNotification(`${friendName} entro a tu casa`);
    });

    connection.on("LeftFriendHouse", () => {
        visitingHouse = null;
        currentWorld = 'principal';
        if (players[myConnectionId]) {
            players[myConnectionId].x = 400;
            players[myConnectionId].y = 300;
            players[myConnectionId].world = 'principal';
        }
        showNotification("Saliste de la casa");
    });

    connection.on("FriendLeftYourHouse", (friendName) => {
        showNotification(`${friendName} salio de tu casa`);
    });

    connection.on("HouseInviteRejected", (friendName) => {
        showNotification(`${friendName} rechazo tu invitacion`);
    });

    
    
    
    
    
    connection.on("EnteredCTFLobby", (redNames, blueNames, readyNames) => {
        currentWorld = 'ctf';
        inCTFWorld = true;
        ctfTeam = null;
        ctfSelectedTeam = null;
        ctfActive = false;
        ctfInLobby = true;
        ctfMyReady = false;
        ctfCarryingFlag = false;
        ctfGameOver = false;
        ctfRedScore = 0;
        ctfBlueScore = 0;
        ctfRedDeaths = 0;
        ctfBlueDeaths = 0;
        ctfMyHealth = 2;
        ctfBullets = [];
        ctfRedPlayers = redNames || [];
        ctfBluePlayers = blueNames || [];
        ctfReadyPlayers = readyNames || [];
        
        if (players[myConnectionId]) {
            players[myConnectionId].world = 'ctf';
        }
        cameraX = 0;
        cameraY = 0;
        showNotification("⚔️ Bienvenido al lobby de CTF. ¡Elige un equipo!");
    });
    
    
    connection.on("EnteredCTFWorld", (team, redNames, blueNames) => {
        currentWorld = 'ctf';
        inCTFWorld = true;
        ctfTeam = team;
        ctfSelectedTeam = team;
        ctfActive = false;
        ctfInLobby = true;
        ctfMyReady = false;
        ctfCarryingFlag = false;
        ctfGameOver = false;
        ctfRedScore = 0;
        ctfBlueScore = 0;
        ctfRedDeaths = 0;
        ctfBlueDeaths = 0;
        ctfMyHealth = 2;
        ctfBullets = [];
        ctfRedPlayers = redNames || [];
        ctfBluePlayers = blueNames || [];
        ctfReadyPlayers = [];
        
        if (players[myConnectionId]) {
            players[myConnectionId].world = 'ctf';
        }
        cameraX = 0;
        cameraY = 0;
        showNotification(`⚔️ Entraste al equipo ${team === 'red' ? 'ROJO' : 'AZUL'}! Esperando jugadores...`);
    });
    
    
    connection.on("CTFTeamsUpdated", (redNames, blueNames, readyNames) => {
        ctfRedPlayers = redNames || [];
        ctfBluePlayers = blueNames || [];
        ctfReadyPlayers = readyNames || [];
    });
    
    connection.on("CTFTeamsFull", () => {
        showNotification("❌ Los equipos están llenos (3v3)");
    });
    
    connection.on("CTFPlayerJoined", (playerName, team, redNames, blueNames) => {
        ctfRedPlayers = redNames || [];
        ctfBluePlayers = blueNames || [];
        showNotification(`👤 ${playerName} se unió al equipo ${team === 'red' ? 'ROJO' : 'AZUL'}`);
    });

    connection.on("CTFGameStarted", (team) => {
        ctfActive = true;
        ctfInLobby = false;
        ctfTeam = team || ctfSelectedTeam;
        ctfRedFlagTaken = false;
        ctfBlueFlagTaken = false;
        ctfRedFlagCarrier = null;
        ctfBlueFlagCarrier = null;
        ctfMyHealth = 2;
        showNotification(`🚩 ¡El juego ha comenzado! Eres del equipo ${ctfTeam === 'red' ? 'ROJO' : 'AZUL'}!`);
    });

    connection.on("CTFScoreUpdate", (redScore, blueScore) => {
        ctfRedScore = redScore;
        ctfBlueScore = blueScore;
    });

    connection.on("CTFFlagTaken", (team, playerId, playerName) => {
        if (team === 'red') {
            ctfRedFlagTaken = true;
            ctfRedFlagCarrier = playerId;
        } else {
            ctfBlueFlagTaken = true;
            ctfBlueFlagCarrier = playerId;
        }
        if (playerId === myConnectionId) {
            ctfCarryingFlag = true;
            showNotification("🚩 ¡Tienes la bandera! Vuelve a tu base!");
        } else {
            showNotification(`🚩 ${playerName} tomó la bandera ${team === 'red' ? 'ROJA' : 'AZUL'}!`);
        }
    });

    connection.on("CTFFlagCaptured", (team, playerId, playerName) => {
        if (team === 'red') {
            ctfRedFlagTaken = false;
            ctfRedFlagCarrier = null;
        } else {
            ctfBlueFlagTaken = false;
            ctfBlueFlagCarrier = null;
        }
        if (playerId === myConnectionId) {
            ctfCarryingFlag = false;
            const coins = 25;
            myCoins += coins;
            updateCoinsDisplay();
            saveCoinsToServer(myCoins);
            showNotification(`🎉 ¡Capturaste la bandera! +${coins} monedas`);
        } else {
            showNotification(`🎉 ${playerName} capturó la bandera para el equipo ${team === 'red' ? 'AZUL' : 'ROJO'}!`);
        }
    });

    connection.on("CTFFlagDropped", (team, x, y) => {
        if (team === 'red') {
            ctfRedFlagCarrier = null;
        } else {
            ctfBlueFlagCarrier = null;
        }
        showNotification(`🚩 La bandera ${team === 'red' ? 'ROJA' : 'AZUL'} fue soltada!`);
    });

    connection.on("CTFFlagReturned", (team) => {
        if (team === 'red') {
            ctfRedFlagTaken = false;
            ctfRedFlagCarrier = null;
        } else {
            ctfBlueFlagTaken = false;
            ctfBlueFlagCarrier = null;
        }
        showNotification(`🚩 La bandera ${team === 'red' ? 'ROJA' : 'AZUL'} volvió a su base!`);
    });
    
    
    connection.on("CTFBulletFired", (shooterId, x, y, vx, vy, team) => {
        ctfBullets.push({
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            team: team,
            shooterId: shooterId,
            life: 100  
        });
    });
    
    connection.on("CTFPlayerKilled", (killerName, victimName, redDeaths, blueDeaths) => {
        ctfRedDeaths = redDeaths;
        ctfBlueDeaths = blueDeaths;
        showNotification(`☠️ ${killerName} eliminó a ${victimName}`);
    });
    
    connection.on("CTFYouDied", (newX, newY) => {
        ctfCarryingFlag = false;
        ctfMyHealth = 2;  
        if (players[myConnectionId]) {
            players[myConnectionId].x = newX;
            players[myConnectionId].y = newY;
        }
        showNotification("💀 ¡Moriste! Respawn en tu base.");
    });
    
    connection.on("CTFYouWereHit", (remainingHealth) => {
        ctfMyHealth = remainingHealth;
        showNotification(`💥 ¡Te dispararon! Vida: ${remainingHealth}/2`);
    });

    connection.on("CTFPlayerTagged", (taggerName, taggedName) => {
        showNotification(`⚔️ ${taggerName} atrapó a ${taggedName}!`);
    });

    connection.on("CTFYouWereTagged", () => {
        ctfCarryingFlag = false;
        ctfMyHealth = 2;
        
        if (ctfTeam === 'red') {
            if (players[myConnectionId]) {
                players[myConnectionId].x = CTF_RED_BASE.x + 50;
                players[myConnectionId].y = CTF_RED_BASE.y;
            }
        } else {
            if (players[myConnectionId]) {
                players[myConnectionId].x = CTF_BLUE_BASE.x - 50;
                players[myConnectionId].y = CTF_BLUE_BASE.y;
            }
        }
        showNotification("💀 ¡Te atraparon! Respawn en tu base.");
    });

    connection.on("CTFGameOver", (winnerTeam, reason) => {
        ctfGameOver = true;
        ctfActive = false;
        ctfWinner = winnerTeam;
        const won = winnerTeam === ctfTeam;
        if (won) {
            const coins = 40;
            myCoins += coins;
            updateCoinsDisplay();
            saveCoinsToServer(myCoins);
            showNotification(`🏆 ¡Tu equipo ganó! +${coins} monedas`);
        } else {
            showNotification(`😢 El equipo ${winnerTeam === 'red' ? 'ROJO' : 'AZUL'} ganó.`);
        }
    });

    connection.on("LeftCTFWorld", () => {
        currentWorld = 'principal';
        inCTFWorld = false;
        ctfActive = false;
        ctfInLobby = true;
        ctfTeam = null;
        ctfSelectedTeam = null;
        ctfMyReady = false;
        ctfCarryingFlag = false;
        ctfGameOver = false;
        ctfBullets = [];
        ctfRedPlayers = [];
        ctfBluePlayers = [];
        ctfReadyPlayers = [];
        if (players[myConnectionId]) {
            players[myConnectionId].x = CTF_ENTRANCE_X;
            players[myConnectionId].y = CTF_ENTRANCE_Y - 100;
            players[myConnectionId].world = 'principal';
        }
    });

    
    connection.on("MessageReceived", (senderName, message, connectionId) => {
        displayMessage(senderName, message);
        
        
        if (connectionId) {
            floatingMessages[connectionId] = {
                message: message,
                timestamp: Date.now(),
                duration: MESSAGE_DURATION
            };
        } else {
            
            Object.entries(players).forEach(([cId, player]) => {
                if (player.name === senderName) {
                    floatingMessages[cId] = {
                        message: message,
                        timestamp: Date.now(),
                        duration: MESSAGE_DURATION
                    };
                }
            });
        }
    });

    
    connection.on("PlayerLeft", (connectionId) => {
        console.log("Jugador desconectado:", connectionId);
        delete players[connectionId];
        updatePlayersList();
        render();
    });

    
    connection.on("StartGunGame", (gameData) => {
        gunGameActive = true;
        gunGameOpponentId = gameData.Player1Id === myConnectionId ? gameData.Player2Id : gameData.Player1Id;
        gunGameOpponentName = players[gunGameOpponentId]?.name || "Desconocido";
        myGunScore = 0;
        opponentGunScore = 0;
        gunScoreSpan.textContent = '0';
        gunOpponentScoreSpan.textContent = '0';
        opponentNameSpan.textContent = gunGameOpponentName;
        gunGameContainer.style.display = 'block';
        gunGameStatus.textContent = '¡Que comience el duelo!';
    });

    
    connection.on("ShotFired", (shooterId, targetId) => {
        if (!gunGameActive) return;
        
        
        const isHit = Math.random() < 0.5;
        
        if (isHit && targetId === myConnectionId) {
            opponentGunScore++;
            gunOpponentScoreSpan.textContent = opponentGunScore;
            gunGameStatus.textContent = 'Te han disparado';
            checkGunGameWinner();
        } else if (shooterId === myConnectionId && isHit) {
            myGunScore++;
            gunScoreSpan.textContent = myGunScore;
            gunGameStatus.textContent = 'Impacto';
            checkGunGameWinner();
        }
    });

    
    connection.on("ReceiveGameInvitation", (inviterName, inviterId) => {
        pendingInviterId = inviterId;
        inviterNameSpan.textContent = inviterName;
        gameInvitationModal.style.display = 'flex';
    });

    
    connection.on("GameInvitationRejected", (playerName) => {
        alert(`${playerName} rechazó tu invitación`);
    });

    
    connection.on("DuelWaitingForReady", (duelData) => {
        duelWaiting = true;
        inDuel = false;
        duelCountdownActive = false;
        duelCanFire = false;
        myReadyStatus = false;
        opponentReadyStatus = false;
        
        duelOpponentId = duelData.Player1Id === myConnectionId ? duelData.Player2Id : duelData.Player1Id;
        gunGameOpponentId = duelOpponentId;
        gunGameOpponentName = duelData.Player1Id === myConnectionId ? duelData.Player2Name : duelData.Player1Name;
        
        myGunScore = 0;
        opponentGunScore = 0;
        
        
        
        
        
        showDuelReadyOverlay();
        
        
        if (gameMainModal && gameMainModal.style) gameMainModal.style.display = 'none';
        if (invitePlayerModal && invitePlayerModal.style) invitePlayerModal.style.display = 'none';
        if (gameInvitationModal && gameInvitationModal.style) gameInvitationModal.style.display = 'none';
        if (duelAreaPanel && duelAreaPanel.style) {
            duelAreaPanel.style.display = 'none';
        }
    });

    
    connection.on("DuelPlayerReady", (playerId) => {
        if (playerId === myConnectionId) {
            myReadyStatus = true;
            updateDuelReadyOverlay('Esperando al oponente...');
        } else {
            opponentReadyStatus = true;
            updateDuelReadyOverlay('¡Tu oponente está listo!');
        }
        
        if (myReadyStatus && opponentReadyStatus) {
            updateDuelReadyOverlay('¡Ambos listos! Preparándose...');
        }
    });

    
    connection.on("DuelCountdownStart", (duelData) => {
        console.log('🎮 DuelCountdownStart recibido:', duelData);
        
        duelWaiting = false;
        inDuel = true;
        duelCountdownActive = true;
        duelCountdown = 4;
        duelCanFire = false;
        gunGameActive = true;
        
        
        const p1Id = duelData.Player1Id || duelData.player1Id;
        const p2Id = duelData.Player2Id || duelData.player2Id;
        const p1Name = duelData.Player1Name || duelData.player1Name;
        const p2Name = duelData.Player2Name || duelData.player2Name;
        
        console.log('📋 DuelData recibido:', { p1Id, p2Id, p1Name, p2Name, myConnectionId });
        
        if (p1Id === myConnectionId) {
            duelOpponentId = p2Id;
            gunGameOpponentId = p2Id;
            gunGameOpponentName = p2Name;
        } else {
            duelOpponentId = p1Id;
            gunGameOpponentId = p1Id;
            gunGameOpponentName = p1Name;
        }
        
        console.log('⚔️ Oponente del duelo:', duelOpponentId, gunGameOpponentName);
        
        
        myHealth = 100;
        opponentHealth = 100;
        
        
        hideDuelReadyOverlay();
        
        
        gunGameContainer.style.display = 'none';
        
        
        if (duelAreaPanel) {
            duelAreaPanel.style.display = 'none';
        }
        
        
        teleportToArena();
        
        
        startDuelCountdown();
    });

    
    connection.on("BulletFired", (bulletData) => {
        console.log('🔫 BulletFired evento recibido:', bulletData);
        
        
        const shooterId = bulletData.ShooterId || bulletData.shooterId;
        const targetId = bulletData.TargetId || bulletData.targetId;
        const startX = bulletData.StartX ?? bulletData.startX;
        const startY = bulletData.StartY ?? bulletData.startY;
        const targetX = bulletData.TargetX ?? bulletData.targetX;
        const targetY = bulletData.TargetY ?? bulletData.targetY;
        
        console.log('  - ShooterId:', shooterId);
        console.log('  - TargetId:', targetId);
        console.log('  - From:', startX, startY);
        console.log('  - To:', targetX, targetY);
        console.log('  - myConnectionId:', myConnectionId);
        
        
        const newBullet = {
            id: Date.now() + Math.random(),
            shooterId: shooterId,
            targetId: targetId,
            x: startX,
            y: startY,
            targetX: targetX,
            targetY: targetY,
            speed: 20,  
            radius: 10,
            created: Date.now(),
            damage: 20,  
            isMine: shooterId === myConnectionId  
        };
        
        bullets.push(newBullet);
        console.log(`✅ Bala agregada. Total balas: ${bullets.length}`, newBullet);
    });
    
    
    connection.on("PlayerHit", (playerId, damage, remainingHealth) => {
        console.log(`PlayerHit: ${playerId}, Damage: ${damage}, Remaining: ${remainingHealth}`);
        
        if (playerId === myConnectionId) {
            myHealth = remainingHealth;
            console.log(`Mi vida actualizada: ${myHealth}`);
        } else if (playerId === duelOpponentId) {
            opponentHealth = remainingHealth;
            console.log(`Vida del oponente actualizada: ${opponentHealth}`);
        }
    });

    
    connection.on("StartDuel", (duelData) => {
        console.log("Evento StartDuel recibido (obsoleto):", duelData);
    });

    
    connection.on("DuelStarted", (duelData) => {
        console.log("Duelo iniciado:", duelData);
        
        
        const p1Id = duelData.Player1Id || duelData.player1Id;
        const p2Id = duelData.Player2Id || duelData.player2Id;
        
        
        arenaHasDuel = true;
        
        
        if (p1Id !== myConnectionId && p2Id !== myConnectionId) {
            const myPlayer = players[myConnectionId];
            if (myPlayer) {
                const distFromArena = Math.sqrt(
                    Math.pow(myPlayer.X - duelArenaX, 2) + 
                    Math.pow(myPlayer.Y - duelArenaY, 2)
                );
                
                
                if (distFromArena < duelArenaSize + 50) {
                    console.log('⚠️ Hay un duelo en curso - saliendo de la arena');
                    
                    const newX = duelArenaX - duelArenaSize - 100;
                    const newY = duelArenaY;
                    if (connection) {
                        connection.invoke("Move", newX, newY).catch(console.error);
                    }
                    alert('¡Hay un duelo en curso! Has sido movido fuera de la arena.');
                }
            }
        }
        
        render();
    });

    
    connection.on("DuelEnded", (winnerConnectionId) => {
        console.log("🏆 Duelo terminado. Ganador:", winnerConnectionId);
        console.log("   Mi ID:", myConnectionId, "¿Gané?:", winnerConnectionId === myConnectionId);
        
        const isWinner = winnerConnectionId === myConnectionId;
        const wasInDuel = inDuel;
        
        
        if (duelOpponentId && duelOpponentId.startsWith('BOT_')) {
            console.log('🤖 Eliminando bot de jugadores locales:', duelOpponentId);
            delete players[duelOpponentId];
        }
        
        
        Object.keys(players).forEach(id => {
            if (id.startsWith('BOT_')) {
                console.log('🤖 Limpiando bot residual:', id);
                delete players[id];
            }
        });
        
        
        if (wasInDuel) {
            
            if (isWinner) {
                myCoins += 50;
                updateCoinsDisplay();
                saveCoinsToServer(50);  
                console.log(`🪙 +50 monedas! Total: ${myCoins}`);
            }
            showDuelResultOverlay(isWinner);
        }
        
        
        const cleanupDuel = () => {
            inDuel = false;
            duelWaiting = false;
            duelCountdownActive = false;
            duelCanFire = false;
            gunGameActive = false;
            if (gunGameContainer) {
                gunGameContainer.style.display = 'none';
            }
            duelOpponentId = null;
            gunGameOpponentId = null;
            gunGameOpponentName = '';
            myGunScore = 0;
            opponentGunScore = 0;
            bullets = [];
            myReadyStatus = false;
            opponentReadyStatus = false;
            myHealth = 100;
            opponentHealth = 100;
            arenaHasDuel = false;  
            hideDuelResultOverlay();
            
            
            if (insideColiseo) {
                exitColiseo();
            }
            
            render();
        };
        
        
        if (wasInDuel) {
            setTimeout(cleanupDuel, 3000);
        } else {
            cleanupDuel();
        }
    });

    
    connection.on("ShotResult", (isHit) => {
        if (isHit) {
            myGunScore++;
            gunScoreSpan.textContent = myGunScore;
            gunGameStatus.textContent = 'Has acertado';
            
            
            if (myGunScore >= 2) {
                gunGameStatus.textContent = 'Has ganado';
                fireButton.disabled = true;
            }
        } else {
            gunGameStatus.textContent = 'Fallaste...';
        }
        
        
        setTimeout(() => {
            gunGameStatus.textContent = `${myGunScore} vs ${opponentGunScore}`;
        }, 1500);
    });

    
    connection.on("GotShot", (isHit) => {
        if (isHit) {
            opponentGunScore++;
            gunOpponentScoreSpan.textContent = opponentGunScore;
            gunGameStatus.textContent = 'Te han acertado';
            
            
            if (opponentGunScore >= 2) {
                gunGameStatus.textContent = 'Has perdido';
                fireButton.disabled = true;
            }
        } else {
            gunGameStatus.textContent = 'Tu oponente falló...';
        }
        
        
        setTimeout(() => {
            gunGameStatus.textContent = `${myGunScore} vs ${opponentGunScore}`;
        }, 1500);
    });

    
    connection.on("AdminModeEnabled", (adminName) => {
        console.log("✅ Modo Admin activado:", adminName);
        const gameContainer = document.getElementById('gameContainer');
        const adminPanel = document.getElementById('adminPanel');
        if (gameContainer) gameContainer.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        requestAdminPanelData();
    });

    
    connection.on("AdminPanelData", (adminData) => {
        console.log("📊 Datos de Admin recibidos:", adminData);
        updateAdminPanel(adminData);
    });

    
    connection.on("AdminError", (errorMessage) => {
        console.warn("❌ Error Admin:", errorMessage);
        alert("Error de Admin: " + errorMessage);
    });

    
    connection.on("AdminNotification", (notification) => {
        console.log("📢 Notificación Admin:", notification);
        
    });

    
    connection.on("UserMuted", (durationMinutes) => {
        console.warn("🔇 Has sido muteado por", durationMinutes, "minutos");
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.disabled = true;
            messageInput.placeholder = `Muteado por ${durationMinutes} minutos`;
        }
        displayMessage("SISTEMA", `🔇 Fuiste muteado por ${durationMinutes} minutos`);
    });

    
    connection.on("UserUnmuted", () => {
        console.log("✅ Ya puedes hablar");
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = "Escribe un mensaje...";
        }
        displayMessage("SISTEMA", "✅ Ya puedes hablar");
    });

    
    connection.onreconnecting((error) => {
        console.log("Intentando reconectar...", error);
    });

    connection.onreconnected((connectionId) => {
        console.log("✅ Reconectado! Nueva conexión ID:", connectionId);
    });

    connection.onclose((error) => {
        console.log("Conexión cerrada", error);
    });

    
    try {
        await connection.start();
        console.log("✅ Conectado a SignalR en:", `${baseUrl}/gameHub`);
        return true;
    } catch (err) {
        console.error("Error al conectar:", err);
        return false;
    }
}






async function autoJoinGame() {
    console.log('🟢 autoJoinGame iniciando...');
    
    try {
        
        const currentUser = localStorage.getItem('currentUser');
        console.log('🟢 currentUser:', currentUser);
        
        if (!currentUser) {
            console.log('❌ No hay usuario en localStorage, redirigiendo a login.html');
            window.location.href = '/login.html';
            return;
        }
        
        
        const name = localStorage.getItem('playerName') || currentUser || 'Jugador';
        const penguinType = localStorage.getItem('penguinType') || 'basico';
        const device = localStorage.getItem('deviceType') || 'desktop';
        const isAdminMode = localStorage.getItem('isAdminMode') === 'true';
        const adminPassword = isAdminMode ? localStorage.getItem('adminPassword') : null;
        
        console.log('🟢 Datos leídos:', { name, penguinType, device, isAdminMode });
        
        myPlayerName = name;
        myPenguinType = penguinType;
        deviceType = device;
        
        console.log('🟢 Variables globales actualizadas:', { myPlayerName, myPenguinType, deviceType });
        
        
        console.log('🟢 Verificando elementos del DOM...');
        console.log('  - gameContainer:', !!gameContainer, gameContainer);
        console.log('  - currentPlayerSpan:', !!currentPlayerSpan, currentPlayerSpan);
        console.log('  - canvas:', !!canvas, canvas);
        
        
        console.log('🟢 Inicializando SignalR...');
        const connected = await initializeSignalR();
        console.log('🟢 initializeSignalR retornó:', connected);
        
        if (!connected) {
            console.error('❌ No se pudo conectar al servidor');
            alert("No se pudo conectar al servidor. Por favor, recarga la página.");
            return;
        }
        
        console.log('✅ SignalR conectado correctamente');
        
        
        console.log('🔍 Estado de conexión SignalR:', connection.state);
        console.log('🔍 connection.state === "Connected":', connection.state === signalR.HubConnectionState.Connected);
        
        if (connection.state !== signalR.HubConnectionState.Connected) {
            console.error('❌ La conexión SignalR no está en estado Connected, estado actual:', connection.state);
            alert("Error de conexión. Por favor, recarga la página.");
            return;
        }
        
        
        console.log('⏳ Esperando 500ms para asegurar estabilidad de conexión...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        
        try {
            
            console.log('🔍 DEBUG - isAdminMode:', isAdminMode, '(tipo:', typeof isAdminMode, ')');
            console.log('🔍 DEBUG - adminPassword:', adminPassword, '(tipo:', typeof adminPassword, ')');
            console.log('🔍 DEBUG - localStorage adminPassword:', localStorage.getItem('adminPassword'));
            
            if (isAdminMode && adminPassword) {
                console.log('🟢 Intentando login como administrador...');
                console.log('🟢 Llamando a JoinGame con admin password...');
                console.log(`🟢 Parámetros: name='${name}', penguinType='${penguinType}', device='${device}', adminPassword='${adminPassword.substring(0, 5)}...'`);
                console.log('🟢 Invocando connection.invoke("JoinGame", ...)...');
                await connection.invoke("JoinGame", name, penguinType, device, adminPassword);
                console.log('✅ JoinGame invocado exitosamente (admin)');
            } else {
                console.log(`🟢 Llamando a JoinGame sin admin: name='${name}', penguinType='${penguinType}', device='${device}'`);
                console.log('🟢 Tipo de datos: name=' + typeof name + ', penguinType=' + typeof penguinType + ', device=' + typeof device);
                console.log('🟢 Longitud: name=' + name.length + ', penguinType=' + penguinType.length + ', device=' + device.length);
                console.log('🟢 Invocando connection.invoke("JoinGame", ...)...');
                await connection.invoke("JoinGame", name, penguinType, device, "");
                console.log('✅ JoinGame invocado exitosamente');
            }
        } catch (joinErr) {
            console.error("❌ Error en JoinGame invoke:", joinErr);
            console.error("❌ Error details:", {
                message: joinErr.message,
                stack: joinErr.stack,
                toString: joinErr.toString()
            });
            throw joinErr;
        }
        
        
        console.log('🟢 Mostrando pantalla de juego...');
        if (gameContainer && gameContainer.style) {
            gameContainer.style.display = 'flex';
            console.log('🟢 gameContainer mostrado');
        } else {
            console.warn('⚠️ gameContainer no disponible:', gameContainer);
        }
        
        const infoDiv = document.getElementById('info');
        if (infoDiv) {
            infoDiv.style.display = 'flex';
            console.log('🟢 info div mostrado');
        } else {
            console.warn('⚠️ info div no encontrado');
        }
        
        if (currentPlayerSpan) {
            currentPlayerSpan.textContent = name + ' (' + penguinType + ')';
            console.log('🟢 currentPlayerSpan actualizado');
        } else {
            console.warn('⚠️ currentPlayerSpan no disponible');
        }
        
        
        console.log('🟢 Verificando tipo de dispositivo:', device);
        if (device === 'mobile') {
            console.log('🟢 Es mobile, mostrando controles móviles');
            if (mobileControls && mobileControls.style) {
                mobileControls.style.display = 'block';
                console.log('🟢 Controles móviles mostrados');
            } else {
                console.warn('⚠️ mobileControls no disponible:', mobileControls);
            }
            setupMobileControls();
        } else {
            console.log('🟢 Es desktop, controles móviles no necesarios');
        }
        
        
        console.log('🟢 Cargando imagen del pingüino...');
        loadPenguinImage();
        
        
        console.log('🟢 Cargando imágenes de árboles...');
        loadTreeImages();
        
        
        
        console.log('🟢 Llamando a render()...');
        render();
        
        console.log('✅ autoJoinGame completado exitosamente');
    } catch (err) {
        console.error("❌ Error general en autoJoinGame:", err);
        console.error("❌ Error stack:", err.stack);
        alert("Error al entrar a la sala: " + err.message);
    }
}




console.log('🟡 game.js: Configurando autoJoinGame...');

if (document.readyState === 'loading') {
    
    console.log('🟡 Documento aún cargando, esperando evento load...');
    window.addEventListener('load', () => {
        console.log('🟢 Evento load disparado');
        autoJoinGame();
    });
} else {
    
    console.log('🟢 Documento ya cargado, llamando autoJoinGame inmediatamente...');
    setTimeout(() => {
        autoJoinGame();
    }, 100);  
}


window.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
    
    
    if (chatInputFocused) {
        return;
    }
    
    
    if (e.key === 'Tab') {
        e.preventDefault(); 
        const playersList = document.getElementById('playersList');
        playersList.classList.toggle('visible');
        return;
    }
    
    
    if (e.key === 'm' || e.key === 'M') {
        showMap = !showMap;
        return;
    }
    
    
    if (e.key === 'e' || e.key === 'E') {
        togglePlayerMenu();
        return;
    }
    
    
    if (e.key === 'f' || e.key === 'F') {
        toggleFriendsPanel();
        return;
    }
    
    
    if (e.key === 't' || e.key === 'T') {
        toggleShop();
        return;
    }
    
    
    if (playerMenuOpen || friendsPanelOpen || shopOpen) {
        return;
    }
    
    
    const myPlayer = players[myConnectionId];
    if (!myPlayer || !connection) {
        console.warn(`⚠️ No se puede mover - myConnectionId: ${myConnectionId}, myPlayer: ${myPlayer ? 'OK' : 'NULL'}, connection: ${connection ? 'OK' : 'NULL'}`);
        return;
    }
    
    
    if (insideColiseo) {
        return;
    }

    let moved = false;
    let newX = myPlayer.X !== undefined ? myPlayer.X : (myPlayer.x || 0);
    let newY = myPlayer.Y !== undefined ? myPlayer.Y : (myPlayer.y || 0);
    const speed = 20;
    
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        newY -= speed;
        moved = true;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        newY += speed;
        moved = true;
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        newX -= speed;
        moved = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        newX += speed;
        moved = true;
    }
    
    
    let worldW, worldH;
    if (currentWorld === 'ctf') {
        worldW = CTF_WIDTH;
        worldH = CTF_HEIGHT;
    } else if (currentWorld === 'casa' || currentWorld.startsWith('casa_')) {
        worldW = HOME_WIDTH;
        worldH = HOME_HEIGHT;
    } else {
        worldW = WORLD_WIDTH;
        worldH = WORLD_HEIGHT;
    }
    newX = Math.max(0, Math.min(newX, worldW));
    newY = Math.max(0, Math.min(newY, worldH));
    
    
    if (currentWorld === 'principal' && checkTreeCollision(newX, newY)) {
        if (moved) {
            console.log(`🌲 Movimiento bloqueado por árbol en (${newX}, ${newY})`);
        }
        return; 
    }
    
    
    if (inDuel) {
        const dx = newX - duelArenaX;
        const dy = newY - duelArenaY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > duelArenaSize) {
            
            const angle = Math.atan2(dy, dx);
            newX = duelArenaX + Math.cos(angle) * duelArenaSize;
            newY = duelArenaY + Math.sin(angle) * duelArenaSize;
        }
    }
    
    if (moved) {
        console.log(`🎮 Enviando Move: (${Math.floor(newX)}, ${Math.floor(newY)})`);
        connection.invoke("Move", Math.floor(newX), Math.floor(newY))
            .then(() => console.log(`✅ Move invocado exitosamente`))
            .catch(err => console.error(`❌ Error al mover:`, err));
    }
});

window.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
});


if (sendMessageButton && messageInput) {
    sendMessageButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (message === "" || !connection) return;
        
        try {
            await connection.invoke("SendMessage", message);
            messageInput.value = '';
        } catch (err) {
            console.error("Error al enviar mensaje:", err);
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessageButton.click();
        }
    });

    
    messageInput.addEventListener('focus', () => {
        chatInputFocused = true;
    });

    messageInput.addEventListener('blur', () => {
        chatInputFocused = false;
    });
}


function setupCanvasClickListener() {
    if (!canvas) {
        console.error('❌ Canvas no encontrado para registrar click listener');
        return;
    }
    
    console.log('✅ Canvas click listener registrado');
    canvas.addEventListener('click', async (e) => {
        console.log('🖱️ Canvas click detectado');
        console.log('   inDuel:', inDuel, 'duelCanFire:', duelCanFire);
        
        
        if (!inDuel || !duelCanFire) {
            console.log('   -> Procesando como click normal (no en duelo o no puede disparar)');
            
            handleNormalCanvasClick(e);
            return;
        }
        
        console.log('   -> ¡DISPARANDO!');
        
        
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
    
        
        const worldClickX = clickX + cameraX;
        const worldClickY = clickY + cameraY;
        
        console.log(`🎯 Click en pantalla: (${clickX}, ${clickY})`);
        console.log(`🎯 Camera: (${cameraX}, ${cameraY})`);
        console.log(`🎯 Click en mundo: (${worldClickX}, ${worldClickY})`);
        console.log(`🎯 Bot está en: (1400, 800)`);
        
        
        fireAtPosition(worldClickX, worldClickY);
    });
    
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCanvasClickListener);
} else {
    setupCanvasClickListener();
}


async function fireAtPosition(targetX, targetY) {
    console.log('🔫 fireAtPosition llamada');
    console.log('   connection:', !!connection, 'inDuel:', inDuel, 'duelCanFire:', duelCanFire);
    console.log('   duelOpponentId:', duelOpponentId);
    
    if (!connection) {
        console.error('❌ No hay conexión');
        return;
    }
    if (!inDuel) {
        console.error('❌ No está en duelo');
        return;
    }
    if (!duelCanFire) {
        console.error('❌ No puede disparar aún');
        return;
    }
    
    const myPlayer = players[myConnectionId];
    if (!myPlayer) {
        console.error('❌ No se encontró mi jugador');
        return;
    }
    
    console.log(`🎯 Disparando hacia: (${targetX}, ${targetY}) - Mi posición: (${myPlayer.X}, ${myPlayer.Y})`);
    
    
    try {
        console.log('📤 Invocando FireInDuel...');
        await connection.invoke("FireInDuel", duelOpponentId, targetX, targetY);
        console.log('✅ FireInDuel invocado exitosamente');
    } catch (err) {
        console.error("❌ Error al disparar:", err);
    }
}


function handleNormalCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    
    if (inCTFWorld && ctfInLobby) {
        const worldX = x + cameraX;
        const worldY = y + cameraY;
        
        
        if (window.ctfReadyBtn && ctfSelectedTeam) {
            const btn = window.ctfReadyBtn;
            if (worldX >= btn.x && worldX <= btn.x + btn.w &&
                worldY >= btn.y && worldY <= btn.y + btn.h) {
                ctfMyReady = !ctfMyReady;
                if (connection) {
                    connection.invoke("CTFToggleReady", ctfMyReady).catch(err => console.error(err));
                }
                return;
            }
        }
        
        
        if (window.ctfExitBtn) {
            const btn = window.ctfExitBtn;
            if (worldX >= btn.x && worldX <= btn.x + btn.w &&
                worldY >= btn.y && worldY <= btn.y + btn.h) {
                leaveCTFWorld();
                return;
            }
        }
        return;
    }
    
    
    if (inCTFWorld && ctfActive && !ctfInLobby) {
        ctfShoot(x, y);
        return;
    }
    
    
    const worldX = x + cameraX;
    const worldY = y + cameraY;
    
    
    const distance = Math.sqrt(
        Math.pow(worldX - duelArenaX, 2) + 
        Math.pow(worldY - duelArenaY, 2)
    );
    
    if (distance <= duelDetectionSize) {
        
        if (!inDuel && gameMainModal && gameMainModal.style) {
            
            gameMainModal.style.display = 'flex';
        }
    }
}


if (exitGunButton && gunGameContainer) {
    exitGunButton.addEventListener('click', async () => {
        if (inDuel) {
            
            await connection.invoke("EndDuel");
        }
        
        inDuel = false;
        duelWaiting = false;
        duelCountdownActive = false;
        duelCanFire = false;
        gunGameActive = false;
        gunGameContainer.style.display = 'none';
        duelOpponentId = null;
        gunGameOpponentId = null;
        myGunScore = 0;
        opponentGunScore = 0;
        bullets = [];
        myReadyStatus = false;
        opponentReadyStatus = false;
        hideDuelReadyOverlay();
        hideDuelResultOverlay();
        render();
    });
}


window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        
        if (inDuel && exitGunButton) {
            exitGunButton.click();
        }
        
        if (inCTFWorld && ctfInLobby) {
            leaveCTFWorld();
        }
    }
});


if (acceptInvitationBtn && gameInvitationModal) {
    acceptInvitationBtn.addEventListener('click', async () => {
        if (!pendingInviterId || !connection) return;
        
        try {
            await connection.invoke("AcceptGameInvitation", pendingInviterId);
            gameInvitationModal.style.display = 'none';
        } catch (err) {
            console.error("Error al aceptar invitación:", err);
        }
    });
}


if (rejectInvitationBtn && gameInvitationModal) {
    rejectInvitationBtn.addEventListener('click', async () => {
        if (!pendingInviterId || !connection) return;
        
        try {
            await connection.invoke("RejectGameInvitation", pendingInviterId);
            gameInvitationModal.style.display = 'none';
        } catch (err) {
            console.error("Error al rechazar invitación:", err);
        }
    });
}


if (sendInviteBtn && playerSelectForInvite) {
    sendInviteBtn.addEventListener('click', async () => {
        const selectedPlayer = playerSelectForInvite.value;
        
        if (!selectedPlayer || !connection) {
            alert('Por favor selecciona un jugador');
            return;
        }
        
        try {
            await connection.invoke("InviteToGunGame", selectedPlayer);
            alert(`✅ Invitación enviada a ${selectedPlayer}`);
            invitePlayerModal.style.display = 'none';
            playerSelectForInvite.value = '';
        } catch (err) {
            console.error("Error al enviar invitación:", err);
            alert('Error al enviar invitación');
        }
    });
}


if (closeInviteModalBtn && invitePlayerModal) {
    closeInviteModalBtn.addEventListener('click', () => {
        invitePlayerModal.style.display = 'none';
        playerSelectForInvite.value = '';
    });
}


if (startDuelBtn && gameMainModal) {
    startDuelBtn.addEventListener('click', async () => {
        if (!connection) return;
        
        gameMainModal.style.display = 'none';
        
        
        prepareForDuel();
        
        try {
            await connection.invoke("StartDuelGame");
        } catch (err) {
            console.error("Error al iniciar duelo:", err);
            alert('Error al iniciar duelo');
        }
    });
}


if (invitePlayerBtn && gameMainModal && invitePlayerModal) {
    invitePlayerBtn.addEventListener('click', () => {
        gameMainModal.style.display = 'none';
        
        updatePlayerSelect();
        invitePlayerModal.style.display = 'flex';
    });
}


if (closeGameModalBtn && gameMainModal) {
    closeGameModalBtn.addEventListener('click', () => {
        gameMainModal.style.display = 'none';
    });
}


function setupMobileControls() {
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    const movePlayer = (dx, dy) => {
        const myPlayer = players[myConnectionId];
        if (!myPlayer || !connection) return;
        
        
        if (insideColiseo) return;
        
        let newX = myPlayer.X || 0;
        let newY = myPlayer.Y || 0;
        const speed = 20;
        
        newX += dx * speed;
        newY += dy * speed;
        
        newX = Math.max(0, Math.min(newX, WORLD_WIDTH));
        newY = Math.max(0, Math.min(newY, WORLD_HEIGHT));
        
        
        if (inDuel) {
            const distance = Math.sqrt(
                Math.pow(newX - duelArenaX, 2) + 
                Math.pow(newY - duelArenaY, 2)
            );
            
            if (distance > duelArenaSize) {
                
                return;
            }
        }
        
        connection.invoke("Move", Math.floor(newX), Math.floor(newY)).catch(err => console.error("Error al mover:", err));
    };
    
    upBtn.addEventListener('click', () => movePlayer(0, -1));
    downBtn.addEventListener('click', () => movePlayer(0, 1));
    leftBtn.addEventListener('click', () => movePlayer(-1, 0));
    rightBtn.addEventListener('click', () => movePlayer(1, 0));
}






function showDuelReadyOverlay() {
    
    let overlay = document.getElementById('duelReadyOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'duelReadyOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        
        overlay.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 60px; border-radius: 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <h1 style="color: white; font-size: 48px; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 3px;">DUELO</h1>
                <p id="duelReadyText" style="color: white; font-size: 24px; margin: 20px 0;">Preparándose...</p>
                <button id="duelReadyBtn" style="
                    padding: 20px 50px;
                    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                    color: #333;
                    border: none;
                    border-radius: 12px;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 30px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.5);
                    transition: all 0.3s;
                ">ACEPTAR</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        
        document.getElementById('duelReadyBtn').addEventListener('click', async () => {
            if (!myReadyStatus && connection) {
                try {
                    await connection.invoke("ReadyForDuel");
                    document.getElementById('duelReadyBtn').disabled = true;
                    document.getElementById('duelReadyBtn').style.opacity = '0.5';
                    document.getElementById('duelReadyBtn').textContent = 'LISTO';
                } catch (err) {
                    console.error("Error al marcar listo:", err);
                }
            }
        });
    }
    
    overlay.style.display = 'flex';
}


function updateDuelReadyOverlay(text) {
    const textElement = document.getElementById('duelReadyText');
    if (textElement) {
        textElement.textContent = text;
    }
}


function hideDuelReadyOverlay() {
    const overlay = document.getElementById('duelReadyOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}


function showDuelResultOverlay(isWinner) {
    let overlay = document.getElementById('duelResultOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'duelResultOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(overlay);
    }
    
    const bgColor = isWinner ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'linear-gradient(135deg, #666 0%, #333 100%)';
    const textColor = isWinner ? '#333' : 'white';
    const title = isWinner ? 'VICTORIA' : 'DERROTADO';
    const coinsText = isWinner ? `<p style="color: ${textColor}; font-size: 28px; margin: 20px 0 0 0;">+50 monedas</p><p style="color: ${textColor}; font-size: 18px; margin: 10px 0 0 0;">Total: ${myCoins} monedas</p>` : '';
    
    overlay.innerHTML = `
        <div style="background: ${bgColor}; padding: 60px 80px; border-radius: 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <h1 style="color: ${textColor}; font-size: 64px; margin: 0; text-transform: uppercase; letter-spacing: 3px;">${title}</h1>
            ${coinsText}
        </div>
    `;
    
    overlay.style.display = 'flex';
}


function hideDuelResultOverlay() {
    const overlay = document.getElementById('duelResultOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}


async function teleportToArena() {
    if (!connection) return;
    const me = players[myConnectionId];
    if (!me) {
        console.warn('teleportToArena: no me encontrado', myConnectionId, Object.keys(players));
        return;
    }
    
    let myTargetX, myTargetY;
    
    
    if (duelOpponentId && duelOpponentId.startsWith('BOT_')) {
        
        myTargetX = 1000;  
        myTargetY = 800;   
    } else {
        
        const opp = players[duelOpponentId];
        const amFirst = myConnectionId < (duelOpponentId || 'zzzz');
        myTargetX = amFirst ? duelArenaX - 120 : duelArenaX + 120;
        myTargetY = duelArenaY;
    }
    
    console.log(`🎯 Teletransportando a arena: (${myTargetX}, ${myTargetY})`);
    
    try {
        await connection.invoke("Move", Math.floor(myTargetX), Math.floor(myTargetY));
    } catch (err) {
        console.error('Error al teletransportar:', err);
    }
}


function startDuelCountdown() {
    const countdownInterval = setInterval(() => {
        if (duelCountdown > 0) {
            duelCountdown--;
            if (duelCountdown === 0) {
                clearInterval(countdownInterval);
                duelCanFire = true;
                
                setTimeout(() => {
                    duelCountdownActive = false;
                }, 2000);
            }
        }
    }, 1000);
}


function updateBullets() {
    const now = Date.now();
    
    bullets = bullets.filter(bullet => {
        
        const dx = bullet.targetX - bullet.x;
        const dy = bullet.targetY - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        
        if (checkBulletTreeCollision(bullet)) {
            console.log('Bala chocó con un árbol');
            return false; 
        }
        
        
        if (checkBulletCollision(bullet)) {
            return false; 
        }
        
        
        if (distance < bullet.speed) {
            return false;
        }
        
        
        const angle = Math.atan2(dy, dx);
        bullet.x += Math.cos(angle) * bullet.speed;
        bullet.y += Math.sin(angle) * bullet.speed;
        
        
        const distFromArena = Math.sqrt(
            Math.pow(bullet.x - duelArenaX, 2) + 
            Math.pow(bullet.y - duelArenaY, 2)
        );
        
        if (distFromArena > duelArenaSize + 50) {
            return false; 
        }
        
        
        if (now - bullet.created > 10000) {
            return false;
        }
        
        return true;
    });
}


function checkBulletCollision(bullet) {
    
    const opponent = players[duelOpponentId];
    const me = players[myConnectionId];
    
    
    let opponentX, opponentY;
    if (duelOpponentId && duelOpponentId.startsWith('BOT_')) {
        
        opponentX = 1400;
        opponentY = 800;
    } else if (opponent) {
        
        opponentX = opponent.X ?? opponent.x;
        opponentY = opponent.Y ?? opponent.y;
    } else {
        return false;
    }
    
    if (!me) return false;
    
    const meX = me.X ?? me.x;
    const meY = me.Y ?? me.y;
    
    
    if (bullet.isMine || bullet.shooterId === myConnectionId) {
        const dx = bullet.x - opponentX;
        const dy = bullet.y - opponentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        
        const hitRadius = duelOpponentId && duelOpponentId.startsWith('BOT_') ? 50 : 25;
        
        if (distance < hitRadius) {
            console.log(`💥 ¡IMPACTO! Mi bala alcanzó al oponente. Distancia: ${distance}, HitRadius: ${hitRadius}`);
            
            if (connection) {
                connection.invoke("BulletHit", duelOpponentId, bullet.damage || 20)
                    .then(() => console.log('✅ BulletHit enviado al servidor'))
                    .catch(err => console.error("❌ Error al notificar impacto:", err));
            }
            return true;
        }
    }
    
    else if (bullet.shooterId === duelOpponentId && !(duelOpponentId && duelOpponentId.startsWith('BOT_'))) {
        const dx = bullet.x - meX;
        const dy = bullet.y - meY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 25) {
            console.log(`💥 ¡ME DISPARARON! La bala del oponente me alcanzó. Distancia: ${distance}`);
            return true;
        }
    }
    
    return false;
}


function drawBullets() {
    bullets.forEach(bullet => {
        const screenX = bullet.x - cameraX;
        const screenY = bullet.y - cameraY;
        
        
        if (screenX < -20 || screenX > canvas.width + 20 ||
            screenY < -20 || screenY > canvas.height + 20) {
            return;
        }
        
        
        ctx.save();
        
        
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, bullet.radius);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFA500');
        gradient.addColorStop(1, '#FF6B35');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        
        const dx = bullet.targetX - bullet.x;
        const dy = bullet.targetY - bullet.y;
        const angle = Math.atan2(dy, dx);
        
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(
            screenX - Math.cos(angle) * 20,
            screenY - Math.sin(angle) * 20
        );
        ctx.stroke();
        
        ctx.restore();
    });
}
function updateCamera() {
    if (!myConnectionId) {
        console.warn("updateCamera: myConnectionId aún no está asignado");
        return;
    }
    
    const myPlayer = players[myConnectionId];
    if (!myPlayer) {
        console.warn(`updateCamera: No se encontró el jugador con ID ${myConnectionId}`);
        console.warn("Jugadores disponibles:", Object.keys(players));
        return;
    }
    
    
    const playerX = myPlayer.x !== undefined ? myPlayer.x : (myPlayer.X || 0);
    const playerY = myPlayer.y !== undefined ? myPlayer.y : (myPlayer.Y || 0);
    
    console.log(`updateCamera: myConnectionId=${myConnectionId}, jugador=${myPlayer.name}, pos=(${playerX}, ${playerY})`);
    
    
    cameraX = playerX - canvas.width / 2;
    cameraY = playerY - canvas.height / 2;
    
    
    let worldW, worldH;
    if (currentWorld === 'ctf') {
        worldW = CTF_WIDTH;
        worldH = CTF_HEIGHT;
    } else if (currentWorld === 'casa' || currentWorld.startsWith('casa_')) {
        worldW = HOME_WIDTH;
        worldH = HOME_HEIGHT;
    } else {
        worldW = WORLD_WIDTH;
        worldH = WORLD_HEIGHT;
    }
    
    
    cameraX = Math.max(0, Math.min(cameraX, worldW - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, worldH - canvas.height));
}


function loadPenguinImage() {
    console.log('🟢 loadPenguinImage: Iniciando carga de imágenes');
    
    
    penguinImage = new Image();
    penguinImage.src = '/pinguino.png';  
    penguinImage.onload = () => {
        console.log('✅ Pingüino cargado desde /pinguino.png - dimensiones:', penguinImage.width, 'x', penguinImage.height);
    };
    penguinImage.onerror = () => {
        console.error("❌ No se pudo cargar /pinguino.png");
        penguinImage = null;
    };
    
    
    const penguinTypes = [
        { type: 'basico', file: '/pinguino.png' },
        { type: 'emperador', file: '/pinguino_emperador.png' },
        { type: 'adelaida', file: '/pinguino_adelaida.png' },
        { type: 'rey', file: '/pinguino_rey.png' },
        { type: 'macaroni', file: '/pinguino_macaroni.png' },
        { type: 'chino', file: '/pinguino_chino.png' },
        
        { type: 'gato_naranja', file: '/gato_naranja.png' },
        { type: 'gato_vampiro', file: '/gato_vampiro.png' },
        { type: 'gato_vaquero', file: '/gato_vaquero.png' },
        { type: 'gato_langosta', file: '/gato_langosta.png' },
        { type: 'foca', file: '/foca.png' },
        { type: 'conejo', file: '/conejo.png' }
    ];
    penguinTypes.forEach(({ type, file }) => {
        const img = new Image();
        img.src = file;
        penguinImages[type] = img;
        img.onload = () => {
            console.log(`✅ Pingüino tipo '${type}' cargado desde ${file}`);
        };
        img.onerror = () => {
            console.warn(`⚠️ Error cargando pingüino tipo '${type}' desde ${file}, usando básico`);
            
            penguinImages[type] = penguinImage;
        };
    });
    
    console.log('🟢 loadPenguinImage: Imágenes en proceso de carga');
}


function loadTreeImages() {
    treeImageLarge = new Image();
    treeImageLarge.src = '/arbol_grande.png';
    treeImageLarge.onerror = () => {
        console.warn("No se pudo cargar /arbol_grande.png");
        treeImageLarge = null;
    };
    
    treeImageSmall = new Image();
    treeImageSmall.src = '/arbol_pequeno.png';
    treeImageSmall.onerror = () => {
        console.warn("No se pudo cargar /arbol_pequeno.png");
        treeImageSmall = null;
    };
    
    
    snowflakeImage = new Image();
    snowflakeImage.src = '/copo_de_nieve.png';
    snowflakeImage.onerror = () => {
        console.warn("No se pudo cargar /copo_de_nieve.png, usando círculos blancos");
        snowflakeImage = null;
        initializeSnowflakes();  
    };
    snowflakeImage.onload = () => {
        console.log('✅ Copo de nieve cargado');
        initializeSnowflakes();
    };
    
    
    setTimeout(() => {
        if (snowflakes.length === 0) {
            initializeSnowflakes();
        }
    }, 1000);
    
    
    pisoDeNieveImage = new Image();
    pisoDeNieveImage.src = '/pisodenieve.png';
    pisoDeNieveImage.onerror = () => {
        console.warn("No se pudo cargar /pisodenieve.png, usando color sólido");
        pisoDeNieveImage = null;
    };
    pisoDeNieveImage.onload = () => {
        console.log('✅ Piso de nieve cargado');
    };
    
    
    coliseoImage = new Image();
    coliseoImage.src = '/coliseo.png';
    coliseoImage.onerror = () => {
        console.warn("No se pudo cargar /coliseo.png");
        coliseoImage = null;
    };
    coliseoImage.onload = () => {
        console.log('✅ Coliseo cargado');
    };
    
    
    castilloImage = new Image();
    castilloImage.src = '/castillo.png';
    castilloImage.onerror = () => {
        console.warn("No se pudo cargar /castillo.png");
        castilloImage = null;
    };
    castilloImage.onload = () => {
        console.log('✅ Castillo CTF cargado');
    };
}


function generateTrees() {
    
    console.log('⚠️ generateTrees() llamada pero ya no se usa - árboles vienen del servidor');
}


function drawSnowFloor() {
    
    if (pisoDeNieveImage && pisoDeNieveImage.complete && pisoDeNieveImage.naturalWidth > 0) {
        
        const startTileX = Math.floor(cameraX / TILE_SIZE);
        const startTileY = Math.floor(cameraY / TILE_SIZE);
        const endTileX = Math.ceil((cameraX + canvas.width) / TILE_SIZE);
        const endTileY = Math.ceil((cameraY + canvas.height) / TILE_SIZE);
        
        
        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                
                const worldX = tileX * TILE_SIZE;
                const worldY = tileY * TILE_SIZE;
                
                if (worldX >= -TILE_SIZE && worldX <= WORLD_WIDTH + TILE_SIZE &&
                    worldY >= -TILE_SIZE && worldY <= WORLD_HEIGHT + TILE_SIZE) {
                    const screenX = worldX - cameraX;
                    const screenY = worldY - cameraY;
                    ctx.drawImage(pisoDeNieveImage, screenX, screenY, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    } else {
        
        ctx.fillStyle = '#E8F4F8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        
        ctx.strokeStyle = 'rgba(200, 220, 230, 0.5)';
        ctx.lineWidth = 1;
        
        const gridSize = 50;
        const startX = Math.floor(cameraX / gridSize) * gridSize;
        const startY = Math.floor(cameraY / gridSize) * gridSize;
        
        for (let i = startX; i < cameraX + canvas.width + gridSize; i += gridSize) {
            const screenX = i - cameraX;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, canvas.height);
            ctx.stroke();
        }
        
        for (let i = startY; i < cameraY + canvas.height + gridSize; i += gridSize) {
            const screenY = i - cameraY;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(canvas.width, screenY);
            ctx.stroke();
        }
    }
}


function render() {
    
    updateBullets();
    
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    updateCamera();

    
    if (currentWorld === 'ctf') {
        
        drawCTFWorld();
    } else if (currentWorld.startsWith('casa')) {
        
        drawHomeWorld();
    } else {
        
        drawMainWorld();
    }
    
    
    drawPlayers();
    
    
    drawBullets();
    
    
    drawDuelUI();
    
    
    if (showMap) {
        drawMinimap();
    }
    
    
    if (inDuel && duelOpponentId && duelOpponentId.startsWith('BOT_')) {
        drawPracticeBot();
    }
    
    
    if (inDuel && duelCanFire) {
        drawCrosshair();
    }
}


function drawMainWorld() {
    
    drawSnowFloor();

    
    drawTrees();
    
    
    updateAndDrawSnowflakes();

    
    if (myConnectionId && players[myConnectionId] && !inDuel && !arenaHasDuel) {
        const myPlayer = players[myConnectionId];
        const myX = myPlayer.x !== undefined ? myPlayer.x : myPlayer.X;
        const myY = myPlayer.y !== undefined ? myPlayer.y : myPlayer.Y;
        const distToColiseo = Math.sqrt(
            Math.pow(myX - duelArenaX, 2) + 
            Math.pow(myY - duelArenaY, 2)
        );
        
        
        if (distToColiseo < 100 && !insideColiseo) {
            insideColiseo = true;
            showExitColiseoButton();
            console.log('🏛️ Entraste al coliseo');
        }
    }
    
    
    if (inDuel && insideColiseo) {
        insideColiseo = false;
        const exitBtn = document.getElementById('exitColiseoBtn');
        if (exitBtn) exitBtn.remove();
        hideDuelAreaPanel();
    }

    
    drawDuelArena();
    
    
    drawColiseo();
    
    
    drawMinigameZones();
    
    
    checkMinigameEntrances();
}


function drawHomeWorld() {
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    ctx.strokeStyle = '#6B3510';
    ctx.lineWidth = 1;
    for (let y = -cameraY % 40; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    for (let x = -cameraX % 80; x < canvas.width; x += 80) {
        for (let y = -cameraY % 40; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 40);
            ctx.stroke();
        }
    }
    
    
    const wallY = 50 - cameraY;
    if (wallY > -100 && wallY < canvas.height) {
        
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(0, wallY - 100, canvas.width, 100);
        
        
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, wallY - 10, canvas.width, 10);
    }
    
    
    const rugX = HOME_WIDTH / 2 - cameraX;
    const rugY = HOME_HEIGHT / 2 - cameraY;
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.ellipse(rugX, rugY, 150, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(rugX, rugY, 100, 65, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    
    drawHomeFurniture();
    
    
    const exitX = HOME_WIDTH / 2 - cameraX;
    const exitY = HOME_HEIGHT - 30 - cameraY;
    
    ctx.fillStyle = 'rgba(74, 158, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(exitX, exitY, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(exitX, exitY, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SALIR', exitX, exitY + 5);
    
    
    if (myConnectionId && players[myConnectionId]) {
        const myPlayer = players[myConnectionId];
        const myX = myPlayer.x !== undefined ? myPlayer.x : myPlayer.X;
        const myY = myPlayer.y !== undefined ? myPlayer.y : myPlayer.Y;
        const distToExit = Math.sqrt(
            Math.pow(myX - HOME_WIDTH / 2, 2) + 
            Math.pow(myY - (HOME_HEIGHT - 30), 2)
        );
        
        if (distToExit < 40) {
            travelToWorld('principal');
        }
    }
}


function drawHomeFurniture() {
    
    const tableX = 200 - cameraX;
    const tableY = 200 - cameraY;
    ctx.fillStyle = '#654321';
    ctx.fillRect(tableX - 40, tableY - 25, 80, 50);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(tableX - 35, tableY - 20, 70, 40);
    
    
    ctx.fillStyle = '#654321';
    ctx.fillRect(tableX - 70, tableY - 15, 20, 30);
    
    
    ctx.fillRect(tableX + 50, tableY - 15, 20, 30);
    
    
    const shelfX = 600 - cameraX;
    const shelfY = 100 - cameraY;
    ctx.fillStyle = '#654321';
    ctx.fillRect(shelfX - 50, shelfY, 100, 120);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(shelfX - 45, shelfY + 5, 90, 25);
    ctx.fillRect(shelfX - 45, shelfY + 40, 90, 25);
    ctx.fillRect(shelfX - 45, shelfY + 75, 90, 25);
    
    
    const bedX = 650 - cameraX;
    const bedY = 450 - cameraY;
    ctx.fillStyle = '#654321';
    ctx.fillRect(bedX - 40, bedY - 60, 80, 120);
    ctx.fillStyle = '#87CEEB';  
    ctx.fillRect(bedX - 35, bedY - 55, 70, 90);
    ctx.fillStyle = '#fff';  
    ctx.fillRect(bedX - 30, bedY - 50, 60, 25);
}


function drawCTFWorld() {
    
    if (ctfInLobby) {
        drawCTFLobby();
        return;
    }
    
    
    const midX = CTF_WIDTH / 2 - cameraX;
    
    
    ctx.fillStyle = '#4a1a1a';
    ctx.fillRect(0, 0, midX, canvas.height);
    
    
    ctx.fillStyle = '#1a1a4a';
    ctx.fillRect(midX, 0, canvas.width - midX, canvas.height);
    
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    
    if (castilloImage) {
        const castleWidth = 150;
        const castleHeight = 180;
        
        ctx.drawImage(castilloImage, CTF_RED_BASE.x - cameraX - castleWidth/2, CTF_RED_BASE.y - cameraY - castleHeight + 40, castleWidth, castleHeight);
        
        ctx.drawImage(castilloImage, CTF_BLUE_BASE.x - cameraX - castleWidth/2, CTF_BLUE_BASE.y - cameraY - castleHeight + 40, castleWidth, castleHeight);
    }
    
    
    const redBaseX = CTF_RED_BASE.x - cameraX;
    const redBaseY = CTF_RED_BASE.y - cameraY;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(redBaseX, redBaseY, CTF_CAPTURE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    
    if (!ctfRedFlagTaken) {
        drawFlag(redBaseX, redBaseY, 'red');
    }
    
    
    const blueBaseX = CTF_BLUE_BASE.x - cameraX;
    const blueBaseY = CTF_BLUE_BASE.y - cameraY;
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(blueBaseX, blueBaseY, CTF_CAPTURE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    
    if (!ctfBlueFlagTaken) {
        drawFlag(blueBaseX, blueBaseY, 'blue');
    }
    
    
    drawCTFBullets();
    
    
    drawCTFUI();
    
    
    checkCTFInteractions();
    
    
    if (ctfCarryingFlag) {
        ctx.fillStyle = ctfTeam === 'red' ? '#0000ff' : '#ff0000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚩 ¡Lleva la bandera a tu base!', canvas.width/2, canvas.height - 30);
    }
    
    
    drawCTFPlayerUI();
    
    
    if (ctfGameOver) {
        const exitX = CTF_WIDTH / 2 - cameraX;
        const exitY = 50 - cameraY;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(exitX, exitY, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SALIR', exitX, exitY + 5);
        
        
        if (myConnectionId && players[myConnectionId]) {
            const myPlayer = players[myConnectionId];
            const myX = myPlayer.x !== undefined ? myPlayer.x : myPlayer.X;
            const myY = myPlayer.y !== undefined ? myPlayer.y : myPlayer.Y;
            const distToExit = Math.sqrt(Math.pow(myX - CTF_WIDTH/2, 2) + Math.pow(myY - 50, 2));
            if (distToExit < 40) {
                leaveCTFWorld();
            }
        }
    }
}


function drawCTFLobby() {
    
    const lobbyWidth = 800;
    const lobbyHeight = 500;
    const lobbyX = (CTF_WIDTH - lobbyWidth) / 2;
    const lobbyY = (CTF_HEIGHT - lobbyHeight) / 2;
    
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    const screenLobbyX = lobbyX - cameraX;
    const screenLobbyY = lobbyY - cameraY;
    
    
    const redZoneX = lobbyX + 50;
    const redZoneY = lobbyY + 150;
    const zoneWidth = 180;
    const zoneHeight = 200;
    
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(redZoneX - cameraX, redZoneY - cameraY, zoneWidth, zoneHeight);
    ctx.strokeStyle = ctfSelectedTeam === 'red' ? '#fff' : '#ff4444';
    ctx.lineWidth = ctfSelectedTeam === 'red' ? 4 : 2;
    ctx.strokeRect(redZoneX - cameraX, redZoneY - cameraY, zoneWidth, zoneHeight);
    
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EQUIPO ROJO', redZoneX - cameraX + zoneWidth/2, redZoneY - cameraY - 20);
    ctx.font = '14px Arial';
    ctx.fillText(`${ctfRedPlayers.length}/${CTF_TEAM_SIZE}`, redZoneX - cameraX + zoneWidth/2, redZoneY - cameraY - 5);
    
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#fff';
    ctfRedPlayers.forEach((name, i) => {
        const isReady = ctfReadyPlayers.includes(name);
        ctx.fillStyle = isReady ? '#00ff00' : '#fff';
        ctx.fillText((isReady ? '✓ ' : '') + name, redZoneX - cameraX + zoneWidth/2, redZoneY - cameraY + 30 + i * 22);
    });
    
    
    const blueZoneX = lobbyX + lobbyWidth - 50 - zoneWidth;
    const blueZoneY = lobbyY + 150;
    
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.fillRect(blueZoneX - cameraX, blueZoneY - cameraY, zoneWidth, zoneHeight);
    ctx.strokeStyle = ctfSelectedTeam === 'blue' ? '#fff' : '#4444ff';
    ctx.lineWidth = ctfSelectedTeam === 'blue' ? 4 : 2;
    ctx.strokeRect(blueZoneX - cameraX, blueZoneY - cameraY, zoneWidth, zoneHeight);
    
    ctx.fillStyle = '#4444ff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EQUIPO AZUL', blueZoneX - cameraX + zoneWidth/2, blueZoneY - cameraY - 20);
    ctx.font = '14px Arial';
    ctx.fillText(`${ctfBluePlayers.length}/${CTF_TEAM_SIZE}`, blueZoneX - cameraX + zoneWidth/2, blueZoneY - cameraY - 5);
    
    
    ctx.font = '12px Arial';
    ctfBluePlayers.forEach((name, i) => {
        const isReady = ctfReadyPlayers.includes(name);
        ctx.fillStyle = isReady ? '#00ff00' : '#fff';
        ctx.fillText((isReady ? '✓ ' : '') + name, blueZoneX - cameraX + zoneWidth/2, blueZoneY - cameraY + 30 + i * 22);
    });
    
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CAPTURA LA BANDERA', lobbyX - cameraX + lobbyWidth/2, lobbyY - cameraY + 40);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Muévete hacia un equipo para unirte', lobbyX - cameraX + lobbyWidth/2, lobbyY - cameraY + 65);
    
    
    if (myConnectionId && players[myConnectionId]) {
        const myPlayer = players[myConnectionId];
        const myX = myPlayer.x !== undefined ? myPlayer.x : myPlayer.X;
        const myY = myPlayer.y !== undefined ? myPlayer.y : myPlayer.Y;
        
        
        if (myX >= redZoneX && myX <= redZoneX + zoneWidth && 
            myY >= redZoneY && myY <= redZoneY + zoneHeight) {
            if (ctfSelectedTeam !== 'red' && ctfRedPlayers.length < CTF_TEAM_SIZE) {
                ctfSelectedTeam = 'red';
                ctfMyReady = false;
                if (connection) {
                    connection.invoke("CTFSelectTeam", "red").catch(err => console.error(err));
                }
            }
        }
        
        else if (myX >= blueZoneX && myX <= blueZoneX + zoneWidth && 
                 myY >= blueZoneY && myY <= blueZoneY + zoneHeight) {
            if (ctfSelectedTeam !== 'blue' && ctfBluePlayers.length < CTF_TEAM_SIZE) {
                ctfSelectedTeam = 'blue';
                ctfMyReady = false;
                if (connection) {
                    connection.invoke("CTFSelectTeam", "blue").catch(err => console.error(err));
                }
            }
        }
    }
    
    
    if (ctfSelectedTeam) {
        const readyBtnX = lobbyX + lobbyWidth/2 - 60;
        const readyBtnY = lobbyY + lobbyHeight - 80;
        const readyBtnW = 120;
        const readyBtnH = 40;
        
        ctx.fillStyle = ctfMyReady ? 'rgba(0, 200, 0, 0.8)' : 'rgba(0, 150, 0, 0.8)';
        ctx.fillRect(readyBtnX - cameraX, readyBtnY - cameraY, readyBtnW, readyBtnH);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(readyBtnX - cameraX, readyBtnY - cameraY, readyBtnW, readyBtnH);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(ctfMyReady ? '✓ LISTO' : 'LISTO', readyBtnX - cameraX + readyBtnW/2, readyBtnY - cameraY + 26);
        
        
        window.ctfReadyBtn = { x: readyBtnX, y: readyBtnY, w: readyBtnW, h: readyBtnH };
    }
    
    
    const totalReady = ctfReadyPlayers.length;
    const totalPlayers = ctfRedPlayers.length + ctfBluePlayers.length;
    const neededPlayers = CTF_TEAM_SIZE * 2;
    
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    if (totalPlayers < neededPlayers) {
        ctx.fillStyle = '#888';
        ctx.fillText(`Jugadores: ${totalPlayers}/${neededPlayers}`, lobbyX - cameraX + lobbyWidth/2, lobbyY - cameraY + lobbyHeight - 30);
    } else if (totalReady < totalPlayers) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`Listos: ${totalReady}/${totalPlayers} - Esperando que todos estén listos...`, lobbyX - cameraX + lobbyWidth/2, lobbyY - cameraY + lobbyHeight - 30);
    } else {
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('¡TODOS LISTOS! COMENZANDO...', lobbyX - cameraX + lobbyWidth/2, lobbyY - cameraY + lobbyHeight - 30);
    }
    
    
    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.fillRect(lobbyX - cameraX + 10, lobbyY - cameraY + lobbyHeight - 50, 80, 30);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(lobbyX - cameraX + 10, lobbyY - cameraY + lobbyHeight - 50, 80, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('SALIR', lobbyX - cameraX + 50, lobbyY - cameraY + lobbyHeight - 30);
    
    
    window.ctfExitBtn = { x: lobbyX + 10, y: lobbyY + lobbyHeight - 50, w: 80, h: 30 };
}


function drawCTFPlayerUI() {
    
    const heartX = 20;
    const heartY = canvas.height - 50;
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    for (let i = 0; i < 2; i++) {
        if (i < ctfMyHealth) {
            ctx.fillStyle = '#ff0000';
            ctx.fillText('❤️', heartX + i * 25, heartY);
        } else {
            ctx.fillStyle = '#444';
            ctx.fillText('🖤', heartX + i * 25, heartY);
        }
    }
    
    
    ctx.font = '12px Arial';
    ctx.fillStyle = ctfCanShoot ? '#00ff00' : '#ff0000';
    ctx.fillText(ctfCanShoot ? 'CLICK para disparar' : 'Recargando...', 20, canvas.height - 25);
}


function drawCTFBullets() {
    ctfBullets = ctfBullets.filter(bullet => {
        
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;
        
        
        const bulletTeam = bullet.team;
        Object.values(players).forEach(player => {
            const playerId = player.connectionId || player.ConnectionId;
            if (playerId === bullet.shooterId) return;  
            if (player.world !== 'ctf') return;
            
            
            const playerInRedTeam = ctfRedPlayers.some(name => 
                (player.name || player.Name) === name
            );
            const targetTeam = playerInRedTeam ? 'red' : 'blue';
            
            if (targetTeam === bulletTeam) return;  
            
            const px = player.x !== undefined ? player.x : (player.X || 0);
            const py = player.y !== undefined ? player.y : (player.Y || 0);
            
            const dist = Math.sqrt(Math.pow(bullet.x - px, 2) + Math.pow(bullet.y - py, 2));
            if (dist < 25) {  
                
                if (bullet.shooterId === myConnectionId && connection) {
                    connection.invoke("CTFPlayerHit", playerId).catch(err => console.error(err));
                }
                bullet.life = 0;  
            }
        });
        
        
        const screenX = bullet.x - cameraX;
        const screenY = bullet.y - cameraY;
        
        ctx.fillStyle = bullet.team === 'red' ? '#ff4444' : '#4444ff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        
        ctx.strokeStyle = bullet.team === 'red' ? 'rgba(255, 68, 68, 0.5)' : 'rgba(68, 68, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX - bullet.vx * 2, screenY - bullet.vy * 2);
        ctx.stroke();
        
        return bullet.life > 0;
    });
}


function ctfShoot(targetX, targetY) {
    if (!ctfActive || !ctfCanShoot || ctfInLobby) return;
    
    const myPlayer = players[myConnectionId];
    if (!myPlayer) return;
    
    const myX = myPlayer.x !== undefined ? myPlayer.x : myPlayer.X;
    const myY = myPlayer.y !== undefined ? myPlayer.y : myPlayer.Y;
    
    
    const worldTargetX = targetX + cameraX;
    const worldTargetY = targetY + cameraY;
    const dx = worldTargetX - myX;
    const dy = worldTargetY - myY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist === 0) return;
    
    const speed = 15;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;
    
    
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("CTFShoot", myX, myY, vx, vy).catch(err => console.error(err));
    }
    
    
    ctfCanShoot = false;
    setTimeout(() => { ctfCanShoot = true; }, ctfShootCooldown);
}


function drawFlag(x, y, color) {
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 3, y - CTF_FLAG_SIZE, 6, CTF_FLAG_SIZE + 10);
    
    
    ctx.fillStyle = color === 'red' ? '#ff0000' : '#0000ff';
    ctx.beginPath();
    ctx.moveTo(x + 3, y - CTF_FLAG_SIZE);
    ctx.lineTo(x + 35, y - CTF_FLAG_SIZE + 15);
    ctx.lineTo(x + 3, y - CTF_FLAG_SIZE + 30);
    ctx.closePath();
    ctx.fill();
    
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
}


function drawCTFUI() {
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width/2 - 120, 10, 240, 70);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width/2 - 120, 10, 240, 70);
    
    
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    
    ctx.fillStyle = '#ff4444';
    ctx.fillText(ctfRedScore.toString(), canvas.width/2 - 50, 40);
    
    
    ctx.fillStyle = '#fff';
    ctx.fillText('-', canvas.width/2, 40);
    
    
    ctx.fillStyle = '#4444ff';
    ctx.fillText(ctfBlueScore.toString(), canvas.width/2 + 50, 40);
    
    
    ctx.font = '11px Arial';
    ctx.fillStyle = '#ff6666';
    ctx.fillText(`☠️ ${ctfRedDeaths}/${CTF_MAX_DEATHS}`, canvas.width/2 - 55, 60);
    ctx.fillStyle = '#6666ff';
    ctx.fillText(`☠️ ${ctfBlueDeaths}/${CTF_MAX_DEATHS}`, canvas.width/2 + 55, 60);
    
    
    ctx.font = '11px Arial';
    ctx.fillStyle = ctfTeam === 'red' ? '#ff4444' : '#4444ff';
    ctx.fillText(`Eres: ${ctfTeam === 'red' ? 'ROJO' : 'AZUL'}`, canvas.width/2, 75);
    
    
    drawFlagCarrierIndicators();
    
    
    if (ctfGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(canvas.width/2 - 180, canvas.height/2 - 70, 360, 140);
        ctx.strokeStyle = ctfWinner === ctfTeam ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width/2 - 180, canvas.height/2 - 70, 360, 140);
        
        ctx.fillStyle = ctfWinner === ctfTeam ? '#00ff00' : '#ff0000';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(ctfWinner === ctfTeam ? '¡VICTORIA!' : 'DERROTA', canvas.width/2, canvas.height/2);
        
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        if (ctfRedScore >= ctfMaxScore || ctfBlueScore >= ctfMaxScore) {
            ctx.fillText('Por capturas de bandera', canvas.width/2, canvas.height/2 + 25);
        } else {
            ctx.fillText('Por muertes del equipo', canvas.width/2, canvas.height/2 + 25);
        }
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText('Salir: presiona ESC o ve a la puerta', canvas.width/2, canvas.height/2 + 50);
    }
}


function drawFlagCarrierIndicators() {
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 90, 150, 60);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 90, 150, 60);
    
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    
    
    ctx.fillStyle = '#ff4444';
    if (ctfRedFlagTaken && ctfRedFlagCarrier) {
        const carrierName = getPlayerNameById(ctfRedFlagCarrier);
        ctx.fillText('🚩 ROJA:', 15, 108);
        ctx.fillStyle = '#fff';
        ctx.fillText(carrierName || 'Tomada', 80, 108);
    } else {
        ctx.fillText('🚩 ROJA: En base', 15, 108);
    }
    
    
    ctx.fillStyle = '#4444ff';
    if (ctfBlueFlagTaken && ctfBlueFlagCarrier) {
        const carrierName = getPlayerNameById(ctfBlueFlagCarrier);
        ctx.fillText('🚩 AZUL:', 15, 130);
        ctx.fillStyle = '#fff';
        ctx.fillText(carrierName || 'Tomada', 80, 130);
    } else {
        ctx.fillText('🚩 AZUL: En base', 15, 130);
    }
    
    ctx.textAlign = 'center';
}


function getPlayerNameById(connectionId) {
    const player = players[connectionId];
    if (player) {
        return player.name || player.Name || 'Jugador';
    }
    return null;
}


function checkCTFInteractions() {
    if (!ctfActive || !myConnectionId || !players[myConnectionId]) return;
    
    const myPlayer = players[myConnectionId];
    const myX = myPlayer.x !== undefined ? myPlayer.x : myPlayer.X;
    const myY = myPlayer.y !== undefined ? myPlayer.y : myPlayer.Y;
    
    
    if (!ctfCarryingFlag) {
        const enemyBase = ctfTeam === 'red' ? CTF_BLUE_BASE : CTF_RED_BASE;
        const enemyFlagTaken = ctfTeam === 'red' ? ctfBlueFlagTaken : ctfRedFlagTaken;
        
        if (!enemyFlagTaken) {
            const distToFlag = Math.sqrt(
                Math.pow(myX - enemyBase.x, 2) + 
                Math.pow(myY - enemyBase.y, 2)
            );
            
            if (distToFlag < CTF_CAPTURE_RADIUS) {
                if (connection && connection.state === signalR.HubConnectionState.Connected) {
                    connection.invoke("CTFTakeFlag").catch(err => console.error(err));
                }
            }
        }
    }
    
    
    if (ctfCarryingFlag) {
        const myBase = ctfTeam === 'red' ? CTF_RED_BASE : CTF_BLUE_BASE;
        const distToBase = Math.sqrt(
            Math.pow(myX - myBase.x, 2) + 
            Math.pow(myY - myBase.y, 2)
        );
        
        if (distToBase < CTF_CAPTURE_RADIUS) {
            if (connection && connection.state === signalR.HubConnectionState.Connected) {
                connection.invoke("CTFCaptureFlag").catch(err => console.error(err));
            }
        }
    }
    
    
    if (!ctfCarryingFlag) {
        Object.values(players).forEach(p => {
            if (p.connectionId === myConnectionId) return;
            const pTeam = p.ctfTeam;
            if (pTeam === ctfTeam) return;  
            
            const px = p.x !== undefined ? p.x : p.X;
            const py = p.y !== undefined ? p.y : p.Y;
            const dist = Math.sqrt(Math.pow(myX - px, 2) + Math.pow(myY - py, 2));
            
            if (dist < 50) {
                
                const inMyTerritory = ctfTeam === 'red' ? px < CTF_WIDTH / 2 : px > CTF_WIDTH / 2;
                if (inMyTerritory) {
                    if (connection && connection.state === signalR.HubConnectionState.Connected) {
                        connection.invoke("CTFTagPlayer", p.connectionId).catch(err => console.error(err));
                    }
                }
            }
        });
    }
}





function leaveCTFWorld() {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("LeaveCTFWorld").catch(err => console.error(err));
    }
}


function drawDuelArena() {
    if (inDuel || arenaHasDuel) {
        const arenaScreenX = duelArenaX - cameraX;
        const arenaScreenY = duelArenaY - cameraY;
        
        
        ctx.fillStyle = inDuel ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 100, 100, 0.05)';
        ctx.beginPath();
        ctx.arc(arenaScreenX, arenaScreenY, duelArenaSize, 0, Math.PI * 2);
        ctx.fill();
        
        
        const pulse = Math.sin(Date.now() / 200) * 2 + 4;
        ctx.strokeStyle = inDuel ? 'rgba(255, 215, 0, 0.9)' : 'rgba(255, 100, 100, 0.7)';
        ctx.lineWidth = 3 + pulse;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(arenaScreenX, arenaScreenY, duelArenaSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        
        ctx.fillStyle = inDuel ? '#FFD700' : '#FF6464';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(inDuel ? 'ARENA DE DUELO' : '⚔️ DUELO EN PROGRESO ⚔️', arenaScreenX, arenaScreenY - duelArenaSize - 25);
        
        if (!inDuel && arenaHasDuel) {
            ctx.fillStyle = '#FF6464';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('¡NO ENTRAR!', arenaScreenX, arenaScreenY - duelArenaSize - 5);
        }
    }
}


function drawColiseo() {
    if (inDuel || arenaHasDuel) return;  
    
    const arenaScreenX = duelArenaX - cameraX;
    const arenaScreenY = duelArenaY - cameraY;
    
    if (arenaScreenX > -duelDetectionSize && arenaScreenX < canvas.width + duelDetectionSize &&
        arenaScreenY > -duelDetectionSize && arenaScreenY < canvas.height + duelDetectionSize) {
        
        if (coliseoImage && coliseoImage.complete && coliseoImage.naturalWidth > 0) {
            const coliseoSize = 250;
            ctx.drawImage(
                coliseoImage,
                arenaScreenX - coliseoSize / 2,
                arenaScreenY - coliseoSize / 2,
                coliseoSize,
                coliseoSize
            );
        } else {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(arenaScreenX, arenaScreenY, duelDetectionSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('DUELO', arenaScreenX, arenaScreenY - 15);
            ctx.font = 'bold 12px Arial';
            ctx.fillText('ZONA DE DUELO', arenaScreenX, arenaScreenY + 15);
        }
    }
}


function drawMinigameZones() {
    
    const ctfX = CTF_ENTRANCE_X - cameraX;
    const ctfY = CTF_ENTRANCE_Y - cameraY;
    
    if (ctfX > -200 && ctfX < canvas.width + 200 && ctfY > -200 && ctfY < canvas.height + 200) {
        
        if (castilloImage && castilloImage.complete) {
            const castleWidth = 180;
            const castleHeight = 200;
            ctx.drawImage(castilloImage, ctfX - castleWidth/2, ctfY - castleHeight + 40, castleWidth, castleHeight);
        }
        
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('CAPTURA LA BANDERA', ctfX, ctfY - 160);
        ctx.fillText('CAPTURA LA BANDERA', ctfX, ctfY - 160);
        
        ctx.font = 'bold 11px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.strokeText('3 vs 3', ctfX, ctfY - 145);
        ctx.fillText('3 vs 3', ctfX, ctfY - 145);
    }
}


function checkMinigameEntrances() {
    if (!myConnectionId || !players[myConnectionId]) return;
    
    const myPlayer = players[myConnectionId];
    const myX = myPlayer.x !== undefined ? myPlayer.x : myPlayer.X;
    const myY = myPlayer.y !== undefined ? myPlayer.y : myPlayer.Y;
    
    
    const distToCTF = Math.sqrt(
        Math.pow(myX - CTF_ENTRANCE_X, 2) + 
        Math.pow(myY - CTF_ENTRANCE_Y, 2)
    );
    
    if (distToCTF < CTF_ENTRANCE_SIZE && !inCTFWorld) {
        showMinigameEntryModal('ctf');
    }
}


let minigameModalShowing = false;


function showMinigameEntryModal(gameType) {
    if (minigameModalShowing) return;
    minigameModalShowing = true;
    
    const existingModal = document.querySelector('.minigame-entry-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'minigame-entry-modal';
    
    const title = '🚩 CAPTURA LA BANDERA';
    const desc = 'Captura la bandera enemiga y llévala a tu base. ¡3 capturas para ganar!';
    
    modal.innerHTML = `
        <div class="minigame-modal-overlay"></div>
        <div class="minigame-modal-box">
            <h2>${title}</h2>
            <p>${desc}</p>
            <div class="minigame-modal-btns">
                <button class="enter-btn" onclick="enterMinigame('${gameType}')">ENTRAR</button>
                <button class="cancel-btn" onclick="closeMinigameModal()">CANCELAR</button>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .minigame-entry-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .minigame-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
        }
        .minigame-modal-box {
            position: relative;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 3px solid #8A2BE2;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            min-width: 350px;
            box-shadow: 0 0 30px rgba(138,43,226,0.5);
        }
        .minigame-modal-box h2 {
            color: #8A2BE2;
            margin: 0 0 15px 0;
            font-size: 28px;
        }
        .minigame-modal-box p {
            color: #ddd;
            margin: 0 0 25px 0;
            font-size: 14px;
        }
        .minigame-modal-btns {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        .minigame-modal-btns button {
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
        }
        .minigame-modal-btns .enter-btn {
            background: #8A2BE2;
            color: white;
        }
        .minigame-modal-btns .enter-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 0 15px rgba(138,43,226,0.7);
        }
        .minigame-modal-btns .cancel-btn {
            background: #444;
            color: white;
        }
        .minigame-modal-btns .cancel-btn:hover {
            background: #555;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
}


function closeMinigameModal() {
    const modal = document.querySelector('.minigame-entry-modal');
    if (modal) modal.remove();
    minigameModalShowing = false;
}


function enterMinigame(gameType) {
    closeMinigameModal();
    
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        if (gameType === 'ctf') {
            connection.invoke("JoinCTFWorld").catch(err => console.error(err));
        }
    }
}


function drawPlayers() {
    
    const playerList = Object.values(players).filter(p => {
        const id = p.connectionId || p.ConnectionId;
        if (id && id.startsWith('BOT_')) return false;
        if (id === myConnectionId && insideColiseo && !inDuel) return false;
        
        
        const playerWorld = p.world || 'principal';
        
        
        let myRealWorld = currentWorld;
        if (currentWorld === 'casa') {
            
            myRealWorld = `casa_${myPlayerName}`;
        }
        
        
        
        if (myRealWorld === 'ctf') {
            return playerWorld === myRealWorld;
        }
        
        
        if (myRealWorld.startsWith('casa_')) {
            
            return playerWorld === myRealWorld || id === myConnectionId;
        }
        
        
        if (playerWorld !== 'principal') {
            return false;
        }
        
        return true;
    });
    
    playerList.forEach(player => {
        const isMe = player.connectionId === myConnectionId;
        const size = 40;
        const x = player.x !== undefined ? player.x : (player.X || 0);
        const y = player.y !== undefined ? player.y : (player.Y || 0);
        
        const screenX = x - cameraX;
        const screenY = y - cameraY;
        
        if (screenX + size/2 < 0 || screenX - size/2 > canvas.width ||
            screenY + size/2 < 0 || screenY - size/2 > canvas.height) {
            return;
        }

        const pType = player.penguinType || player.PenguinType || 'basico';
        const pImg = penguinImages[pType];
        
        if (pImg && pImg.complete) {
            ctx.drawImage(pImg, screenX - size/2, screenY - size/2, size, size);
        } else if (penguinImage && penguinImage.complete) {
            ctx.drawImage(penguinImage, screenX - size/2, screenY - size/2, size, size);
        } else {
            ctx.fillStyle = player.color || '#667eea';
            ctx.fillRect(screenX - size/2, screenY - size/2, size, size);
        }

        
        if (isMe) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX - size/2 - 2, screenY - size/2 - 2, size + 4, size + 4);
        }
        
        
        if (inCTFWorld && !ctfInLobby) {
            const playerId = player.connectionId || player.ConnectionId;
            const isRedCarrier = ctfRedFlagCarrier === playerId;
            const isBluCarrier = ctfBlueFlagCarrier === playerId;
            
            if (isRedCarrier || isBluCarrier) {
                
                const pulseSize = 5 + Math.sin(Date.now() / 150) * 3;
                ctx.strokeStyle = isRedCarrier ? '#ff0000' : '#0000ff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(screenX, screenY, size/2 + pulseSize, 0, Math.PI * 2);
                ctx.stroke();
                
                
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                const flagY = screenY - size/2 - 25 + Math.sin(Date.now() / 200) * 3;
                ctx.fillText('🚩', screenX, flagY);
                
                
                ctx.font = 'bold 9px Arial';
                ctx.fillStyle = isRedCarrier ? '#ff4444' : '#4444ff';
                ctx.fillText('BANDERA', screenX, screenY - size/2 - 35);
            }
        }

        
        ctx.fillStyle = isMe ? '#00ff00' : '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name || 'Jugador', screenX, screenY - size/2 - 5);

        
        const msg = floatingMessages[player.connectionId];
        if (msg && Date.now() - msg.timestamp < MESSAGE_DURATION) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '11px Arial';
            const textWidth = ctx.measureText(msg.message).width;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(screenX - textWidth/2 - 5, screenY - size/2 - 35, textWidth + 10, 20);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText(msg.message, screenX, screenY - size/2 - 20);
        }
    });
}


function drawBullets() {
    bullets.forEach((bullet, index) => {
        const screenX = bullet.x - cameraX;
        const screenY = bullet.y - cameraY;
        
        ctx.fillStyle = bullet.isMine ? '#00ff00' : '#ff0000';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}


function drawDuelUI() {
    if (!inDuel) return;
    
    
    drawDuelHUD();
}


function drawMinimap() {
    const mapWidth = 200;
    const mapHeight = 150;
    const mapX = canvas.width - mapWidth - 10;
    const mapY = 10;
    const isCasa = currentWorld === 'casa' || currentWorld.startsWith('casa_');
    const worldW = isCasa ? HOME_WIDTH : WORLD_WIDTH;
    const worldH = isCasa ? HOME_HEIGHT : WORLD_HEIGHT;
    
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);
    
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    let mapTitle = 'PLAZA PRINCIPAL';
    if (currentWorld === 'casa') mapTitle = 'MI CASA';
    else if (currentWorld.startsWith('casa_')) mapTitle = `CASA DE ${currentWorld.replace('casa_', '').toUpperCase()}`;
    ctx.fillText(mapTitle, mapX + mapWidth/2, mapY + 12);
    
    
    const scaleX = mapWidth / worldW;
    const scaleY = (mapHeight - 20) / worldH;
    
    Object.values(players).forEach(p => {
        const px = p.x !== undefined ? p.x : p.X;
        const py = p.y !== undefined ? p.y : p.Y;
        const dotX = mapX + px * scaleX;
        const dotY = mapY + 20 + py * scaleY;
        
        const isMe = p.connectionId === myConnectionId;
        ctx.fillStyle = isMe ? '#00ff00' : '#ff0000';
        ctx.beginPath();
        ctx.arc(dotX, dotY, isMe ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
    });
}


function drawPracticeBot() {
    const botX = 1400;
    const botY = 800;
    const screenX = botX - cameraX;
    const screenY = botY - cameraY;
    
    
    if (screenX < -100 || screenX > canvas.width + 100 ||
        screenY < -100 || screenY > canvas.height + 100) {
        return;
    }
    
    ctx.save();
    
    const size = 50;  
    
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + size/2 + 5, size/2, size/6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY, size/2, size/2 + 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 5, size/3, size/2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(screenX - 8, screenY - 10, 6, 0, Math.PI * 2);
    ctx.arc(screenX + 8, screenY - 10, 6, 0, Math.PI * 2);
    ctx.fill();
    
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(screenX - 8, screenY - 10, 3, 0, Math.PI * 2);
    ctx.arc(screenX + 8, screenY - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    
    
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - 2);
    ctx.lineTo(screenX - 8, screenY + 8);
    ctx.lineTo(screenX + 8, screenY + 8);
    ctx.closePath();
    ctx.fill();
    
    
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(screenX - size/2 - 5, screenY, 8, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(screenX + size/2 + 5, screenY, 8, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(255, 0, 0, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenX, screenY, size/2 + 10, 0, Math.PI * 2);
    ctx.stroke();
    
    
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 Bot de Práctica', screenX, screenY - size/2 - 20);
    
    
    const healthPercent = opponentHealth / 100;
    const barWidth = 80;
    const barHeight = 10;
    
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(screenX - barWidth/2, screenY + size/2 + 15, barWidth, barHeight);
    
    
    ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFA726' : '#F44336';
    ctx.fillRect(screenX - barWidth/2, screenY + size/2 + 15, barWidth * healthPercent, barHeight);
    
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX - barWidth/2, screenY + size/2 + 15, barWidth, barHeight);
    
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(`${Math.round(opponentHealth)}%`, screenX, screenY + size/2 + 23);
    
    ctx.restore();
}


function drawCrosshair() {
    ctx.save();
    
    const size = 20;
    
    
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    
    
    ctx.beginPath();
    ctx.moveTo(mouseX - size, mouseY);
    ctx.lineTo(mouseX - 5, mouseY);
    ctx.moveTo(mouseX + 5, mouseY);
    ctx.lineTo(mouseX + size, mouseY);
    ctx.stroke();
    
    
    ctx.beginPath();
    ctx.moveTo(mouseX, mouseY - size);
    ctx.lineTo(mouseX, mouseY - 5);
    ctx.moveTo(mouseX, mouseY + 5);
    ctx.lineTo(mouseX, mouseY + size);
    ctx.stroke();
    
    
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    
    
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
}


function drawDuelHUD() {
    ctx.save();
    
    
    if (duelCountdownActive && duelCountdown >= 0) {
        const countdownText = duelCountdown > 0 ? duelCountdown : '¡DISPARA!';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.strokeText(countdownText, canvas.width / 2, canvas.height / 2);
        ctx.fillText(countdownText, canvas.width / 2, canvas.height / 2);
    } else if (duelCanFire) {
        
        drawHealthBars();
        
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`DUELO vs ${gunGameOpponentName}`, canvas.width / 2, 20);
    }
    
    ctx.restore();
}


function drawHealthBars() {
    const barWidth = 200;
    const barHeight = 25;
    const padding = 20;
    
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(padding, 40, barWidth, barHeight);
    
    const myHealthPercent = Math.max(0, myHealth / 100);
    const myHealthColor = myHealthPercent > 0.5 ? '#4CAF50' : myHealthPercent > 0.25 ? '#FFA726' : '#F44336';
    ctx.fillStyle = myHealthColor;
    ctx.fillRect(padding, 40, barWidth * myHealthPercent, barHeight);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, 40, barWidth, barHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`TÚ: ${Math.floor(myHealth)}`, padding + 5, 56);
    
    
    const opponentX = canvas.width - barWidth - padding;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(opponentX, 40, barWidth, barHeight);
    
    const opponentHealthPercent = Math.max(0, opponentHealth / 100);
    const opponentHealthColor = opponentHealthPercent > 0.5 ? '#4CAF50' : opponentHealthPercent > 0.25 ? '#FFA726' : '#F44336';
    ctx.fillStyle = opponentHealthColor;
    ctx.fillRect(opponentX, 40, barWidth * opponentHealthPercent, barHeight);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(opponentX, 40, barWidth, barHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${gunGameOpponentName}: ${Math.floor(opponentHealth)}`, opponentX + barWidth - 5, 56);
}


function checkTreeCollision(proposedX, proposedY) {
    if (!Array.isArray(trees) || trees.length === 0) return false;

    const playerRadius = 20; 

    for (const tree of trees) {
        const treeRadius = (tree.size || 0) / 2;
        const dx = proposedX - (tree.x || 0);
        const dy = proposedY - (tree.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < playerRadius + treeRadius) {
            return true; 
        }
    }
    return false;
}


function checkBulletTreeCollision(bullet) {
    if (!bullet || !Array.isArray(trees) || trees.length === 0) return false;

    for (const tree of trees) {
        const treeRadius = (tree.size || 0) / 2;
        const dx = bullet.x - (tree.x || 0);
        const dy = bullet.y - (tree.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < (bullet.radius || 0) + treeRadius) {
            return true;
        }
    }
    return false;
}


function drawTrees() {
    trees.forEach(tree => {
        const screenX = tree.x - cameraX;
        const screenY = tree.y - cameraY;
        
        
        if (screenX + tree.size < 0 || screenX - tree.size > canvas.width ||
            screenY + tree.size < 0 || screenY - tree.size > canvas.height) {
            return;
        }
        
        
        const treeImage = tree.isLarge ? treeImageLarge : treeImageSmall;
        
        if (treeImage && treeImage.complete) {
            ctx.drawImage(treeImage, screenX - tree.size/2, screenY - tree.size/2, tree.size, tree.size);
        } else {
            
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(screenX, screenY, tree.size/2, 0, Math.PI * 2);
            ctx.fill();
            
            
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(screenX - 5, screenY, 10, tree.size/2);
        }
    });
}


function updatePlayersList() {
    playersListContent.innerHTML = '';
    
    Object.values(players).forEach(player => {
        const div = document.createElement('div');
        div.className = 'player-item';
        div.style.borderLeft = `2px solid ${player.color}`;
        div.innerHTML = `
            <strong>${player.name}</strong> (${player.penguinType})
            ${player.connectionId === myConnectionId ? ' (You)' : ''}
        `;
        playersListContent.appendChild(div);
    });
    
    
    playerCountSpan.textContent = Object.keys(players).length;
}


function initializeSnowflakes() {
    snowflakes = [];
    for (let i = 0; i < MAX_SNOWFLAKES; i++) {
        snowflakes.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            speedY: 0.3 + Math.random() * 0.4, 
            speedX: -0.1 + Math.random() * 0.2,
            size: 15 + Math.random() * 20,
            opacity: 0.7 + Math.random() * 0.3
        });
    }
    console.log(`${MAX_SNOWFLAKES} copos de nieve inicializados`);
}


function updateAndDrawSnowflakes() {
    if (snowflakes.length === 0) return;
    
    snowflakes.forEach(flake => {
        
        flake.y += flake.speedY;
        flake.x += flake.speedX;
        
        
        if (flake.y > WORLD_HEIGHT) {
            flake.y = 0;
            flake.x = Math.random() * WORLD_WIDTH;
        }
        if (flake.x < 0) flake.x = WORLD_WIDTH;
        if (flake.x > WORLD_WIDTH) flake.x = 0;
        
        
        const screenX = flake.x - cameraX;
        const screenY = flake.y - cameraY;
        
        
        if (screenX < -20 || screenX > canvas.width + 20 ||
            screenY < -20 || screenY > canvas.height + 20) {
            return;
        }
        
        ctx.save();
        ctx.globalAlpha = flake.opacity;
        
        
        if (snowflakeImage && snowflakeImage.complete) {
            ctx.drawImage(snowflakeImage, screenX - flake.size/2, screenY - flake.size/2, flake.size, flake.size);
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(screenX, screenY, flake.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
}


function displayMessage(senderName, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    const isMe = senderName === myPlayerName;
    messageDiv.classList.add(isMe ? 'my-message' : 'other-message');
    
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    messageDiv.innerHTML = `
        <span class="message-sender"><strong>${senderName}</strong></span>
        <span class="message-text">${escapeHtml(message)}</span>
        <span class="message-time">${timestamp}</span>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


function drawMiniMap() {
    
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    
    drawRoundRect(ctx, canvas.width - 320, 20, 300, 225, 10);
    ctx.fill();
    ctx.stroke();
    
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('MAPA', canvas.width - 310, 40);
    
    
    const scaleX = 280 / WORLD_WIDTH;
    const scaleY = 170 / WORLD_HEIGHT;
    
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(canvas.width - 310, 50, 280, 170);
    
    
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 320, 65);
    ctx.lineTo(canvas.width - 20, 65);
    ctx.stroke();
    
    
    const myPlayer = players[myConnectionId];
    if (myPlayer) {
        const mapX = canvas.width - 310 + (myPlayer.X || 0) * scaleX;
        const mapY = 50 + (myPlayer.Y || 0) * scaleY;
        
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(mapX, mapY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    
    const duelMapX = canvas.width - 310 + duelArenaX * scaleX;
    const duelMapY = 50 + duelArenaY * scaleY;
    
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.arc(duelMapX, duelMapY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(duelMapX, duelMapY, 5, 0, Math.PI * 2);
    ctx.stroke();
    
    
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Presiona M para cerrar', canvas.width - 160, 245);
    
    
    const playerCount = Object.keys(players).length;
    if (playerCount >= 2) {
        ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
        ctx.fillRect(canvas.width - 310, 245, 140, 30);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('[DUELO]', canvas.width - 240, 265);
        
        
        window.gunGameButtonArea = {
            x: canvas.width - 310,
            y: 245,
            width: 140,
            height: 30
        };
    }
    
    ctx.restore();
}





let playerMenuPanel = null;


function togglePlayerMenu() {
    if (playerMenuOpen) {
        closePlayerMenu();
    } else {
        openPlayerMenu();
    }
}


function openPlayerMenu() {
    playerMenuOpen = true;
    
    if (!playerMenuPanel) {
        playerMenuPanel = document.createElement('div');
        playerMenuPanel.id = 'playerMenuPanel';
        playerMenuPanel.innerHTML = `
            <div class="player-menu-overlay"></div>
            <div class="player-menu-content">
                <button class="player-menu-close" onclick="closePlayerMenu()">X</button>
                
                <div class="player-menu-header">
                    <h2>MI PINGUINO</h2>
                </div>
                
                <div class="player-menu-body">
                    <div class="player-menu-left">
                        <div class="player-avatar-container">
                            <div class="player-avatar" id="menuPlayerAvatar"></div>
                            <div class="player-name" id="menuPlayerName">Jugador</div>
                        </div>
                        
                        <div class="player-coins">
                            <img src="/moneda.png" alt="monedas" class="coin-icon">
                            <span id="menuPlayerCoins">0</span>
                        </div>
                    </div>
                    
                    <div class="player-menu-right">
                        <div class="player-items-section">
                            <h3>ITEMS</h3>
                            <div class="player-items-grid" id="menuPlayerItems">
                                <div class="item-slot empty"></div>
                                <div class="item-slot empty"></div>
                                <div class="item-slot empty"></div>
                                <div class="item-slot empty"></div>
                                <div class="item-slot empty"></div>
                                <div class="item-slot empty"></div>
                            </div>
                        </div>
                        
                        <div class="player-worlds-section">
                            <h3>MUNDOS</h3>
                            <div class="worlds-list">
                                <div class="world-item ${currentWorld === 'principal' ? 'active' : ''}" onclick="travelToWorld('principal')">
                                    <div class="world-icon">P</div>
                                    <div class="world-info">
                                        <div class="world-name">Plaza Principal</div>
                                        <div class="world-desc">El mundo principal</div>
                                    </div>
                                </div>
                                <div class="world-item ${currentWorld === 'casa' ? 'active' : ''}" onclick="travelToWorld('casa')">
                                    <div class="world-icon">C</div>
                                    <div class="world-info">
                                        <div class="world-name">Mi Casa</div>
                                        <div class="world-desc">Tu hogar personal</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        
        const style = document.createElement('style');
        style.textContent = `
            #playerMenuPanel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .player-menu-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
            }
            
            .player-menu-content {
                position: relative;
                background: #ffffff;
                border-radius: 12px;
                padding: 25px;
                width: 650px;
                max-width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                border: 3px solid #333;
                animation: menuSlideIn 0.2s ease-out;
            }
            
            @keyframes menuSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .player-menu-close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #333;
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .player-menu-close:hover {
                background: #555;
            }
            
            .player-menu-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #eee;
                padding-bottom: 15px;
            }
            
            .player-menu-header h2 {
                color: #333;
                font-size: 20px;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .player-menu-body {
                display: flex;
                gap: 25px;
            }
            
            .player-menu-left {
                flex: 0 0 180px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
            }
            
            .player-avatar-container {
                text-align: center;
            }
            
            .player-avatar {
                width: 130px;
                height: 130px;
                background: #f5f5f5;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
                border: 3px solid #333;
                overflow: hidden;
            }
            
            .player-avatar img {
                width: 100px;
                height: 100px;
                object-fit: contain;
            }
            
            .player-name {
                color: #333;
                font-size: 16px;
                font-weight: bold;
            }
            
            .player-coins {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #fff8e1;
                padding: 10px 20px;
                border-radius: 8px;
                border: 2px solid #ffc107;
            }
            
            .player-coins .coin-icon {
                width: 24px;
                height: 24px;
            }
            
            .player-coins span {
                color: #f57c00;
                font-size: 18px;
                font-weight: bold;
            }
            
            .player-menu-right {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .player-items-section h3,
            .player-worlds-section h3 {
                color: #333;
                font-size: 12px;
                margin: 0 0 10px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
            }
            
            .player-items-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 6px;
            }
            
            .item-slot {
                aspect-ratio: 1;
                background: #f9f9f9;
                border-radius: 6px;
                border: 2px solid #ddd;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .item-slot.empty::after {
                content: '';
            }
            
            .worlds-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .world-item {
                display: flex;
                align-items: center;
                gap: 12px;
                background: #f9f9f9;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid #ddd;
            }
            
            .world-item:hover {
                background: #f0f0f0;
                border-color: #bbb;
            }
            
            .world-item.active {
                border-color: #333;
                background: #e8e8e8;
            }
            
            .world-icon {
                width: 36px;
                height: 36px;
                background: #333;
                color: #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
            }
            
            .world-info {
                flex: 1;
            }
            
            .world-name {
                color: #333;
                font-weight: bold;
                font-size: 14px;
            }
            
            .world-desc {
                color: #888;
                font-size: 11px;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(playerMenuPanel);
    }
    
    
    updatePlayerMenuData();
    playerMenuPanel.style.display = 'flex';
}


function closePlayerMenu() {
    playerMenuOpen = false;
    if (playerMenuPanel) {
        playerMenuPanel.style.display = 'none';
    }
}





function toggleFriendsPanel() {
    if (friendsPanelOpen) {
        closeFriendsPanel();
    } else {
        openFriendsPanel();
    }
}

function openFriendsPanel() {
    friendsPanelOpen = true;
    
    
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("GetFriendsList").catch(err => console.error(err));
    }
    
    if (!friendsPanel) {
        createFriendsPanel();
    }
    
    friendsPanel.style.display = 'flex';
    updateFriendsPanelData();
}

function closeFriendsPanel() {
    friendsPanelOpen = false;
    currentChatFriend = null;
    if (friendsPanel) {
        friendsPanel.style.display = 'none';
    }
}

function createFriendsPanel() {
    friendsPanel = document.createElement('div');
    friendsPanel.id = 'friendsPanel';
    friendsPanel.innerHTML = `
        <div class="friends-overlay"></div>
        <div class="friends-content">
            <button class="friends-close" onclick="closeFriendsPanel()">X</button>
            
            <div class="friends-header">
                <h2>AMIGOS</h2>
            </div>
            
            <div class="friends-body">
                <div class="friends-sidebar">
                    <div class="friends-tabs">
                        <button class="tab-btn active" onclick="showFriendsTab('list')">Amigos</button>
                        <button class="tab-btn" onclick="showFriendsTab('requests')">Solicitudes</button>
                        <button class="tab-btn" onclick="showFriendsTab('add')">Agregar</button>
                    </div>
                    
                    <div id="friendsListTab" class="tab-content active">
                        <div id="friendsListContainer"></div>
                    </div>
                    
                    <div id="friendsRequestsTab" class="tab-content">
                        <div id="requestsContainer"></div>
                    </div>
                    
                    <div id="friendsAddTab" class="tab-content">
                        <div class="add-friend-form">
                            <input type="text" id="addFriendInput" placeholder="Nombre de usuario">
                            <button onclick="sendFriendRequestFromInput()">Enviar solicitud</button>
                        </div>
                        <div class="online-players">
                            <h4>Jugadores en linea:</h4>
                            <div id="onlinePlayersContainer"></div>
                        </div>
                    </div>
                </div>
                
                <div class="friends-chat" id="friendsChatArea" style="display: none;">
                    <div class="chat-header">
                        <button onclick="closePrivateChat()" class="back-btn">&lt;</button>
                        <span id="chatFriendName">Amigo</span>
                        <button onclick="inviteFriendToHouse()" class="invite-btn">Invitar a casa</button>
                    </div>
                    <div class="chat-messages" id="privateChatMessages"></div>
                    <div class="chat-input">
                        <input type="text" id="privateChatInput" placeholder="Escribe un mensaje..." onkeypress="handlePrivateChatKey(event)">
                        <button onclick="sendPrivateChatMessage()">Enviar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        #friendsPanel {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1001;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .friends-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
        }
        
        .friends-content {
            position: relative;
            background: #ffffff;
            border-radius: 12px;
            width: 700px;
            max-width: 95%;
            height: 500px;
            max-height: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            border: 3px solid #333;
            display: flex;
            flex-direction: column;
        }
        
        .friends-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #333;
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 6px;
            cursor: pointer;
            z-index: 10;
        }
        
        .friends-header {
            padding: 15px 20px;
            border-bottom: 2px solid #eee;
        }
        
        .friends-header h2 {
            margin: 0;
            color: #333;
            font-size: 18px;
        }
        
        .friends-body {
            flex: 1;
            display: flex;
            overflow: hidden;
        }
        
        .friends-sidebar {
            width: 250px;
            border-right: 1px solid #eee;
            display: flex;
            flex-direction: column;
        }
        
        .friends-tabs {
            display: flex;
            border-bottom: 1px solid #eee;
        }
        
        .tab-btn {
            flex: 1;
            padding: 10px;
            border: none;
            background: #f5f5f5;
            cursor: pointer;
            font-size: 12px;
        }
        
        .tab-btn.active {
            background: #333;
            color: white;
        }
        
        .tab-content {
            display: none;
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .friend-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 5px;
            background: #f9f9f9;
        }
        
        .friend-item:hover {
            background: #eee;
        }
        
        .friend-status {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 10px;
        }
        
        .friend-status.online {
            background: #4CAF50;
        }
        
        .friend-status.offline {
            background: #999;
        }
        
        .friend-name {
            flex: 1;
            font-weight: 500;
        }
        
        .request-item {
            display: flex;
            align-items: center;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 8px;
            margin-bottom: 5px;
        }
        
        .request-name {
            flex: 1;
        }
        
        .request-btns button {
            padding: 5px 10px;
            margin-left: 5px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .accept-btn {
            background: #4CAF50;
            color: white;
        }
        
        .reject-btn {
            background: #f44336;
            color: white;
        }
        
        .add-friend-form {
            display: flex;
            gap: 5px;
            margin-bottom: 15px;
        }
        
        .add-friend-form input {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .add-friend-form button {
            padding: 8px 12px;
            background: #333;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .online-players h4 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 12px;
        }
        
        .online-player-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px;
            background: #f9f9f9;
            border-radius: 4px;
            margin-bottom: 5px;
        }
        
        .online-player-item button {
            padding: 4px 8px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
        }
        
        .friends-chat {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .chat-header {
            display: flex;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
            gap: 10px;
        }
        
        .back-btn {
            background: #eee;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .chat-header span {
            flex: 1;
            font-weight: bold;
        }
        
        .invite-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            background: #f9f9f9;
        }
        
        .chat-message {
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: 8px;
            max-width: 80%;
        }
        
        .chat-message.mine {
            background: #333;
            color: white;
            margin-left: auto;
        }
        
        .chat-message.theirs {
            background: #e0e0e0;
        }
        
        .chat-input {
            display: flex;
            padding: 10px;
            gap: 5px;
            border-top: 1px solid #eee;
        }
        
        .chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .chat-input button {
            padding: 10px 15px;
            background: #333;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .no-friends {
            text-align: center;
            color: #999;
            padding: 20px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(friendsPanel);
}

function showFriendsTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`friends${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'add') {
        updateOnlinePlayersList();
    }
}

function updateFriendsPanelData() {
    if (!friendsPanel) return;
    
    
    const listContainer = document.getElementById('friendsListContainer');
    if (listContainer) {
        if (friendsList.length === 0) {
            listContainer.innerHTML = '<div class="no-friends">No tienes amigos aun</div>';
        } else {
            listContainer.innerHTML = friendsList.map(f => `
                <div class="friend-item" onclick="openPrivateChat('${f.username}')">
                    <div class="friend-status ${f.isOnline ? 'online' : 'offline'}"></div>
                    <span class="friend-name">${f.username}</span>
                </div>
            `).join('');
        }
    }
    
    
    const requestsContainer = document.getElementById('requestsContainer');
    if (requestsContainer) {
        if (pendingRequests.length === 0) {
            requestsContainer.innerHTML = '<div class="no-friends">No hay solicitudes pendientes</div>';
        } else {
            requestsContainer.innerHTML = pendingRequests.map(u => `
                <div class="request-item">
                    <span class="request-name">${u}</span>
                    <div class="request-btns">
                        <button class="accept-btn" onclick="acceptFriendRequest('${u}')">Aceptar</button>
                        <button class="reject-btn" onclick="rejectFriendRequest('${u}')">Rechazar</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

function updateOnlinePlayersList() {
    const container = document.getElementById('onlinePlayersContainer');
    if (!container) return;
    
    const onlinePlayers = Object.values(players).filter(p => 
        p.connectionId !== myConnectionId && 
        !friendsList.some(f => f.username === p.name)
    );
    
    if (onlinePlayers.length === 0) {
        container.innerHTML = '<div class="no-friends">No hay otros jugadores</div>';
    } else {
        container.innerHTML = onlinePlayers.map(p => `
            <div class="online-player-item">
                <span>${p.name}</span>
                <button onclick="sendFriendRequest('${p.name}')">Agregar</button>
            </div>
        `).join('');
    }
}

function sendFriendRequest(username) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("SendFriendRequest", username).catch(err => console.error(err));
    }
}

function sendFriendRequestFromInput() {
    const input = document.getElementById('addFriendInput');
    if (input && input.value.trim()) {
        sendFriendRequest(input.value.trim());
        input.value = '';
    }
}

function acceptFriendRequest(username) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("AcceptFriendRequest", username).catch(err => console.error(err));
        pendingRequests = pendingRequests.filter(u => u !== username);
        updateFriendsPanelData();
    }
}

function rejectFriendRequest(username) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("RejectFriendRequest", username).catch(err => console.error(err));
        pendingRequests = pendingRequests.filter(u => u !== username);
        updateFriendsPanelData();
    }
}

function openPrivateChat(friendUsername) {
    currentChatFriend = friendUsername;
    privateChatMessages = [];
    
    document.getElementById('chatFriendName').textContent = friendUsername;
    document.getElementById('friendsChatArea').style.display = 'flex';
    document.querySelector('.friends-sidebar').style.display = 'none';
    
    
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("GetPrivateMessages", friendUsername).catch(err => console.error(err));
    }
}

function closePrivateChat() {
    currentChatFriend = null;
    document.getElementById('friendsChatArea').style.display = 'none';
    document.querySelector('.friends-sidebar').style.display = 'flex';
}

function updatePrivateChatUI() {
    const container = document.getElementById('privateChatMessages');
    if (!container) return;
    
    container.innerHTML = privateChatMessages.map(m => `
        <div class="chat-message ${m.senderName === myPlayerName ? 'mine' : 'theirs'}">
            ${m.message}
        </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
}

function sendPrivateChatMessage() {
    const input = document.getElementById('privateChatInput');
    if (!input || !input.value.trim() || !currentChatFriend) return;
    
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("SendPrivateMessage", currentChatFriend, input.value.trim()).catch(err => console.error(err));
        input.value = '';
    }
}

function handlePrivateChatKey(event) {
    if (event.key === 'Enter') {
        sendPrivateChatMessage();
    }
}

function inviteFriendToHouse() {
    if (!currentChatFriend) return;
    
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("InviteToHouse", currentChatFriend).catch(err => console.error(err));
    }
}

function showHouseInviteModal(hostUsername) {
    const modal = document.createElement('div');
    modal.className = 'house-invite-modal';
    modal.innerHTML = `
        <div class="house-invite-overlay"></div>
        <div class="house-invite-box">
            <h3>${hostUsername} te invita a su casa</h3>
            <div class="house-invite-btns">
                <button class="accept" onclick="acceptHouseInvite('${hostUsername}', this)">Aceptar</button>
                <button class="reject" onclick="rejectHouseInvite('${hostUsername}', this)">Rechazar</button>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .house-invite-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .house-invite-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
        }
        .house-invite-box {
            position: relative;
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border: 3px solid #333;
        }
        .house-invite-box h3 {
            margin: 0 0 20px 0;
        }
        .house-invite-btns {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .house-invite-btns button {
            padding: 10px 25px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
        }
        .house-invite-btns .accept {
            background: #4CAF50;
            color: white;
        }
        .house-invite-btns .reject {
            background: #f44336;
            color: white;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);
}

function acceptHouseInvite(hostUsername, btn) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("AcceptHouseInvite", hostUsername).catch(err => console.error(err));
    }
    btn.closest('.house-invite-modal').remove();
}

function rejectHouseInvite(hostUsername, btn) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("RejectHouseInvite", hostUsername).catch(err => console.error(err));
    }
    btn.closest('.house-invite-modal').remove();
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'game-notification';
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 25px;
        border-radius: 8px;
        z-index: 3000;
        animation: notifSlide 0.3s ease;
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 3000);
}


function updatePlayerMenuData() {
    
    const nameEl = document.getElementById('menuPlayerName');
    if (nameEl) {
        nameEl.textContent = myPlayerName || 'Jugador';
    }
    
    
    const coinsEl = document.getElementById('menuPlayerCoins');
    if (coinsEl) {
        coinsEl.textContent = myCoins || 0;
    }
    
    
    const avatarEl = document.getElementById('menuPlayerAvatar');
    if (avatarEl) {
        const pType = myPenguinType || 'basico';
        const imgSrc = penguinImages[pType] ? penguinImages[pType].src : '/pinguino.png';
        avatarEl.innerHTML = `<img src="${imgSrc}" alt="pingüino">`;
    }
    
    
    const worldItems = document.querySelectorAll('.world-item');
    worldItems.forEach(item => {
        item.classList.remove('active');
        if (item.onclick && item.onclick.toString().includes(currentWorld)) {
            item.classList.add('active');
        }
    });
}


function travelToWorld(worldName) {
    if (worldName === currentWorld) {
        closePlayerMenu();
        return;
    }
    
    console.log(`Viajando a: ${worldName}`);
    
    
    closePlayerMenu();
    
    
    let actualWorld = worldName;
    if (worldName === 'casa') {
        actualWorld = `casa_${myPlayerName}`;
    }
    
    currentWorld = worldName; 
    
    
    if (myConnectionId && players[myConnectionId]) {
        let newX, newY;
        
        if (worldName === 'casa') {
            
            newX = HOME_WIDTH / 2;
            newY = HOME_HEIGHT / 2;
        } else {
            
            newX = 400;
            newY = 300;
        }
        
        players[myConnectionId].x = newX;
        players[myConnectionId].X = newX;
        players[myConnectionId].y = newY;
        players[myConnectionId].Y = newY;
        
        
        cameraX = 0;
        cameraY = 0;
        
        
        players[myConnectionId].world = actualWorld;
        
        
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            connection.invoke("ChangeWorld", actualWorld).catch(err => console.error(err));
            connection.invoke("Move", newX, newY).catch(err => console.error(err));
        }
    }
    
    render();
}


function updatePlayerSelect() {
    if (!playerSelectForInvite) return;
    
    playerSelectForInvite.innerHTML = '<option value="">-- Selecciona un jugador --</option>';
    
    Object.values(players).forEach(player => {
        
        if (player.connectionId !== myConnectionId) {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = `${player.name} (${player.penguinType})`;
            playerSelectForInvite.appendChild(option);
        }
    });
}


let exitColiseoBtn = null;
function showExitColiseoButton() {
    if (exitColiseoBtn) return;
    
    exitColiseoBtn = document.createElement('button');
    exitColiseoBtn.id = 'exitColiseoBtn';
    exitColiseoBtn.textContent = 'SALIR DEL COLISEO';
    exitColiseoBtn.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 40px;
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        z-index: 200;
        box-shadow: 0 5px 20px rgba(231, 76, 60, 0.5);
        text-transform: uppercase;
        letter-spacing: 2px;
        transition: transform 0.2s, box-shadow 0.2s;
    `;
    
    exitColiseoBtn.onmouseover = () => {
        exitColiseoBtn.style.transform = 'translateX(-50%) translateY(-3px)';
        exitColiseoBtn.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.6)';
    };
    exitColiseoBtn.onmouseout = () => {
        exitColiseoBtn.style.transform = 'translateX(-50%)';
        exitColiseoBtn.style.boxShadow = '0 5px 20px rgba(231, 76, 60, 0.5)';
    };
    
    exitColiseoBtn.onclick = () => {
        exitColiseo();
    };
    
    document.body.appendChild(exitColiseoBtn);
    
    
    showDuelAreaPanel();
}


function hideExitColiseoButton() {
    if (exitColiseoBtn) {
        exitColiseoBtn.remove();
        exitColiseoBtn = null;
    }
}


function prepareForDuel() {
    insideColiseo = false;
    hideExitColiseoButton();
    hideDuelAreaPanel();
}


function exitColiseo() {
    insideColiseo = false;
    
    
    hideExitColiseoButton();
    
    
    hideDuelAreaPanel();
    
    
    if (myConnectionId && players[myConnectionId]) {
        const newX = duelArenaX;
        const newY = duelArenaY + 250;  
        
        players[myConnectionId].x = newX;
        players[myConnectionId].X = newX;
        players[myConnectionId].y = newY;
        players[myConnectionId].Y = newY;
        
        
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            connection.invoke("Move", newX, newY).catch(err => console.error(err));
        }
    }
    
    console.log('🚪 Saliste del coliseo');
}


function showDuelAreaPanel() {
    if (!duelAreaPanel) {
        duelAreaPanel = document.createElement('div');
        duelAreaPanel.id = 'duelAreaPanel';
        duelAreaPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ffffff;
            border-radius: 16px;
            padding: 30px 40px;
            color: #333;
            text-align: center;
            z-index: 101;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            width: 320px;
            animation: fadeInScale 0.3s ease-out;
        `;
        duelAreaPanel.innerHTML = `
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #333; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">ÁREA DE DUELO</h3>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #666;">¿Qué deseas hacer?</p>
            <div style="display: flex; gap: 12px; flex-direction: column;">
                <button id="panelInviteBtn" style="padding: 14px 20px; background: linear-gradient(135deg, #4a9eff 0%, #2d7fd9 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s, box-shadow 0.2s;">INVITAR</button>
                <button id="panelDuelAutoBtn" style="padding: 14px 20px; background: linear-gradient(135deg, #4a9eff 0%, #2d7fd9 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s, box-shadow 0.2s;">PRÁCTICA</button>
                <button id="panelCloseBtn" style="padding: 14px 20px; background: #555; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s, box-shadow 0.2s;">CERRAR</button>
            </div>
        `;

        
        document.body.appendChild(duelAreaPanel);
        
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            #duelAreaPanel button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
            }
            #duelAreaPanel button:active {
                transform: translateY(0);
            }
            #panelCloseBtn:hover {
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
        
        
        document.getElementById('panelInviteBtn').addEventListener('click', () => {
            updatePlayerSelect();
            invitePlayerModal.style.display = 'flex';
            duelAreaPanel.style.display = 'none';
        });

        document.getElementById('panelDuelAutoBtn').addEventListener('click', async () => {
            if (!connection) return;
            
            
            insideColiseo = false;
            
            
            const exitBtn = document.getElementById('exitColiseoBtn');
            if (exitBtn) {
                exitBtn.remove();
            }
            exitColiseoBtn = null;
            
            
            if (duelAreaPanel) {
                duelAreaPanel.style.display = 'none';
            }
            
            try {
                await connection.invoke("StartDuelGame");
            } catch (err) {
                console.error("Error al iniciar duelo:", err);
                alert('Error al iniciar duelo');
            }
        });
        
        document.getElementById('panelCloseBtn').addEventListener('click', () => {
            exitColiseo();  
        });
    } else {
        duelAreaPanel.style.display = 'block';
    }
}


function hideDuelAreaPanel() {
    if (duelAreaPanel) {
        duelAreaPanel.style.display = 'none';
    }
}


function checkGunGameWinner() {
    if (myGunScore >= 2 || opponentGunScore >= 2) {
        const winner = myGunScore >= 2 ? 'Ganaste' : 'Perdiste';
        gunGameStatus.textContent = `${winner}!`;
        fireButton.disabled = true;
    }
}


function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}




async function requestAdminPanelData() {
    if (!connection) return;
    try {
        await connection.invoke("ObtenerDatosAdminActualizados");
    } catch (err) {
        console.error("Error al solicitar datos de admin:", err);
    }
}


function updateAdminPanel(adminData) {
    
    const activePlayersBody = document.getElementById('activePlayersBody');
    if (activePlayersBody) {
        activePlayersBody.innerHTML = '';
        if (adminData.ActivePlayers && Array.isArray(adminData.ActivePlayers)) {
            adminData.ActivePlayers.forEach(player => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 10px; border-bottom: 1px solid rgba(102, 126, 234, 0.2);">${player.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(102, 126, 234, 0.2);">${player.ip || 'N/A'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(102, 126, 234, 0.2); text-align: center;">
                        <button onclick="banPlayerIP('${player.ip}', '${player.name}')" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Banear IP</button>
                        <button onclick="suspendPlayer('${player.name}')" style="padding: 5px 10px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 5px;">Suspender</button>
                        <button onclick="mutePlayer('${player.connectionId}')" style="padding: 5px 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 5px;">Mutear</button>
                    </td>
                `;
                activePlayersBody.appendChild(row);
            });
        }
        document.getElementById('activePlayersCount').textContent = adminData.ActivePlayers?.length || 0;
    }

    
    const bannedIPsBody = document.getElementById('bannedIPsBody');
    if (bannedIPsBody) {
        bannedIPsBody.innerHTML = '';
        if (adminData.BannedIPs && Array.isArray(adminData.BannedIPs)) {
            adminData.BannedIPs.forEach(ban => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 10px; border-bottom: 1px solid rgba(231, 76, 60, 0.2);">${ban.ip}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(231, 76, 60, 0.2);">${ban.razon || 'Sin razón'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(231, 76, 60, 0.2);">${ban.adminBan || 'Admin'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(231, 76, 60, 0.2); text-align: center;">
                        <button onclick="unbanIP('${ban.ip}')" style="padding: 5px 10px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Desbanear</button>
                    </td>
                `;
                bannedIPsBody.appendChild(row);
            });
        }
        document.getElementById('bannedIPsCount').textContent = adminData.BannedIPs?.length || 0;
    }

    
    const suspendedAccountsBody = document.getElementById('suspendedAccountsBody');
    if (suspendedAccountsBody) {
        suspendedAccountsBody.innerHTML = '';
        if (adminData.SuspendedAccounts && Array.isArray(adminData.SuspendedAccounts)) {
            adminData.SuspendedAccounts.forEach(account => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 10px; border-bottom: 1px solid rgba(243, 156, 18, 0.2);">${account.nombreUsuario}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(243, 156, 18, 0.2);">${account.razon || 'Sin razón'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(243, 156, 18, 0.2);">${account.estado || 'Suspendida'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(243, 156, 18, 0.2); text-align: center;">
                        ${account.estado === 'Suspendida' ? 
                            `<button onclick="deleteAccount('${account.nombreUsuario}')" style="padding: 5px 10px; background: #c0392b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Eliminar</button>` :
                            '<span>Eliminada</span>'
                        }
                    </td>
                `;
                suspendedAccountsBody.appendChild(row);
            });
        }
        document.getElementById('suspendedAccountsCount').textContent = adminData.SuspendedAccounts?.length || 0;
    }

    
    const mutedUsersBody = document.getElementById('mutedUsersBody');
    if (mutedUsersBody) {
        mutedUsersBody.innerHTML = '';
        if (adminData.MutedUsers && Array.isArray(adminData.MutedUsers)) {
            adminData.MutedUsers.forEach(mute => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 10px; border-bottom: 1px solid rgba(52, 152, 219, 0.2);">${mute.usuario}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(52, 152, 219, 0.2);">${mute.tiempoRestante || 'Expirado'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(52, 152, 219, 0.2);">${mute.razon || 'Sin razón'}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(52, 152, 219, 0.2); text-align: center;">
                        <button onclick="unmuteUser('${mute.connectionId}')" style="padding: 5px 10px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Desmuteador</button>
                    </td>
                `;
                mutedUsersBody.appendChild(row);
            });
        }
        document.getElementById('mutedUsersCount').textContent = adminData.MutedUsers?.length || 0;
    }
}


async function executeAdminAction(methodName, ...args) {
    if (!connection) return;
    try {
        await connection.invoke(methodName, ...args);
        
        setTimeout(() => requestAdminPanelData(), 500);
    } catch (err) {
        console.error(`Error al ejecutar ${methodName}:`, err);
        alert("Error: " + err.message);
    }
}


function banPlayerIP(ip, playerName) {
    const razon = prompt(`¿Por qué banear a ${playerName} (${ip})?`);
    if (razon) {
        executeAdminAction("BanearIP", ip, razon);
    }
}

function unbanIP(ip) {
    if (confirm(`¿Desbanear ${ip}?`)) {
        executeAdminAction("DeBanearIP", ip);
    }
}

function suspendPlayer(playerName) {
    const razon = prompt(`¿Por qué suspender a ${playerName}?`);
    if (razon) {
        executeAdminAction("SuspenderCuenta", playerName, razon);
    }
}

function deleteAccount(playerName) {
    if (confirm(`¿Eliminar cuenta de ${playerName}? ¡Esta acción no se puede deshacer!`)) {
        const razon = prompt("¿Por qué eliminar esta cuenta?");
        if (razon) {
            executeAdminAction("EliminarCuenta", playerName, razon);
        }
    }
}

function mutePlayer(connectionId) {
    const durationStr = prompt("¿Cuántos minutos de mute?", "5");
    if (durationStr) {
        const duration = parseInt(durationStr);
        if (!isNaN(duration) && duration > 0) {
            const razon = prompt("¿Por qué mutearlo?");
            if (razon) {
                executeAdminAction("MutearUsuario", connectionId, duration, razon);
            }
        } else {
            alert("Ingresa una duración válida en minutos");
        }
    }
}

function unmuteUser(connectionId) {
    if (confirm("¿Desmuteador?")) {
        executeAdminAction("DesmutearUsuario", connectionId);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const exitAdminBtn = document.getElementById('exitAdminBtn');
    const refreshAdminDataBtn = document.getElementById('refreshAdminDataBtn');
    
    if (exitAdminBtn) {
        exitAdminBtn.addEventListener('click', () => {
            
            localStorage.removeItem('isAdminMode');
            localStorage.removeItem('adminPassword');
            window.location.href = '/menu.html';
        });
    }
    
    if (refreshAdminDataBtn) {
        refreshAdminDataBtn.addEventListener('click', () => {
            requestAdminPanelData();
        });
    }
});






function toggleShop() {
    if (shopOpen) {
        closeShop();
    } else {
        openShop();
    }
}


function openShop() {
    shopOpen = true;
    
    const existingShop = document.getElementById('shopPanel');
    if (existingShop) existingShop.remove();
    
    const shopPanel = document.createElement('div');
    shopPanel.id = 'shopPanel';
    shopPanel.innerHTML = `
        <div class="shop-overlay" onclick="closeShop()"></div>
        <div class="shop-content">
            <div class="shop-header">
                <h2>TIENDA</h2>
                <div class="shop-coins-display">
                    <img src="/moneda.png" alt="coins" class="shop-coin-icon">
                    <span id="shopCoins">${myCoins}</span>
                </div>
                <button class="shop-close-btn" onclick="closeShop()">×</button>
            </div>
            
            <div class="shop-grid" id="shopGrid">
                ${SHOP_CHARACTERS.map(char => `
                    <div class="shop-card ${ownedCharacters.includes(char.id) ? 'owned' : ''}" data-id="${char.id}">
                        <img src="${char.image}" alt="${char.name}" class="shop-card-img">
                        <div class="shop-card-name">${char.name}</div>
                        <div class="shop-card-price">
                            ${ownedCharacters.includes(char.id) ? 
                                '<span class="shop-owned-text">✓ COMPRADO</span>' : 
                                `<img src="/moneda.png" class="shop-price-icon"> ${char.price}`
                            }
                        </div>
                        ${!ownedCharacters.includes(char.id) ? 
                            `<button class="shop-btn-buy" onclick="buyCharacter('${char.id}')">COMPRAR</button>` : 
                            `<button class="shop-btn-equip" onclick="equipCharacter('${char.id}')">EQUIPAR</button>`
                        }
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.id = 'shopStyles';
    if (!document.getElementById('shopStyles')) {
        style.textContent = `
            #shopPanel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .shop-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
            }
            .shop-content {
                position: relative;
                background: #fff;
                border-radius: 16px;
                padding: 0;
                max-width: 700px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }
            .shop-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 25px;
                border-bottom: 1px solid #eee;
            }
            .shop-header h2 {
                color: #333;
                font-size: 22px;
                margin: 0;
                font-weight: 600;
            }
            .shop-coins-display {
                display: flex;
                align-items: center;
                gap: 6px;
                background: #f5f5f5;
                padding: 8px 14px;
                border-radius: 20px;
            }
            .shop-coins-display span {
                color: #333;
                font-size: 16px;
                font-weight: bold;
            }
            .shop-coin-icon {
                width: 20px;
                height: 20px;
            }
            .shop-close-btn {
                background: #eee;
                border: none;
                font-size: 20px;
                color: #666;
                cursor: pointer;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .shop-close-btn:hover {
                background: #ddd;
            }
            .shop-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 15px;
                padding: 20px;
                max-height: calc(80vh - 80px);
                overflow-y: auto;
            }
            .shop-card {
                background: #fafafa;
                border: 2px solid #eee;
                border-radius: 12px;
                padding: 15px;
                text-align: center;
                transition: all 0.2s;
            }
            .shop-card:hover {
                border-color: #4CAF50;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .shop-card.owned {
                border-color: #4CAF50;
                background: #f0fff0;
            }
            .shop-card-img {
                width: 60px;
                height: 60px;
                object-fit: contain;
                margin-bottom: 10px;
            }
            .shop-card-name {
                color: #333;
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 5px;
            }
            .shop-card-price {
                color: #666;
                font-size: 12px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
            }
            .shop-price-icon {
                width: 14px;
                height: 14px;
            }
            .shop-owned-text {
                color: #4CAF50;
                font-weight: bold;
                font-size: 11px;
            }
            .shop-btn-buy {
                background: #333;
                color: #fff;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
                transition: all 0.2s;
            }
            .shop-btn-buy:hover {
                background: #444;
            }
            .shop-btn-equip {
                background: #4CAF50;
                color: #fff;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
                transition: all 0.2s;
            }
            .shop-btn-equip:hover {
                background: #45a049;
            }
            
            /* Animación de compra con confeti */
            #purchaseAnimation {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 3000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.9);
            }
            .purchase-character {
                width: 180px;
                height: 180px;
                animation: characterBounce 0.5s ease infinite alternate;
            }
            @keyframes characterBounce {
                from { transform: scale(1) rotate(-5deg); }
                to { transform: scale(1.1) rotate(5deg); }
            }
            .purchase-title {
                color: #ffd700;
                font-size: 32px;
                font-weight: bold;
                margin-top: 20px;
                text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            }
            .purchase-buttons {
                margin-top: 30px;
                display: flex;
                gap: 20px;
            }
            .purchase-buttons button {
                padding: 15px 35px;
                font-size: 16px;
                font-weight: bold;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-equip {
                background: linear-gradient(135deg, #00ff00, #00aa00);
                color: #fff;
            }
            .btn-close {
                background: #444;
                color: #fff;
            }
            .purchase-buttons button:hover {
                transform: scale(1.1);
            }
            
            /* Confeti */
            .confetti {
                position: fixed;
                width: 10px;
                height: 10px;
                top: -10px;
                z-index: 3001;
                animation: confettiFall 3s linear forwards;
            }
            @keyframes confettiFall {
                to {
                    top: 100vh;
                    transform: rotate(720deg);
                }
            }
            
            @media (max-width: 600px) {
                .shop-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                .shop-card-img {
                    width: 50px;
                    height: 50px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(shopPanel);
}


function closeShop() {
    shopOpen = false;
    const shopPanel = document.getElementById('shopPanel');
    if (shopPanel) shopPanel.remove();
}


function buyCharacter(characterId) {
    const character = SHOP_CHARACTERS.find(c => c.id === characterId);
    if (!character) return;
    
    if (ownedCharacters.includes(characterId)) {
        showNotification('Ya tienes este personaje');
        return;
    }
    
    if (myCoins < character.price) {
        showNotification(`No tienes suficientes monedas (necesitas ${character.price})`);
        return;
    }
    
    
    myCoins -= character.price;
    updateCoinsDisplay();
    saveCoinsToServer(myCoins);
    
    
    ownedCharacters.push(characterId);
    localStorage.setItem('ownedCharacters', JSON.stringify(ownedCharacters));
    
    
    closeShop();
    showPurchaseAnimation(character);
}


function showPurchaseAnimation(character) {
    purchaseAnimationActive = true;
    
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 50);
    }
    
    const animDiv = document.createElement('div');
    animDiv.id = 'purchaseAnimation';
    animDiv.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="purchase-character">
        <div class="purchase-title">🎉 ¡${character.name} DESBLOQUEADO! 🎉</div>
        <div class="purchase-buttons">
            <button class="btn-equip" onclick="equipFromPurchase('${character.id}')">EQUIPAR AHORA</button>
            <button class="btn-close" onclick="closePurchaseAnimation()">CERRAR</button>
        </div>
    `;
    
    document.body.appendChild(animDiv);
}


function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700'];
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.width = (Math.random() * 10 + 5) + 'px';
    confetti.style.height = confetti.style.width;
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3000);
}


function closePurchaseAnimation() {
    purchaseAnimationActive = false;
    const animDiv = document.getElementById('purchaseAnimation');
    if (animDiv) animDiv.remove();
    
    
    document.querySelectorAll('.confetti').forEach(c => c.remove());
}


function equipFromPurchase(characterId) {
    equipCharacter(characterId);
    closePurchaseAnimation();
}


function equipCharacter(characterId) {
    if (!ownedCharacters.includes(characterId) && characterId !== 'basico' && characterId !== 'chino') {
        showNotification('No tienes este personaje');
        return;
    }
    
    
    myPenguinType = characterId;
    localStorage.setItem('penguinType', characterId);
    
    
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("ChangePenguinType", characterId).catch(err => console.error(err));
    }
    
    
    if (players[myConnectionId]) {
        players[myConnectionId].penguinType = characterId;
        players[myConnectionId].PenguinType = characterId;
    }
    
    showNotification(`Personaje cambiado a ${characterId}`);
    closeShop();
}


function goToMenu() {
    if (confirm('¿Seguro que quieres volver al menú?')) {
        window.location.href = '/menu.html';
    }
}






function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}


gameLoop();