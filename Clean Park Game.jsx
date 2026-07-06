import { Leaf, Trash2, Heart, RotateCcw, Play, LogOut } from 'lucide-react';

const CleanParkGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [correctDrops, setCorrectDrops] = useState(0);
  const [wrongDrops, setWrongDrops] = useState(0);
  const [hasStartedDragging, setHasStartedDragging] = useState(false);

  // Waste items with positions and types
  const initialItems = [
    { id: 1, type: 'wet', name: 'Banana Peel', emoji: '🍌', left: '15%', top: '45%' },
    { id: 2, type: 'dry', name: 'Plastic Bottle', emoji: '🍾', left: '35%', top: '60%' },
    { id: 3, type: 'wet', name: 'Apple Core', emoji: '🍎', left: '55%', top: '50%' },
    { id: 4, type: 'dry', name: 'Paper Cup', emoji: '🥤', left: '70%', top: '55%' },
    { id: 5, type: 'wet', name: 'Orange Peel', emoji: '🍊', left: '25%', top: '70%' },
    { id: 6, type: 'dry', name: 'Plastic Bag', emoji: '🛍️', left: '80%', top: '45%' },
    { id: 7, type: 'wet', name: 'Vegetable Scraps', emoji: '🥬', left: '45%', top: '75%' },
    { id: 8, type: 'dry', name: 'Soda Can', emoji: '🥫', left: '60%', top: '40%' },
    { id: 9, type: 'wet', name: 'Tea Leaves', emoji: '🍵', left: '10%', top: '55%' },
    { id: 10, type: 'dry', name: 'Cardboard', emoji: '📦', left: '85%', top: '65%' },
  ];

  useEffect(() => {
    if (gameState === 'playing' && items.length === 0) {
      setItems(initialItems);
    }
  }, [gameState]);

  useEffect(() => {
    const totalItems = initialItems.length;
    const collected = totalItems - items.length;
    const newHealth = Math.floor((collected / totalItems) * 100);
    setHealth(newHealth);

    if (items.length === 0 && gameState === 'playing') {
      setTimeout(() => setGameState('completed'), 1000);
    }
  }, [items, gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(0);
    setCorrectDrops(0);
    setWrongDrops(0);
    setItems(initialItems);
    setHasStartedDragging(false);
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
    setHasStartedDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (binType) => {
    if (!draggedItem) return;

    if (draggedItem.type === binType) {
      setItems(items.filter(item => item.id !== draggedItem.id));
      setScore(score + 10);
      setCorrectDrops(correctDrops + 1);
    } else {
      setScore(Math.max(0, score - 5));
      setWrongDrops(wrongDrops + 1);
    }
    setDraggedItem(null);
  };

  const logout = () => {
    setGameState('menu');
    setScore(0);
    setHealth(0);
    setItems([]);
    setCorrectDrops(0);
    setWrongDrops(0);
  };

  // Character expressions based on health
  const getCharacterExpression = () => {
    if (health === 100) return '😊';
    if (health > 70) return '🙂';
    if (health > 40) return '😐';
    if (health > 20) return '😷';
    return '🤢';
  };

  const getCoughIntensity = () => {
    if (health >= 100) return '';
    if (health > 70) return 'light';
    if (health > 40) return 'moderate';
    return 'heavy';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-green-100 relative overflow-hidden">
      {/* Decorative clouds */}
      <div className="absolute top-10 left-10 text-6xl opacity-70">☁️</div>
      <div className="absolute top-20 right-20 text-5xl opacity-60">☁️</div>
      <div className="absolute top-32 left-1/3 text-4xl opacity-50">☁️</div>

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl text-center border-8 border-orange-400">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              Clean Park
            </h1>
            <p className="text-2xl text-gray-700 mb-8">A Civic Sense Adventure</p>
            
            <div className="mb-8 text-5xl">🏞️🌿</div>
            
            <div className="bg-gradient-to-r from-orange-100 to-green-100 rounded-2xl p-6 mb-8">
              <p className="text-lg text-gray-800 leading-relaxed">
                Help clean the park by sorting waste correctly!<br/>
                <span className="font-bold text-green-600">🟢 Green Bin</span> for wet/organic waste<br/>
                <span className="font-bold text-blue-600">🔵 Blue Bin</span> for dry/recyclable waste<br/>
                <span className="text-orange-600">Help the person breathe again!</span>
              </p>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-3 mx-auto"
            >
              <Play className="w-8 h-8" />
              Start Playing
            </button>
          </div>
        </div>
      )}

      {/* Game Screen */}
      {gameState === 'playing' && (
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xl shadow-md">
                Score: {score}
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-red-400 to-pink-400 px-6 py-3 rounded-xl text-white font-bold shadow-md">
                <Heart className="w-5 h-5" />
                Health: {health}%
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <LogOut className="w-5 h-5" />
              Exit
            </button>
          </div>

          {/* Main Game Area */}
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-150px)]">
            {/* Character Section */}
            <div className="col-span-2 bg-gradient-to-b from-amber-200 to-amber-300 rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center border-4 border-orange-300">
              <div className="text-8xl mb-4 animate-pulse">{getCharacterExpression()}</div>
              {getCoughIntensity() && (
                <div className={`text-2xl ${getCoughIntensity() === 'heavy' ? 'animate-bounce' : 'animate-pulse'}`}>
                  {getCoughIntensity() === 'heavy' && '*Cough* *Cough*'}
                  {getCoughIntensity() === 'moderate' && '*Cough*'}
                  {getCoughIntensity() === 'light' && '*ahem*'}
                </div>
              )}
              <div className="mt-4 text-center">
                <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                  <p className="text-sm font-bold text-gray-700">
                    {health === 100 ? '😊 Healthy!' : health > 50 ? '😌 Getting Better' : '😷 Help Me!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Park Area */}
            <div className="col-span-8 bg-gradient-to-b from-green-300 via-green-200 to-green-300 rounded-3xl shadow-xl relative overflow-hidden border-4 border-green-400">
              {/* Decorative trees */}
              <div className="absolute bottom-0 left-5 text-6xl">🌳</div>
              <div className="absolute bottom-0 right-5 text-6xl">🌳</div>
              <div className="absolute top-5 left-1/4 text-5xl">🌸</div>
              <div className="absolute top-5 right-1/4 text-5xl">🌺</div>
              
              {/* Waste Items */}
              {items.map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  style={{ left: item.left, top: item.top }}
                  className="absolute cursor-grab active:cursor-grabbing transform hover:scale-110 transition-transform"
                >
                  <div className="bg-white rounded-full p-3 shadow-xl border-4 border-gray-300 hover:border-orange-400">
                    <div className="text-4xl">{item.emoji}</div>
                  </div>
                </div>
              ))}

              {/* Instructions */}
              {items.length > 0 && !hasStartedDragging && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-2xl p-6 shadow-lg text-center">
                  <p className="text-2xl font-bold text-gray-800 mb-2">🎯 Drag & Drop!</p>
                  <p className="text-lg text-gray-600">Sort the waste into correct bins</p>
                </div>
              )}

              {items.length === 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-8xl mb-4">✨</div>
                  <p className="text-4xl font-bold text-green-700">Clean & Green!</p>
                </div>
              )}
            </div>

            {/* Bins Section */}
            <div className="col-span-2 flex flex-col gap-6">
              {/* Green Bin (Wet Waste) */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('wet')}
                className="flex-1 bg-gradient-to-b from-green-500 to-green-600 rounded-3xl shadow-xl border-4 border-green-700 flex flex-col items-center justify-center p-6 hover:scale-105 transition-transform"
              >
                <Leaf className="w-16 h-16 text-white mb-3" />
                <div className="text-6xl mb-3">🟢</div>
                <p className="text-white font-bold text-lg text-center">WET WASTE</p>
                <p className="text-green-100 text-sm text-center mt-2">Organic</p>
              </div>

              {/* Blue Bin (Dry Waste) */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('dry')}
                className="flex-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-3xl shadow-xl border-4 border-blue-700 flex flex-col items-center justify-center p-6 hover:scale-105 transition-transform"
              >
                <Trash2 className="w-16 h-16 text-white mb-3" />
                <div className="text-6xl mb-3">🔵</div>
                <p className="text-white font-bold text-lg text-center">DRY WASTE</p>
                <p className="text-blue-100 text-sm text-center mt-2">Recyclable</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Screen */}
      {gameState === 'completed' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl text-center border-8 border-green-400">
            <div className="text-9xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Park Cleaned!
            </h2>
            <p className="text-3xl text-gray-700 mb-8">The person can breathe again! 😊</p>
            
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8 mb-8">
              <div className="text-6xl mb-4">😊🌿</div>
              <p className="text-3xl font-bold text-green-600 mb-4">Final Score: {score}</p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-green-600 font-bold text-lg">✅ Correct: {correctDrops}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-red-600 font-bold text-lg">❌ Wrong: {wrongDrops}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-3"
              >
                <RotateCcw className="w-6 h-6" />
                Play Again
              </button>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-3"
              >
                <LogOut className="w-6 h-6" />
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanParkGame;
