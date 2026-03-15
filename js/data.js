'use strict';

const LEVELS = [
  { id:0, name:'Principiante', icon:'🌱', time:null, ingCount:2, rounds:3, extraWrong:2, scorePerPizza:100 },
  { id:1, name:'Intermedio',   icon:'🍕', time:60,   ingCount:3, rounds:3, extraWrong:3, scorePerPizza:150 },
  { id:2, name:'Avanzado',     icon:'🔥', time:45,   ingCount:4, rounds:3, extraWrong:4, scorePerPizza:200 },
  { id:3, name:'Experto',      icon:'👑', time:30,   ingCount:5, rounds:4, extraWrong:5, scorePerPizza:300 },
];

const INGREDIENTS = [
  { id:'tomato',        emoji:'🍅',  name:'Tomate',           isBase:true,  svgType:'sauce'         },
  { id:'tomato_slice',  emoji:'🍅',  name:'Tomate en loncha', isBase:false, svgType:'tomato_slice'  },
  { id:'cheese',        emoji:'🧀',  name:'Queso',            isBase:true,  svgType:'cheese'        },
  { id:'cheese_grated', emoji:'🧀',  name:'Queso rallado',    isBase:false, svgType:'cheese_grated' },
  { id:'pepper',        emoji:'🫑',  name:'Pimiento',         isBase:false, svgType:'topping'       },
  { id:'mushroom',      emoji:'🍄',  name:'Champiñón',        isBase:false, svgType:'topping'       },
  { id:'onion',         emoji:'🧅',  name:'Cebolla',          isBase:false, svgType:'topping'       },
  { id:'olive',         emoji:'🫒',  name:'Aceituna',         isBase:false, svgType:'topping'       },
  { id:'meat',          emoji:'🥩',  name:'Carne',            isBase:false, svgType:'topping'       },
  { id:'corn',          emoji:'🌽',  name:'Maíz',             isBase:false, svgType:'topping'       },
  { id:'ham',           emoji:'🍖',  name:'Jamón',            isBase:false, svgType:'topping'       },
  { id:'oregano',       emoji:'🫙',  name:'Orégano',          isBase:false, svgType:'topping'       },
  { id:'chili',         emoji:'🌶️', name:'Chile',            isBase:false, svgType:'topping'       },
  { id:'anchovy',       emoji:'🐟',  name:'Anchoa',           isBase:false, svgType:'topping'       },
  { id:'basil',         emoji:'🌿',  name:'Albahaca',         isBase:false, svgType:'topping'       },
  { id:'pineapple',     emoji:'🍍',  name:'Piña',             isBase:false, svgType:'topping'       },
];

const CHARACTERS = [
  { emoji:'👦', name:'Marco', role:'Chef Aventurero',     desc:'¡Le encanta la pizza!' },
  { emoji:'👧', name:'Sofía', role:'Chef Creativa',       desc:'¡Ama las pizzas dulces!' },
  { emoji:'🧒', name:'Leo',   role:'Chef Picante',        desc:'¡El rey de las especias!' },
  { emoji:'👩', name:'Luna',  role:'Chef Perfeccionista', desc:'¡Pizza = felicidad!' },
  { emoji:'🧑‍🍳', name:'Suso', role:'Chef Ingenioso',      desc:'¡Maestro de los toppings locos!' },
];

const FEEDBACK = {
  correctIng:      ['¡Perfecto! {emoji}','¡Genial! {name} añadida 🎉','¡Así se hace! {emoji}','¡Qué delicia! {name} 😋'],
  wrongIng:        ['❌ ¡Ese no va ahí!','❌ ¡Incorrecto! -10 pts','❌ ¡Eso no es para esta pizza!','❌ ¡Ups! Ese no toca'],
  ovenMessages:    ['¡Calentando el horno! 🔥','¡El queso está burbujeando! 🧀','¡Huele delicioso! 😍','¡Casi lista! ⏰','¡Lista para salir! 🍕'],
  roundComplete:   ['🍕 ¡Pizza perfecta! ¡Siguiente!','⭐ ¡Increíble! ¡A por otra!','🔥 ¡Eres un genio!','👨‍🍳 ¡El cliente está feliz!'],
  cutInstructions: '✂️ ¡Arrastra el cuchillo para cortar la pizza!',
  cutDone:         '🔪 ¡Cortada en {slices} porciones! ¡A servir!',
  timeUp:          '⏰ ¡Se acabó el tiempo!',
  alreadyAdded:    '¡Ya pusiste ese ingrediente! 😅',
};

const RESULTS = [
  { min:0.85, emoji:'🏆', title:'¡MAESTRO PIZZERO!',   stars:'⭐⭐⭐⭐⭐' },
  { min:0.65, emoji:'🎉', title:'¡Muy bien chef!',      stars:'⭐⭐⭐⭐'   },
  { min:0.45, emoji:'😊', title:'¡Buen trabajo!',       stars:'⭐⭐⭐'     },
  { min:0.25, emoji:'🙂', title:'¡Sigue practicando!',  stars:'⭐⭐'       },
  { min:0,    emoji:'😅', title:'¡La próxima mejor!',   stars:'⭐'         },
];

const CONFETTI_COLORS = ['#F72585','#FFD166','#52B788','#48CAE4','#F4A261','#9B5DE5','#E63946','#06D6A0'];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function randomFrom(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function formatPhrase(tpl, ctx={}) { return tpl.replace(/\{(\w+)\}/g,(_,k)=>ctx[k]||''); }