<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clean Park Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .drag-item { cursor: grab; transition: transform 0.2s; }
        .drag-item:active { cursor: grabbing; }
        .bin { transition: transform 0.2s; }
        .bin:hover { transform: scale(1.05); }
    </style>
</head>
<body class="bg-gradient-to-b from-amber-100 via-orange-50 to-green-100 min-h-screen overflow-hidden">

    <div id="game-container"></div>

    <script>
        const initialItems = [
            { id: 1, type: 'wet', name: 'Banana Peel', emoji: '🍌', pos: 'top: 45%; left: 15%;' },
            { id: 2, type: 'dry', name: 'Plastic Bottle', emoji: '🍾', pos: 'top: 60%; left: 35%;' },
            { id: 3, type: 'wet', name: 'Apple Core', emoji: '🍎', pos: 'top: 50%; left: 55%;' },
            { id: 4, type: 'dry', name: 'Paper Cup', emoji: '🥤', pos: 'top: 55%; left: 70%;' },
            { id: 5, type: 'wet', name: 'Orange Peel', emoji: '🍊', pos: 'top: 70%; left: 25%;' },
            { id: 6, type: 'dry', name: 'Plastic Bag', emoji: '🛍️', pos: 'top: 45%; left: 80%;' },
            { id: 7, type: 'wet', name: 'Vegetable Scraps', emoji: '🥬', pos: 'top: 75%; left: 45%;' },
            { id: 8, type: 'dry', name: 'Soda Can', emoji: '🥫', pos: 'top: 40%; left: 60%;' },
            { id: 9, type: 'wet', name: 'Tea Leaves', emoji: '🍵', pos: 'top: 55%; left: 10%;' },
            { id: 10, type: 'dry', name: 'Cardboard', emoji: '📦', pos: 'top: 65%; left: 85%;' },
        ];

        let state = {
            screen: 'menu',
            score: 0,
            items: [],
            correct: 0,
            wrong: 0
        };

        function render() {
            const container = document.getElementById('game-container');
            const health = Math.floor(((initialItems.length - state.items.length) / initialItems.length) * 100);
            
            if (state.screen === 'menu') {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center min-h-screen p-8">
                        <div class="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl text-center border-8 border-orange-400">
                            <h1 class="text-6xl font-bold mb-4 text-green-600">Clean Park</h1>
                            <button onclick="startGame()" class="bg-green-500 text-white px-12 py-4 rounded-full text-2xl font-bold hover:bg-green-600">Start Playing</button>
                        </div>
                    </div>`;
            } else if (state.screen === 'playing') {
                container.innerHTML = `
                    <div class="p-6">
                        <div class="flex justify-between bg-white p-4 rounded-xl shadow-lg mb-6">
                            <div>Score: ${state.score} | Health: ${health}%</div>
                            <button onclick="reset()" class="bg-red-500 text-white px-4 py-2 rounded">Exit</button>
                        </div>
                        <div class="grid grid-cols-12 gap-6 h-[70vh]">
                            <div class="col-span-2 bg-amber-200 rounded-3xl flex flex-col items-center justify-center text-8xl">${health === 100 ? '😊' : health > 40 ? '😐' : '😷'}</div>
                            <div id="park" class="col-span-8 bg-green-200 rounded-3xl relative border-4 border-green-400">
                                ${state.items.map(i => `<div draggable="true" ondragstart="onDrag(event, ${i.id})" class="absolute bg-white rounded-full p-3 shadow-lg" style="${i.pos}">${i.emoji}</div>`).join('')}
                            </div>
                            <div class="col-span-2 flex flex-col gap-4">
                                <div ondragover="event.preventDefault()" ondrop="onDrop('wet')" class="bin flex-1 bg-green-500 text-white flex items-center justify-center rounded-2xl">Wet Waste</div>
                                <div ondragover="event.preventDefault()" ondrop="onDrop('dry')" class="bin flex-1 bg-blue-500 text-white flex items-center justify-center rounded-2xl">Dry Waste</div>
                            </div>
                        </div>
                    </div>`;
            }
        }

        function startGame() { state.screen = 'playing'; state.items = [...initialItems]; render(); }
        function reset() { state = { screen: 'menu', score: 0, items: [], correct: 0, wrong: 0 }; render(); }
        
        let draggedId = null;
        function onDrag(e, id) { draggedId = id; }
        
        function onDrop(type) {
            const item = state.items.find(i => i.id === draggedId);
            if (item.type === type) {
                state.items = state.items.filter(i => i.id !== draggedId);
                state.score += 10;
                if (state.items.length === 0) state.screen = 'menu'; // Simplified completion
            } else {
                state.score = Math.max(0, state.score - 5);
            }
            render();
        }

        render();
    </script>
</body>
</html>
