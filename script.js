// ===== Persistent state & history =====
const STORAGE_KEY = "smarter5_pro_state_v3_5";
const UNDO_KEY = STORAGE_KEY + "_undo";
const REDO_KEY = STORAGE_KEY + "_redo";
let state = { teams: [], currentTeamIndex: null, globalUsed:{} };
let undoStack = [];
let redoStack = [];
const clone = o => JSON.parse(JSON.stringify(o));

function persistStacks(){ localStorage.setItem(UNDO_KEY, JSON.stringify(undoStack)); localStorage.setItem(REDO_KEY, JSON.stringify(redoStack)); }
function loadStacks(){ try{ undoStack = JSON.parse(localStorage.getItem(UNDO_KEY)||"[]"); redoStack = JSON.parse(localStorage.getItem(REDO_KEY)||"[]"); }catch(e){ undoStack=[]; redoStack=[]; } }

function saveState(push=true){
  if(push){ undoStack.push(clone(state)); redoStack.length=0; persistStacks(); }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadState(){
  try{ const raw=localStorage.getItem(STORAGE_KEY); if(raw) state=JSON.parse(raw);}catch(e){}
  loadStacks();
  ensureTeamColors();
}
function undo(){ if(!undoStack.length) return; redoStack.push(clone(state)); state=undoStack.pop(); persistStacks(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); location.reload(); }
function redo(){ if(!redoStack.length) return; undoStack.push(clone(state)); state=redoStack.pop(); persistStacks(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); location.reload(); }
loadState();

// ===== Money ladder & safe zones =====
const MONEY = [0,1000,2000,5000,10000,25000,50000,100000,175000,300000,500000,1000000];
const SAFE_INDEXES = [1,5];
const fmtMoney = idx => '$'+MONEY[idx].toLocaleString();

// ===== Team colors =====
const TEAM_COLOR_OPTIONS = [
  { label: 'Default', value: '#0f8a50' },
  { label: 'Gold', value: '#f5b000' },
  { label: 'Blue', value: '#3498db' },
  { label: 'Red', value: '#e74c3c' },
  { label: 'Purple', value: '#9b59b6' },
  { label: 'Teal', value: '#1abc9c' }
];
const DEFAULT_TEAM_COLOR = TEAM_COLOR_OPTIONS[0].value;

function pickTeamColor(index){
  return DEFAULT_TEAM_COLOR;
}

function getTextColor(bg){
  if(!bg || bg[0] !== '#') return '#fff';
  const r = parseInt(bg.slice(1,3), 16);
  const g = parseInt(bg.slice(3,5), 16);
  const b = parseInt(bg.slice(5,7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111' : '#fff';
}

function ensureTeamColors(){
  let changed = false;
  (state.teams||[]).forEach((t,i)=>{
    if(!t.color){
      t.color = pickTeamColor(i);
      changed = true;
    }
  });
  if(changed){ saveState(false); }
}

// ===== Expanded question bank (sample) =====
let questionBank = {
  Math: [
    // Grade 1
    {grade:1,q:"What is 7 + 5?",a:"12"},
    {grade:1,q:"If you have 3 apples and get 2 more, how many do you have?",a:"5"},
    {grade:1,q:"What number comes after 19?",a:"20"},
    {grade:1,q:"Which is bigger: 9 or 6?",a:"9"},
    {grade:1,q:"How many sides does a square have?",a:"4"},
    {grade:1,q:"True or False: 5 is an even number.",a:"False"},
    {grade:1,q:"What is 10 − 7?",a:"3"},
    {grade:1,q:"Fill in the blank: 2 + __ = 8",a:"6"},
    {grade:1,q:"What shape has 3 corners and 3 sides?",a:"Triangle"},
    {grade:1,q:"One dime is worth how many cents?",a:"10"},
    // From the game:
    {grade:1,q:"Bob bought four bags of oranges. Each bag had ten oranges. How many oranges did Bob buy in all?",a:"40 Oranges"},
    {grade:1,q:"I have no sides. I have no corners. I have on angels. What am I?",choices:["square","circle","triangle"],a:"B.) circle"},
    {grade:1,q:"You have six boxes of pies. There are five pies in each box. How many pies do you have?",a:"30 pies"},
    {grade:1,q:"True or False? 5 < 4",a:"False. (5 > 4)"},
    {grade:1,q:"You and your friend have $100 all together. If you have $63, how much does your friend have?", a:"$37"},

    // Grade 2
    {grade:2,q:"What is 25 ÷ 5?",a:"5"},
    {grade:2,q:"Which is greater: 43 or 34?",a:"43"},
    {grade:2,q:"How many inches are in a foot?",a:"12 inches"},
    {grade:2,q:"If you buy 2 pencils for 15¢ each, how much do you spend?",a:"30¢"},
    {grade:2,q:"What is 8 × 6?",a:"48"},
    {grade:2,q:"Which is longer: one yard or one foot?",a:"One yard"},
    {grade:2,q:"You read 12 pages on Monday and 15 on Tuesday. How many pages total?",a:"27"},
    {grade:2,q:"True or False: 100 is an odd number.",a:"False"},
    {grade:2,q:"What is half of 50?",a:"25"},
    {grade:2,q:"Which is heavier: 1 pound of feathers or 1 pound of rocks?",a:"They weigh the same"},
    // From the game:
    {grade:2,q:"Kristine saved 3 dimes, 2 nickels, and four pennies. How much did she save?", a:"¢44"},
    {grade:2,q:"Is 75 an odd or even number?", a:"Odd"},
    {grade:2,q:"Round off the number 67 to the nearest ten.", a:"70"},
    {grade:2,q:"What is the math term for the answer eight in this problem: 5 + 3 = 8", a:"sum"},
    {grade:2,q:"True or False? A 10oz glass holds more than one pint?", a:"False (1 pint = 16oz)"},

    // Grade 3
    {grade:3,q:"What is 144 ÷ 12?",a:"12"},
    {grade:3,q:"Perimeter of a square with side length 8?",a:"32"},
    {grade:3,q:"If you cut a pizza into 8 slices and eat 3, what fraction is left?",a:"5/8"},
    {grade:3,q:"What is 3/6 simplified?",a:"1/2"},
    {grade:3,q:"A farmer has 24 cows. If he sells 6, how many remain?",a:"18"},
    {grade:3,q:"What place value is the 7 in 472?",a:"The tens place (70)"},
    {grade:3,q:"True or False: 9 × 9 = 99.",a:"False"},
    {grade:3,q:"Solve: 15 + 27",a:"42"},
    {grade:3,q:"If a book costs $8 and you pay with a $10 bill, how much change?",a:"$2"},
    {grade:3,q:"What is 1/4 of 100?",a:"25"},
    // From the game:
    {grade:3,q:"You buy a skateboard that costs $72.99. You give the clerk $100. How much change do you back?",a:"$27.01"},
    {grade:3,q:"True or False? In the fraction 2/3, the number 3 is the denominator.",a:"True"},
    {grade:3,q:"A pyramid has how many sides?",choices:["3 or 4", "5 or 6", "7 or 8"], a:"A.) 3 or 4"},
    {grade:3,q:"Fill in the blank: ___ x 5 = 40?", a:"8"},
    {grade:3,q:"What is the duration of a half hour?", a:"30 minutes"},

    // Grade 4
    {grade:4,q:"What is 15% of 200?",a:"30"},
    {grade:4,q:"What is 3/8 as a decimal?",a:"0.375"},
    {grade:4,q:"Angles in a triangle add up to?",a:"180 degrees"},
    {grade:4,q:"A rectangle has length 12 and width 5. What is its area?",a:"60"},
    {grade:4,q:"Round 4,762 to the nearest hundred.",a:"4,800"},
    {grade:4,q:"Which is greater: 7/10 or 3/4?",a:"3/4"},
    {grade:4,q:"A car travels 60 miles in 1 hour. How far in 3 hours?",a:"180 miles"},
    {grade:4,q:"True or False: A prime number has exactly two factors.",a:"True"},
    {grade:4,q:"What is the median of 2, 7, 9, 4, 8?",a:"7"},
    {grade:4,q:"If you spend $3.45 and pay with a $5 bill, how much change?",a:"$1.55"},
    // From the game:
    {grade:4,q:"It snowed two days in one week. What fraction of the week had snow?", a:"2/7"},
    {grade:4,q:"What number comes just before 99,000?", a:"98,999"},
    {grade:4,q:"A number that is less than zero is what kind of number?", a:"negative number"},
    {grade:4,q:"What is 67,834,519 rounded to the nearest hundred-thousand?", a:"67,800,000"},
    {grade:4,q:"Which of the following is the number 5,004,015?",choices:["Five million, four hundred, fifteen","five million, four thousand, fifteen", "five billion, four-thousand, fifteen"], a:" B.) five million, four thousand, fifteen"},

    // Grade 5
    {grade:5,q:"What is 12 squared?",a:"144"},
    {grade:5,q:"Solve: 2x + 5 = 15",a:"x = 5"},
    {grade:5,q:"Pi rounded to two decimals?",a:"3.14"},
    {grade:5,q:"A store has a 25% off sale. If an item costs $40, what is the sale price?",a:"$30"},
    {grade:5,q:"What is the greatest common factor of 18 and 24?",a:"6"},
    {grade:5,q:"Convert 3,500 milliliters to liters.",a:"3.5 liters"},
    {grade:5,q:"True or False: Every square is also a rectangle.",a:"True"},
    {grade:5,q:"A train leaves at 2:15 PM and arrives at 6:45 PM. How long is the trip?",a:"4 hours 30 minutes"},
    {grade:5,q:"If a triangle has angles of 35° and 75°, what is the third angle?",a:"70°"},
    {grade:5,q:"The average of 12, 18, and 24 is…?",a:"18"},
    // From the game:
    {grade:5,q:"True or False? When you multiply a decimal number by 10, you move the decimal one place to the left?", a:"False (right)"},
    {grade:5,q:"What do you call a tool used to measure an angle?", a:"a protractor"},
    {grade:5,q:"What is the square root of 9?", a:"3"},
    {grade:5,q:"A cube has how many sides?", a:"6"},
    {grade:5,q:"Which one of the following fractions is equivalent to 1 1/2?",choices:["8/4","6/4","3/4"], a:"B.) 6/4"}
  ],
  Science: [
    // ===== Grade 1 =====
    {grade:1,q:"Name the animal the cuts down trees with its teeth.",a:"Beaver"},
    {grade:1, q:"Which sense do you use to sniff a flower?",choices:["Taste","Smell","Hearing"],a:"Smell"},
    {grade:1,q:"True or False: The Sun is a star.",a:"True"},
    {grade:1,q:"What falls from the sky on a rainy day?",a:"Rain"},
    {grade:1,q:"What do we call baby cats?",a:"Kittens"},
    {grade:1,q:"Which one lives in water and has gills?",choices:["Frog","Fish","Dog"],a:"A.) Fish"},
    {grade:1,q:"What body part do you use to hear?",a:"Ears"},
    {grade:1,q:"True or False: A tree’s roots grow underground.",a:"True"},
    {grade:1,q:"Which is a season of the year?",choices:["Football","Autumn","Halloween"],a:"B.) Autumn"},
    {grade:1,q:"What do bees make?",a:"Honey"},

    // ===== Grade 2 =====
    {grade:2,q:"Animals that eat only meat are called what?",a:"Carnivores"},
    {grade:2,q:"Is frozen nitrogen a solid, liquid, or gas?",a:"Solid"},
    {grade:2,q:"Which gas do plants take in to make food?",choices:["Oxygen","Carbon dioxide","Helium"],a:"B.) Carbon dioxide"},
    {grade:2,q:"True or False: All insects have six legs.",a:"True"},
    {grade:2,q:"What do you call the change from caterpillar to butterfly?",a:"Metamorphosis"},
    {grade:2,q:"Which is a habitat?",choices:["Forest","Triangle","Quarter"],a:"A.) Forest"},
    {grade:2,q:"The process of a liquid turning to gas is called…",a:"Evaporation"},
    {grade:2,q:"True or False: The heart’s job is to pump blood.",a:"True"},
    {grade:2, q:"Which of the following is not a tree?",choices:["Olive","Maple","Moss"],a:"C.) Moss"},
    {grade:2,q:"Which is the main source of light for Earth?",choices:["The Moon","The Sun","Lightning"],a:"B.) The Sun"},

    // ===== Grade 3 =====
    {grade:3,q:"What is the largest planet in our solar system?",a:"Jupiter"},
    {grade:3,q:"Water droplets forming on a cold cup is an example of what process?",a:"Condensation"},
    {grade:3,q:"True or False: The Moon is a planet.",a:"False"},
    {grade:3,q:"Animals that eat only plants are called what?",a:"Herbivores"},
    {grade:3,q:"Which layer is at the center of Earth?",choices:["Crust","Mantle","Core"],a:"C.) Core"},
    {grade:3,q:"At what Fahrenheit temperature does water boil?",choices:["100","32","212"],a:"C.) 212"},
    {grade:3,q:"Birds have what covering on their bodies?",a:"Feathers"},
    {grade:3,q:"Which simple machine is a see-saw?",choices:["Lever","Wedge","Screw"],a:"A.) Lever"},
    {grade:3,q:"True or False: A solid can change to a liquid when heated.",a:"True"},
    {grade:3,q:"A plant has a stem, roots, and leaves. Which part mostly absorbs water from the soil?",a:"Roots"},

    // ===== Grade 4 =====
    {grade:4,q:"Plants release which gas during photosynthesis?",a:"Oxygen"},
    {grade:4,q:"True or False? Louis Braille developed a process to pasteurize milk?", a:"False (it was Lewis Pasteur)"},
    {grade:4,q:"Which part of the cell holds genetic material?",choices:["Nucleus","Ribosome","Cell wall"],a:"A.) Nucleus"},
    {grade:4,q:"True or False: Sound travels faster than light.",a:"False"},
    {grade:4,q:"Which one of the following animals is NOT called a cow?", choices:["Mother elephant","Mother whale","Mother Sheep"],a:"C.) Mother Sheep"},
    {grade:4,q:"A shadow grows longer when the Sun is lower in the sky. When are shadows usually longest?",a:"Morning or late afternoon"},
    {grade:4,q:"White blood cells mainly help your body by…",choices:["Carrying oxygen","Fighting infection","Digesting food"],a:"B.) Fighting infection"},
    {grade:4,q:"Energy from the Sun is called what kind of energy?",a:"Solar energy"},
    {grade:4,q:"True or False: A vertebrate has a backbone.",a:"True"},
    {grade:4,q:"The basic unit of life is the…",a:"Cell"},

    // ===== Grade 5 =====
    {grade:5,q:"H2O is the chemical formula for what?",a:"Water"},
    {grade:5,q:"Cell structures that produce energy are called…",a:"Mitochondria"},
    {grade:5,q:"True or False: Water expands when it freezes.",a:"True"},
    {grade:5,q:"Plants losing water through their leaves is called…",a:"Transpiration"},
    {grade:5,q:"True or False? A light ray bends when it passes from air into water at an angel?",a:"True"},
    {grade:5,q:"A scientist dissolves salt in warm water faster than in cold water. What variable is helping the salt dissolve?",a:"Temperature (heat)"},
    {grade:5,q:"What force pulls objects toward Earth’s center?",a:"Gravity"},
    {grade:5,q:"Which two planets are known as gas giants?",choices:["Mercury & Venus","Jupiter & Saturn","Earth & Mars"],a:"B.) Jupiter & Saturn"},
    {grade:5,q:"The path Earth takes around the Sun is called its…",a:"Orbit"},
    {grade:5,q:"True or False: In a food chain, producers make their own food.",a:"True"}
  ],
  Social_Studies: [
    // ===== Grade 1 =====
    {grade:1,q:"Name the frontiersman who blazed a trail to Kentucky.",a:"Daniel Boone"},
    {grade:1,q:"How many days are there in September?",a:"30"},
    {grade:1,q:"What three colors are found on the flag of the United States of America?",a:"Red, White, and Blue"},
    {grade:1,q:"What month of the year do we celebrate Christmas?",a:"December"},
    {grade:1,q:"How many stripes are on the United State flag?",a:"13 stripes"},
    {grade:1,q:"Who wrote Poor Richard's Almanac?",choices:["Benjamin Franklin","John Hancock","Thomas Paine"],a:"A.) Benjamin Franklin"},
    {grade:1,q:"England's first successful colony in the New World was known as what?",a:"Jamestown"},
    {grade:1,q:"What did Yankee Doodle stick in his cap?",a:"A feather"},
    {grade:1,q:"What were rulers of ancient Egypt called?",a:"Pharaohs"},
    {grade:1,q:"Columbus claimed the New World for what country?",a:"Spain"},

    // ===== Grade 2 =====
    {grade:2,q:"Who wrote the Declaration of Independence?",a:"Thomas Jefferson"},
    {grade:2,q:"Who was the 16th President of the United States?",a:"Abraham Lincoln"},
    {grade:2,q:"The Pilgrims landed at which famous rock?",choices:["Plymouth Rock","Liberty Rock","Freedom Rock"],a:"A.) Plymouth Rock"},
    {grade:2,q:"True or False: The Civil War was fought between the North and South.",a:"True"},
    {grade:2,q:"What year did Christopher Columbus sail to the Americas?",a:"1492"},
    {grade:2,q:"What document begins with 'We the People'?",a:"The U.S. Constitution"},
    {grade:2,q:"Who was the first President to live in the White House?",choices:["John Adams","George Washington","Thomas Jefferson"],a:"A.) John Adams"},
    {grade:2,q:"What Native American woman helped the Pilgrims survive?",a:"Squanto (or Pocahontas)"},
    {grade:2,q:"True or False: The Liberty Bell is located in New York City.",a:"False (Philadelphia)"},
    {grade:2,q:"What holiday celebrates the end of slavery in the U.S.?",a:"Juneteenth"},

    // ===== Grade 3 =====
    {grade:3,q:"The revolutionary war between the American colonies and England was fought in what century?",choices:["17th Century","18th Century","19th Century"],a:"B.) 18th Century"},
    {grade:3,q:"Who discovered electricity with a kite and a key?",a:"Benjamin Franklin"},
    {grade:3,q:"Which U.S. President is on Mount Rushmore?",choices:["John F. Kennedy","George Washington","Barack Obama"],a:"B.) George Washington"},
    {grade:3,q:"Who was the first African American President of the U.S.?",a:"Barack Obama"},
    {grade:3,q:"True or False: The Revolutionary War was fought against Great Britain.",a:"True"},
    {grade:3,q:"Who was the leader of the Civil Rights Movement famous for 'I Have a Dream'?",a:"Martin Luther King Jr."},
    {grade:3,q:"What year did the U.S. declare independence?",choices:["1776","1492","1865"],a:"A.) 1776"},
    {grade:3,q:"Who was the first man to step on the Moon?",a:"Neil Armstrong"},
    {grade:3,q:"Which U.S. President bought the Louisiana Territory?",a:"Thomas Jefferson"},
    {grade:3,q:"True or False: Abraham Lincoln delivered the Gettysburg Address.",a:"True"},

    // ===== Grade 4 =====
    {grade:4,q:"Who invented the light bulb?",a:"Thomas Edison"},
    {grade:4,q:"Who was President during the Great Depression and World War II?",a:"Franklin D. Roosevelt"},
    {grade:4,q:"The 'Boston Tea Party' was a protest against what?",choices:["Taxes","Slavery","School"],a:"A.) Taxes"},
    {grade:4,q:"Who was the first person to circumnavigate the globe?",a:"Ferdinand Magellan (his crew finished it)"},
    {grade:4,q:"Who was the first woman to fly solo across the Atlantic Ocean?",a:"Amelia Earhart"},
    {grade:4,q:"In the 19th century, what was the major crop grown on southern plantations?",a:"Cotton"},
    {grade:4,q:"Which U.S. President signed the Emancipation Proclamation?",a:"Abraham Lincoln"},
    {grade:4,q:"What was the name of the ship that sank after hitting an iceberg in 1912?",choices:["Titanic","Mayflower","Santa Maria"],a:"A.) Titanic"},
    {grade:4,q:"What famous trail led pioneers westward in the 1800s?",a:"The Oregon Trail"},
    {grade:4,q:"True or False: The Cold War was fought with battles between the U.S. and Soviet Union.",a:"False (mostly political tension)"},

    // ===== Grade 5 =====
    {grade:5,q:"True or False? The Aztec nation was quiet and peaceful before the Spaniards arrived.",a:"False (they were warriors)"},
    {grade:5,q:"Who was the primary author of the U.S. Constitution?",a:"James Madison"},
    {grade:5,q:"The War of 1812 was fought between the U.S. and which country?",choices:["Spain","Great Britain","France"],a:"B.) Great Britain"},
    {grade:5,q:"Who was the British king during the American Revolution?",a:"King George III"},
    {grade:5,q:"What ancient civilization built the pyramids?",a:"The Egyptians"},
    {grade:5,q:"True or False: The Great Wall of China was built to keep out invaders.",a:"True"},
    {grade:5,q:"Who was the first President to be impeached?",a:"Andrew Johnson"},
    {grade:5,q:"Which war ended with the Treaty of Versailles?",choices:["World War I","World War II","The Civil War"],a:"A.) World War I"},
    {grade:5,q:"Who was the famous queen of ancient Egypt?",a:"Cleopatra"},
    {grade:5,q:"What year did World War II end?",a:"1945"}
  ],
  Music: [
    // ===== Grade 1 =====
    {grade:1,q:"What animal did Marry bring with her to school?",a:"Sheep"},
    {grade:1,q:"What twinkles in the sky?",a:"Little star"},
    {grade:1,q:"Which instrument has keys?",choices:["Guitar","Piano","Drum"],a:"B.) Piano"},
    {grade:1,q:"What do you call a song sung by one person?",a:"A solo"},
    {grade:1,q:"What do you clap along to in music?",a:"The beat"},
    {grade:1,q:"What family of instruments does the trumpet belong to?",a:"Brass"},
    {grade:1,q:"What is the opposite of loud in music?",a:"Soft"},
    {grade:1,q:"What are the first three letters of the musical alphabet?",a:"A, B, C"},
    {grade:1,q:"What do you call the words of a song?",a:"Lyrics"},
    {grade:1,q:"Which is a string instrument?",choices:["Violin","Flute","Drum"],a:"A.) Violin"},

    // ===== Grade 2 =====
    {grade:2,q:"What is a melody?",a:"A sequence of notes that is musically satisfying"},
    {grade:2,q:"What is an orchestra?",a:"A large group of musicians"},
    {grade:2,q:"What family of instruments is the flute in?",a:"Woodwind"},
    {grade:2,q:"What does tempo mean?",a:"The speed of the music"},
    {grade:2,q:"What is the conductor’s job?",a:"To lead musicians"},
    {grade:2,q:"Which is a percussion instrument?",choices:["Drum","Violin","Flute"],a:"A.) Drum"},
    {grade:2,q:"What is harmony?",a:"Two or more notes played together"},
    {grade:2,q:"What is a duet?",a:"A performance by two people"},
    {grade:2,q:"What did the baby bumble bee do when it was brought home?",a:"Stung me!"},
    {grade:2,q:"How many beats are in a measure with a 3/4 time signature?",a:"3 beats"},

    // ===== Grade 3 =====
    {grade:3,q:"What is a symphony?",a:"A long musical work for orchestra"},
    {grade:3,q:"Who composed 'The Four Seasons'?",a:"Antonio Vivaldi"},
    {grade:3,q:"What does 'forte' mean in music?",a:"Loud"},
    {grade:3,q:"What does 'piano' mean in music?",a:"Soft"},
    {grade:3,q:"What do you call the horizontal lines that music is written on?",a:"The staff"},
    {grade:3,q:"What does the sharp sign do?",a:"Play the note a half step higher"},
    {grade:3,q:"What is an opera?",a:"A play set to music and singing"},
    {grade:3,q:"What is improvisation in music?",a:"Making up music as you go (like Jared Stokes does on Sundays for prelude music)"},
    {grade:3,q:"Which of these is NOT a brass instrument?",choices:["Trombone","Trumpet","Violin"],a:"C.) Violin"},
    {grade:3,q:"What is a choir?",a:"A group of singers (Come sing with us, Sundays after church! ;) )"},

    // ===== Grade 4 =====
    {grade:4,q:"What is jazz?",a:"A style of music with improvisation"},
    {grade:4,q:"Who was Ludwig van Beethoven?",a:"A famous piano composer"},
    {grade:4,q:"What is the difference between major and minor chords?",a:"Major sounds happy, minor sounds sad"},
    {grade:4,q:"What is syncopation?",a:"Accents on off-beats"},
    {grade:4,q:"What is a scale in music?",a:"A sequence of notes in order"},
    {grade:4,q:"Which is a woodwind instrument?",choices:["Clarinet","Violin","Trumpet"],a:"A.) Clarinet"},
    {grade:4,q:"What is a concerto?",a:"A piece for solo instrument and orchestra"},
    {grade:4,q:"Who wrote 'The Nutcracker Suite'?",a:"Tchaikovsky"},
    {grade:4,q:"What is dynamics in music?",a:"The loudness or softness"},
    {grade:4,q:"What is a refrain?",a:"A repeated section of a song"},

    // ===== Grade 5 =====
    {grade:5,q:"What is an aria?",a:"A solo song in an opera"},
    {grade:5,q:"Who composed 'Eine kleine Nachtmusik'?",a:"Wolfgang Amadeus Mozart"},
    {grade:5,q:"What is a symphony orchestra’s largest section?",a:"Strings"},
    {grade:5,q:"What is polyphony?",a:"Multiple melodies at the same time"},
    {grade:5,q:"What is a time signature?",a:"Numbers that tell beats per measure"},
    {grade:5,q:"What is a baton used for?",a:"Conducting"},
    {grade:5,q:"What is a sonata?",a:"A composition for one or two instruments"},
    {grade:5,q:"Who was Johann Sebastian Bach?",a:"A famous Baroque composer"},
    {grade:5,q:"What does 'crescendo' mean?",a:"Gradually getting louder"},
    {grade:5,q:"What is a motif in music?",a:"A short recurring musical idea"}
  ],
  Art: [
    // ===== Grade 1 =====
    {grade:1,q:"What colors make green?",a:"Yellow and blue"},
    {grade:1,q:"Which of these is a primary color?",choices:["Red","Green","Purple"],a:"A.) Red"},
    {grade:1,q:"What tool do you use to paint on paper?",a:"A paintbrush"},
    {grade:1,q:"What do you call a picture of yourself?",a:"A self-portrait"},
    {grade:1,q:"True or False? Murals are painted on walls.",a:"True."},
    {grade:1,q:"Mixing red and yellow makes what color?",a:"Orange"},
    {grade:1,q:"Blue + Red = what color?",a:"Purple"},
    {grade:1,q:"What is the opposite of light colors?",a:"Dark colors"},
    {grade:1,q:"What is clay used for?",a:"Making sculptures"},
    {grade:1,q:"Which wax item is used to color with?",choices:["Crayons","Markers","Paint"],a:"A.) Crayons"},

    // ===== Grade 2 =====
    {grade:2,q:"What is a canvas used for?",a:"Painting"},
    {grade:2,q:"What color is the crayola crayon called \"Eggplant\"?",choices:["red-ish orange","brown-ish purple","dark green"],a:"B.) brown-ish purple"},
    {grade:2,q:"What shape has 3 sides?",choices:["Square","Triangle","Circle"],a:"B.) Triangle"},
    {grade:2,q:"What do you call art made by cutting and pasting pieces?",a:"A collage"},
    {grade:2,q:"What tool is used to mix paint?",a:"A palette"},
    {grade:2,q:"True or False? Vincit Van Gögh painted the Mona Lisa?",a:"False (it was Leonardo da Vinci)"},
    {grade:2,q:"What is chalk mostly used for in art?",a:"Drawing"},
    {grade:2,q:"What do you call colors like pink, orange, and green?",a:"Secondary colors"},
    {grade:2,q:"What is sculpture?",a:"Three-dimensional art"},
    {grade:2,q:"What do you call a drawing with only pencil shades?",a:"A sketch"},
    
    // TODO: Finish looking through the rest of these questions: 
    // {grade:5,q:"",a:""},
    // ===== Grade 3 =====
    {grade:3,q:"Who painted the Mona Lisa?",a:"Leonardo da Vinci"},
    {grade:3,q:"What two colors mixed together cerate purple?",a:"Red and blue"},
    {grade:3,q:"On the color wheel, what is the term for colors that are directly opposite each other?",a:"Complementary colors"},
    {grade:3,q:"What is the name for an artist who creates sculptures?",a:"A sculptor"},
    {grade:3,q:"Which famous artist painted the masterpiece known as 'Starry Night'?",a:"Vincent van Gogh"},
    {grade:3,q:"What do you call a large artwork that is painted directly onto a wall?",a:"A mural"},
    {grade:3,q:"In art, what does the technique of shading help to show?",a:"Light and shadow"},
    {grade:3,q:"What is the term for a picture or pattern made by arranging many small pieces of colored material together?",a:"Mosaic"},
    {grade:3,q:"Which of the following is considered a warm color?",choices:["Blue","Red","Green"],a:"B.) Red"},
    {grade:3,q:"What are the secondary colors?",a:"Green, orange, purple"},
    {grade:3,q:"What is the term for an artist’s handwritten name on a painting?",a:"A signature"},

    // ===== Grade 4 =====
    {grade:4,q:"What is abstract art?",a:"Art that doesn’t represent reality"},
    {grade:4,q:"Who painted the ceiling of the Sistine Chapel?",a:"Michelangelo"},
    {grade:4,q:"What art style uses tiny dots of color?",a:"Pointillism"},
    {grade:4,q:"What is a portrait?",a:"A picture of a person"},
    {grade:4,q:"What is a still life?",a:"A drawing or painting of objects"},
    {grade:4,q:"What does 'medium' mean in art?",a:"The material used (like paint, clay)"},
    {grade:4,q:"Which is a cool color?",choices:["Orange","Blue","Red"],a:"B.) Blue"},
    {grade:4,q:"Which artist is known for cubism?",a:"Pablo Picasso"},
    {grade:4,q:"What is balance in art?",a:"How elements are arranged for stability"},
    {grade:4,q:"What is symmetry?",a:"When two halves match each other"},

    // ===== Grade 5 =====
    {grade:5,q:"What is pop art?",a:"Art based on popular culture"},
    {grade:5,q:"What style of paintings was Georgia O’Keeffe famous for?",a:"Flowers and nature scenes"},
    {grade:5,q:"What is a palette knife used for?",a:"Spreading paint"},
    {grade:5,q:"Which is an element of art?",choices:["Rhythm","Harmony","Color"],a:"C.) Color"},
    {grade:5,q:"What is surrealism?",a:"Dreamlike art movement"},
    {grade:5,q:"What is negative space in art?",a:"Empty space around objects"},
    {grade:5,q:"What is a fresco?",a:"Painting on wet plaster"}
  ],  
  English: [
    // ===== Grade 1 =====
    {grade:1,q:"What is the plural of 'mouse'?",a:"Mice"},
    {grade:1,q:"What letter comes after J in the alphabet?",a:"K"},
    {grade:1,q:"Which of these is a vowel?",choices:["B","A","S"],a:"B.) A"},
    {grade:1,q:"True or False: A sentence always begins with a capital letter.",a:"True"},
    {grade:1,q:"How many letters are in the English alphabet?",a:"26"},
    {grade:1,q:"What punctuation mark ends a question?",a:"A question mark"},
    {grade:1,q:"Which of these words is spelled correctly?",choices:["kat","dog","hrose"],a:"B.) dog"},
    {grade:1,q:"What is the opposite of 'up'?",a:"Down"},
    {grade:1,q:"What sound does the 'ph' make in 'phone'?",a:"F"},
    
    // ===== Grade 2 =====
    {grade:2,q:"How many letters need to be capitalized in this sentence: 'my cat theodore ran all the way to portland, oregon.'?",a:"4 (My, Theodore, Portland, Oregon)"},
    {grade:2,q:"What is the opposite of 'hot'?",a:"Cold"},
    {grade:2,q:"A noun is a…?",a:"A person, place, or thing"},
    {grade:2,q:"Which word needs to be capitalized? 'We went to london last summer.'",choices:["we","london","summer"],a:"B.) london"},
    {grade:2,q:"True or False: An adjective describes a noun.",a:"True"},
    {grade:2,q:"What is the past tense of 'jump'?",a:"Jumped"},
    {grade:2,q:"Which word is misspelled: 'freind, school, dog'?",a:"freind (correct spelling: friend)"},
    {grade:2,q:"Which punctuation ends an exclamation?",choices:[".","?","!"],a:"C.) !"},
    {grade:2,q:"What is the base word of 'happily'?",choices:["Happy","Joyfully","Excited"],a:"A.) Happy"},
    {grade:2,q:"Which word is a verb: 'run, red, cat'?",a:"run"},
    {grade:2,q:"How many syllables are in the word 'banana'?",a:"3"},

    // ===== Grade 3 =====
    {grade:3,q:"What is the past tense of 'run'?",a:"Ran"},
    {grade:5,q:"Which word in this sentence is a proper noun? \"My dog, Ash, likes to eat cheese.\" ",a:"Ash"},
    {grade:3,q:"Which sentence is correct?",choices:["i went to the park.","I went to the park.","i Went To The Park."],a:"B.) I went to the park."},
    {grade:3,q:"True or False: 'Because' is a conjunction.",a:"True"},
    {grade:3,q:"What is the plural of 'child'?",a:"Children"},
    {grade:3,q:"What is a synonym for 'happy'?",choices:["Sad","Angry","Joyful"],a:"C.) Joyful"},
    {grade:3,q:"How many words in this sentence should be capitalized: 'my dog is named rover'?",a:"2 (My, Rover)"},
    {grade:3,q:"What type of word is 'quickly'?",choices:["Adverb","Adjective","Noun"],a:"A.) Adverb"},
    {grade:3,q:"Which of these words are spelled correctly:",choices:["definately", "definitely", "defanitely"],a:"B.) Definitely"},
    {grade:3,q:"What is the root word of 'teacher'?",a:"Teach"}, 

    // ===== Grade 4 =====
    {grade:4,q:"Which word is a pronoun?",choices:["He","Dog","Run"],a:"A.) He"},
    {grade:4,q:"What is a homophone for 'pair'?",a:"Pear"},
    {grade:4,q:"Which sentence uses correct punctuation?",choices:["Its going to rain.","It's going to rain.","Its' going to rain."],a:"B.) It's going to rain."},
    {grade:4,q:"True or False: A paragraph must have at least one sentence.",a:"True"},
    {grade:4,q:"What is a simile?",a:"A comparison using 'like' or 'as'"},
    {grade:4,q:"What is a metaphor?",a:"A comparison without using like or as"},
    {grade:4,q:"What is the plural of 'goose'?",a:"Geese"},
    {grade:4,q:"Which of these is a complete sentence?",choices:["Because I was late.","When the bell rang.","I ate lunch."],a:"C.) I ate lunch."},
    {grade:4,q:"Correct the misspelled word: 'seperate'.",a:"separate"}, 
    {grade:4,q:"What punctuation is used in contractions?",a:"Apostrophe ( ' )"},

    // ===== Grade 5 =====
    {grade:5,q:"What is a haiku?",a:"A poem with 5-7-5 syllables"},
    {grade:5,q:"Which sentence is written in the past tense?",choices:["I will go to the store.","I am going to the store.","I went to the store."],a:"C.) I went to the store."},
    {grade:5,q:"Which word or words need to be capitalized: 'george washington was president.'?",a:"george, washington"},
    {grade:5,q:"What is the subject of the sentence: 'The dog chased the ball'?",a:"The dog"},
    {grade:5,q:"True or False: A preposition shows the relationship between two words.",a:"True"},
    {grade:5,q: "Which of the following sentences is an idiom?",choices: ["She let the cat out of the bag.","The cat ran across the yard.","She opened the bag to look inside."],a: "A.) She let the cat out of the bag."},
    {grade:5,q:"What type of sentence gives a command?",a:"Imperative sentence"},
    {grade:5,q:"Which of these is a proper noun? \"city\",\"dog\",\"New York\"",a:"New York"},
    {grade:5,q:"How many words should be capitalized: 'the statue of liberty is in new york'?",a:"5 (The, Statue, Liberty, New York)"}, 
  ],
  Geography: [
    // ===== Grade 2 =====
    {grade:2,q:"What U.S. state is home to the Grand Canyon?",a:"Arizona"},
    {grade:2,q:"What is the capital of Washington?",a:"Olympia"},
    {grade:2,q:"Which ocean is the largest?",choices:["Atlantic","Indian","Pacific"],a:"C.) Pacific"},
    {grade:2,q:"What mountain range runs along the eastern United States?",a:"Appalachian Mountains"},
    {grade:2,q:"True or False: Mount Everest is the tallest mountain on Earth.",a:"True"},
    {grade:2,q:"What U.S. state is shaped like a mitten?",a:"Michigan"},
    {grade:2,q:"Which of these is NOT a U.S. state?",choices:["Alaska","Ontario","Florida"],a:"B.) Ontario"},
    {grade:2,q:"What continent is Mexico in?",a:"North America"},
    {grade:2,q:"True or False: The Sahara Desert is in South America.",a:"False"},
    {grade:2,q:"What river flows through Egypt?",a:"The Nile"},
    
    // ===== Grade 3 =====
    {grade:3,q:"What is the capital of California?",a:"Sacramento"},
    {grade:3,q:"Which two countries share the world’s longest border?",choices:["U.S. & Mexico","U.S. & Canada","Russia & China"],a:"A.) U.S. & Canada"},
    {grade:3,q:"What continent is Brazil located on?",a:"South America"},
    {grade:3,q:"True or False: Antarctica has no permanent residents.",a:"True"},
    {grade:3,q:"Which U.S. state is the largest by area?",a:"Alaska"},
    {grade:3,q:"What is the capital of France?",a:"Paris"},
    {grade:3,q:"Which line divides Earth into the Northern and Southern Hemispheres?",a:"b.) Equator"},
    {grade:3,q:"What desert covers much of northern Africa?",a:"The Sahara Desert"},
    {grade:3,q:"True or False: The Amazon River is longer than the Mississippi River.",a:"True"},
    {grade:3,q:"What is the smallest continent?",a:"Australia"},
    {grade:3,q:"True or False: Africa is larger than Europe.",a:"True"},

    // ===== Grade 4 =====
    {grade:4,q:"Which U.S. river is the longest?",a:"Missouri River"},
    {grade:4,q:"Which country has the most people?",choices:["India","United States","China"],a:"C.) China"},
    {grade:4,q:"Which U.S. state has the nickname 'The Sunshine State'?",a:"Florida"},
    {grade:4,q:"True or False: Russia is the largest country in the world by land area.",a:"True"},
    {grade:4,q:"Which two continents are entirely in the Southern Hemisphere?",a:"Australia and Antarctica"},
    {grade:4,q:"Which U.S. city is known as the 'Windy City'?",choices:["Chicago","New York","Boston"],a:"A.) Chicago"},
    {grade:4,q:"The island of Madagascar belongs to which continent?",a:"Africa"},
    {grade:4,q:"What is the capital of Japan?",a:"Tokyo"},
    {grade:4,q:"True or False: The Mississippi River flows into the Pacific Ocean.",a:"False"},
    {grade:4,q:"Which continent is known as the 'frozen desert'?",a:"Antarctica"},

    // ===== Grade 5 =====
    {grade:5,q:"What is the capital of Canada?",a:"Ottawa"},
    {grade:5,q:"Which African country has Cairo as its capital?",choices:["Egypt","Nigeria","Kenya"],a:"A.) Egypt"},
    {grade:5,q:"Which ocean is the Bermuda Triangle located in?",a:"Atlantic Ocean"},
    {grade:5,q:"What is the capital of Australia?",a:"Canberra"},
    {grade:5,q:"True or False: Mount Kilimanjaro is in Kenya.",a:"False (it’s in Tanzania)"},
    {grade:5,q:"Which country has both the Andes Mountains and the Amazon rainforest?",choices:["Brazil","Chile","Argentina"],a:"A.) Brazil"},
    {grade:5,q:"What is the longest river in the world?",a:"The Nile (some argue Amazon)"},
    {grade:5,q:"Which line divides the Eastern and Western Hemispheres?",a:"Prime Meridian"},
    {grade:5,q:"True or False: Greenland is considered part of North America.",a:"True"},
  ],
  Miscellaneous: [
    // ===== Grade 1 =====
    {grade:1,q:"Who in the ward wouldn't stop talking if there wasn't a time limit on talks?",a:"Neil Butler"},
    {grade:1,q:"Who was the first bishop in the Battle Ground 1st ward?",a:"Mitch Taylor"},
    {grade:1,q:"Who's the ward mission leader?",a:"Mitch Taylor"},
    {grade:1,q:"Who almost didn't have to give the opening prayer this last Sunday?",a:"Darlene Hamann"},
    {grade:1,q:"What color are the binders for the new hymns?",a:"Blue"},
    {grade:1,q:"What year did the Battle Ground church building flood?",a:"2021"},
    {grade:1,q:"What year was the Church of Jesus Christ of Latter-day Saints founded?",a:"1830"},
    {grade:1,q:"What superbowl (year) did the fire alarm go off in this church building?",a:"2008 (super bowl 42)"},

    // ===== Grade 2 =====
    {grade:2,q:"Who in the ward wouldn't stop talking if there wasn't a time limit on talks?",a:"Neil Butler"},
    {grade:2,q:"Who was the first bishop in the Battle Ground 1st ward?",a:"Mitch Taylor"},
    {grade:2,q:"Who's the ward mission leader?",a:"Mitch Taylor"},
    {grade:2,q:"Who almost didn't have to give the opening prayer this last Sunday?",a:"Darlene Hamann"},
    {grade:2,q:"What color are the binders for the new hymns?",a:"Blue"},
    {grade:2,q:"What year did the Battle Ground church building flood?",a:"2021"},
    {grade:2,q:"What year was the Church of Jesus Christ of Latter-day Saints founded?",a:"1830"},
    {grade:2,q:"What superbowl (year) did the fire alarm go off in this church building?",a:"2008 (super bowl 42)"},

    // ===== Grade 3 =====
    {grade:3,q:"Who in the ward wouldn't stop talking if there wasn't a time limit on talks?",a:"Neil Butler"},
    {grade:3,q:"Who was the first bishop in the Battle Ground 1st ward?",a:"Mitch Taylor"},
    {grade:3,q:"Who's the ward mission leader?",a:"Mitch Taylor"},
    {grade:3,q:"Who almost didn't have to give the opening prayer this last Sunday?",a:"Darlene Hamann"},
    {grade:3,q:"What color are the binders for the new hymns?",a:"Blue"},
    {grade:3,q:"What year did the Battle Ground church building flood?",a:"2021"},
    {grade:3,q:"What year was the Church of Jesus Christ of Latter-day Saints founded?",a:"1830"},
    {grade:3,q:"What superbowl (year) did the fire alarm go off in this church building?",a:"2008 (super bowl 42)"},

    // ===== Grade 4 =====
    {grade:4,q:"Who in the ward wouldn't stop talking if there wasn't a time limit on talks?",a:"Neil Butler"},
    {grade:4,q:"Who was the first bishop in the Battle Ground 1st ward?",a:"Mitch Taylor"},
    {grade:4,q:"Who's the ward mission leader?",a:"Mitch Taylor"},
    {grade:4,q:"Who almost didn't have to give the opening prayer this last Sunday?",a:"Darlene Hamann"},
    {grade:4,q:"What color are the binders for the new hymns?",a:"Blue"},
    {grade:4,q:"What year did the Battle Ground church building flood?",a:"2021"},
    {grade:4,q:"What year was the Church of Jesus Christ of Latter-day Saints founded?",a:"1830"},
    {grade:4,q:"What superbowl (year) did the fire alarm go off in this church building?",a:"2008 (super bowl 42)"},

    // ===== Grade 5 =====
    {grade:5,q:"Who in the ward wouldn't stop talking if there wasn't a time limit on talks?",a:"Neil Butler"},
    {grade:5,q:"Who was the first bishop in the Battle Ground 1st ward?",a:"Mitch Taylor"},
    {grade:5,q:"Who's the ward mission leader?",a:"Mitch Taylor"},
    {grade:5,q:"Who almost didn't have to give the opening prayer this last Sunday?",a:"Darlene Hamann"},
    {grade:5,q:"What color are the binders for the new hymns?",a:"Blue"},
    {grade:5,q:"What year did the Battle Ground church building flood?",a:"2021"},
    {grade:5,q:"What year was the Church of Jesus Christ of Latter-day Saints founded?",a:"1830"},
    {grade:5,q:"What superbowl (year) did the fire alarm go off in this church building?",a:"2008 (super bowl 42)"},
  ],
};

// ===== Teams =====
function makeTeam(name, color){
  return { name, color, scoreIndex:0, questionIndex:0, cheats:{copy:false,peek:false,save:false},
    used:{}, tiles:generateTiles(), currentQ:null, finished:false, walked:false, bonusDone:false, won:false };
}
function addTeam(name){
  if(!name?.trim()) return;
  if(!state.teams) state.teams=[];
  const color = DEFAULT_TEAM_COLOR;
  state.teams.push(makeTeam(name.trim(), color));
  state.currentTeamIndex=state.teams.length-1;
  saveState();
  renderTeams();
}
function editTeam(i){ const t=state.teams[i]; if(!t) return; const nv=prompt("Rename team:",t.name); if(nv?.trim()){ t.name=nv.trim(); saveState(); renderTeams(); } }
function clearTeam(i){ if(!confirm("Reset this team's progress?"))return; const t=state.teams[i]; if(!t)return; state.teams[i]=makeTeam(t.name, t.color); saveState(); renderTeams(); }
function deleteTeam(i){ if(!confirm("Delete this team?"))return; state.teams.splice(i,1); if(state.currentTeamIndex>=state.teams.length){ state.currentTeamIndex=state.teams.length-1; } saveState(); renderTeams(); }
function setTeamColor(i, color){
  const t = state.teams?.[i];
  if(!t) return;
  t.color = color;
  saveState();
  renderTeams();
}
function setTeamColorPreset(i, value){
  if(value === 'custom') return;
  setTeamColor(i, value);
}
function resetAll(){ if(!confirm("Restart the entire game? This will remove all teams and progress.")) return; state={teams:[],currentTeamIndex:null,globalUsed:{}}; undoStack=[]; redoStack=[]; persistStacks(); saveState(false); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); location.reload(); }

const gradeClass = g => g===1?'g1':g===2?'g2':g===3?'g3':g===4?'g4':'g5';
function currentTeam(){ return state.teams?.[state.currentTeamIndex] || null; }
function nextTeam(){ if(!state.teams?.length) return; let start = state.currentTeamIndex==null ? -1 : state.currentTeamIndex; for(let i=1;i<=state.teams.length;i++){ const idx=(start+i)%state.teams.length; const t=state.teams[idx]; if(!t.finished){ state.currentTeamIndex=idx; saveState(false); return goTo('board.html'); } } alert("All teams are finished."); }

// ===== Tiles (G5→G1 so grade 1 appears at bottom). Two tiles per grade, NO pre-assigned subject. =====
function generateTiles(){
  const tiles = [];
  const randomMode = isRandomSubjectsEnabled();
  
  // Get all available subjects
  const allSubjects = Object.keys(questionBank);
  
  for (let g = 5; g >= 1; g--) {
    for(let t = 0; t < 2; t++){
      const tile = { grade: g, used: false };
      
      // If random subjects mode is on, assign a random subject to EVERY tile
      if(randomMode){
        // First try to find subjects with questions for this grade
        const subjectsWithGrade = allSubjects.filter(s => (questionBank[s]||[]).some(q=>q.grade===g));
        
        // Use subjects with this grade, or fall back to all subjects
        const availableSubjects = subjectsWithGrade.length > 0 ? subjectsWithGrade : allSubjects;
        
        if(availableSubjects.length){
          tile.subject = availableSubjects[Math.floor(Math.random()*availableSubjects.length)];
        }
      }
      tiles.push(tile);
    }
  }
  return tiles;
}

// ===== Unique picker (global & per-team) =====
function pickQuestion(team, subject, grade){
  let pool = (questionBank[subject]||[]).filter(q=>q.grade===grade);
  if(!pool.length) return {q:'(No question found)', a:'(n/a)'};
  let key = subject+'|'+grade;
  let globalKey = key;
  // For Miscellaneous, use a global key for all grades
  if(subject === 'Miscellaneous') {
    key = 'Miscellaneous|all';
    globalKey = key;
    // Pool is all Miscellaneous questions for any grade
    pool = questionBank[subject]||[];
  }
  if(!team.used[key]) team.used[key]=[];
  if(!state.globalUsed[key]) state.globalUsed[key]=[];
  let idx=-1, guard=0;
  while(guard<400){
    const cand=Math.floor(Math.random()*pool.length);
    if(!team.used[key].includes(cand) && !state.globalUsed[key].includes(cand)) { idx=cand; break; }
    guard++;
  }
  if(idx===-1) idx=0;
  team.used[key].push(idx);
  state.globalUsed[key].push(idx);
  saveState(false);
  // For Miscellaneous, return the question and set grade to the actual question's grade
  if(subject === 'Miscellaneous') {
    const q = pool[idx];
    return { ...q };
  }
  return pool[idx];
}

// ===== Navigation =====
function goTo(page, index){ if(typeof index==='number'){ state.currentTeamIndex=index; saveState(false); } window.location.href=page; }

// ===== Renderers =====
function renderTeams(){
  const list=document.getElementById('teams'); if(!list) return; list.innerHTML='';
  (state.teams||[]).forEach((t,i)=>{
    const row=document.createElement('div');
    row.className='team-row'+(t.won?' winner':'(Winner!)');
    const rowColor = t.color || '#0f8a50';
    const preset = TEAM_COLOR_OPTIONS.find(opt => opt.value === rowColor);
    const selectValue = preset ? preset.value : 'custom';
    row.style.background = rowColor;
    row.style.color = getTextColor(rowColor);
    let status = '';
    if (t.finished) {
      if (t.won) status = '(Winner!)';
      else if (t.walked) status = '(Walked)';
      else status = '(Lost)';
    }
    row.innerHTML = `
      <div class="title">${t.name} ${t.won?'🏆':''} ${status}</div>
      <div class="meta">Bank: ${fmtMoney(t.scoreIndex)} &nbsp;|&nbsp; Cheats: 
        <span class="badge ${t.cheats.copy?'off':''}">copy</span>
        <span class="badge ${t.cheats.peek?'off':''}">peek</span>
        <span class="badge ${t.cheats.save?'off':''}">save</span>
      </div>
      <div style="margin-top:.4rem; display:flex; align-items:center; gap:.6rem; flex-wrap:wrap;">
        <label style="display:flex; align-items:center; gap:.4rem; font-size:.9rem;">
          Color
          <select onchange="setTeamColorPreset(${i}, this.value)" style="height:28px; border-radius:6px; border:none; padding:0 .4rem;">
            ${TEAM_COLOR_OPTIONS.map(opt => `<option value="${opt.value}" ${opt.value === selectValue ? 'selected' : ''}>${opt.label}</option>`).join('')}
            <option value="custom" ${selectValue === 'custom' ? 'selected' : ''}>Custom</option>
          </select>
        </label>
        <input type="color" value="${rowColor}" onchange="setTeamColor(${i}, this.value)" aria-label="Custom team color" style="height:28px; width:32px; padding:0; border:none; background:transparent;" />
        <button class="btn btn-primary" onclick="goTo('scoreboard.html', ${i})">Open</button>
        <button class="btn btn-secondary" onclick="editTeam(${i})">Rename</button>
        <button class="btn btn-secondary" onclick="clearTeam(${i})">Reset</button>
        <button class="btn btn-danger" onclick="deleteTeam(${i})">Delete</button>
      </div>`;
    list.appendChild(row);
  });
}

function renderScoreboard(){
  const wrap=document.getElementById('scoreboard'); if(!wrap) return; wrap.innerHTML='';
  // Create a flex row container for teams
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.flexWrap = 'wrap';
  row.style.justifyContent = 'center';
  row.style.gap = '18px';

  (state.teams||[]).forEach((t,i)=>{
    const cheats=['copy','peek','save'].map(k=>`<span class="badge ${t.cheats[k]?'off':''}">${k}</span>`).join('');
    const disabled=t.finished?'disabled':'';
    const moneyLis = MONEY.map((amt,idx)=>{
      const filled = (idx<=t.scoreIndex) ? 'filled' : '';
      const safe = SAFE_INDEXES.includes(idx) ? 'safe' : '';
      return `<li class="${filled} ${safe}"><span class="money-step"></span><span>$${amt.toLocaleString()}</span></li>`;
    }).join('');
    const card=document.createElement('div');
    const cardColor = t.color || '#0f8a50';
    card.style.background = cardColor;
    card.style.color = getTextColor(cardColor);
    card.style.margin='0';
    card.style.padding='12px';
    card.style.borderRadius='12px';
    card.style.maxWidth='220px';
    card.style.minWidth='200px';
    card.style.flex = '1 1 220px';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    if(t.won) card.classList.add('winner');
    card.innerHTML = `
      <div class="team-title" style="font-size:1.2em; font-weight:bold; margin-bottom:8px;">
      ${t.name} ${t.won?'<span class="trophy">🏆</span>':''} 
      ${t.finished ? (t.won ? '(Winner!)' : (t.walked ? '(Walked)' : '(Lost)')) : ''}
      </div>
      <div class="money-vert" style="width:100%;"><ul>${moneyLis}</ul></div>
      <div style="margin-top:.4rem;">${cheats}</div>
      <div style="margin-top:8px;">
      <button class="btn btn-primary" onclick="goTo('board.html', ${i})" ${disabled}>Play / Resume</button>
      <button class="btn btn-secondary" onclick="openScoreEdit(${i})">Edit Score</button>
      </div>`;
    row.appendChild(card);
  });
// ===== Score Edit Modal Logic (global, not inside renderScoreboard) =====
let scoreEditIndex = null;
let scoreEditValue = 0;
window.openScoreEdit = function(idx) {
  scoreEditIndex = idx;
  const t = state.teams[idx];
  scoreEditValue = t.scoreIndex;
  document.getElementById('score-edit-team').textContent = t.name;
  document.getElementById('score-edit-value').textContent = fmtMoney(scoreEditValue);
  document.getElementById('score-edit-modal').style.display = 'flex';
}
window.closeScoreEdit = function() {
  document.getElementById('score-edit-modal').style.display = 'none';
  scoreEditIndex = null;
}
window.changeScoreBy = function(delta) {
  if (scoreEditIndex == null) return;
  scoreEditValue = Math.max(0, Math.min(MONEY.length-1, scoreEditValue + delta));
  document.getElementById('score-edit-value').textContent = fmtMoney(scoreEditValue);
}
window.saveScoreEdit = function() {
  if (scoreEditIndex == null) return;
  state.teams[scoreEditIndex].scoreIndex = scoreEditValue;
  saveState();
  window.closeScoreEdit();
  renderScoreboard();
  showToast('Score updated!');
}
  wrap.appendChild(row);
}

function renderBoard(){
  const t=currentTeam(); if(!t) return;
  const teamHeader = document.getElementById('teamNameHeader');
  teamHeader.innerText = t.name + (t.finished ? (t.walked?' (Walked)':' (Finished)') : '');
  if(t.color){
    teamHeader.style.color = t.color;
    teamHeader.style.textShadow = '0 2px 6px rgba(0,0,0,0.35)';
  }
  
  // Ensure all tiles have subjects assigned if random mode is on
  if(isRandomSubjectsEnabled()){
    t.tiles.forEach(tile => {
      if(!tile.subject){
        assignRandomSubjectToTile(tile);
      }
    });
  }
  
  const grid=document.getElementById('grid'); grid.innerHTML='';
  t.tiles.forEach((tile,idx)=>{
    const el=document.createElement('div');
    el.className='tile '+gradeClass(tile.grade)+(tile.used?' used':'');
    // Show subject if random mode and subject is assigned, otherwise just show grade
    if(isRandomSubjectsEnabled() && tile.subject){
      const subjectDisplay = tile.subject.replace(/_/g, ' ');
      el.innerHTML = `<div style="font-size:0.9rem;">Grade ${tile.grade}</div><div style="font-size:0.9rem;">${subjectDisplay}</div>`;
    } else {
      el.innerHTML = `Grade ${tile.grade}`;
    }
    if(!tile.used && !t.finished){ el.onclick=()=>openSubjectPicker(idx); }
    grid.appendChild(el);
  });
  const moneyEl=document.getElementById('ladder'); moneyEl.innerHTML='';
  MONEY.forEach((amt,idx)=>{
    const li=document.createElement('li');
    let liClass = (idx<=t.scoreIndex?'filled ':'') + (SAFE_INDEXES.includes(idx)?'safe':'');
    li.className = liClass;
    li.innerHTML = `<span class=\"money-step\"></span><span>$${amt.toLocaleString()}</span>`;
    moneyEl.appendChild(li);
  });
  ['copy','peek','save'].forEach(k=>{
    const btn=document.getElementById('cheat-'+k);
    if(btn){ btn.disabled=!!t.cheats[k] || t.finished; btn.classList.toggle('btn-secondary', !!t.cheats[k] || t.finished); }
  });
  const bonusBtn=document.getElementById('btn-bonus');
  if(bonusBtn){
    const allUsed = t.tiles.every(x=>x.used);
    const ready = allUsed && !t.bonusDone && !t.finished && t.scoreIndex === 10;
    bonusBtn.disabled = !ready;
    bonusBtn.classList.toggle('bonus-ready', ready);
    bonusBtn.classList.toggle('glow', ready);
  }
  const wa=document.getElementById('btn-walk'); if(wa) wa.disabled=!!t.finished;
}

// ===== Question & Bonus flow =====
let answerRevealed=false;
// (legacy) openQuestion kept for compatibility, but board uses openSubjectPicker now.
function openQuestion(tileIndex){
  const t=currentTeam(); if(!t || t.finished) return;
  const tile=t.tiles[tileIndex];
  // If a subject is already attached to the tile, use it; otherwise invoke picker
  if(tile.subject){
    const qa=pickQuestion(t,tile.subject,tile.grade);
  t.currentQ={ tileIndex, subject:tile.subject, grade:tile.grade, q:qa.q, a:qa.a, revealed:false, bonus:false };
  if (qa.choices) t.currentQ.choices = qa.choices;
  saveState(); goTo('question.html');
  } else {
    openSubjectPicker(tileIndex);
  }
}
function startBonus(){
  const t=currentTeam(); if(!t || t.finished) return;
  const subs=Object.keys(questionBank).filter(s=>(questionBank[s]||[]).some(q=>q.grade===5));
  const subject=subs[Math.floor(Math.random()*subs.length)] || 'Science';
  const qa=pickQuestion(t,subject,5);
  t.currentQ={ tileIndex:null, subject, grade:5, q:qa.q, a:qa.a, revealed:false, bonus:true };
  if (qa.choices) t.currentQ.choices = qa.choices;
  saveState(); goTo('question.html');
}
function updateTeamMoney(){
  const t=currentTeam(); if(!t) return;
  const moneyEl = document.getElementById('team-money');
  if(!moneyEl) return;
  let moneyStr = typeof fmtMoney === 'function' ? fmtMoney(t.scoreIndex || 0) : ('$'+((t.scoreIndex||0).toLocaleString()));
  moneyEl.textContent = `${t.name || 'Team'}: ${moneyStr}`;
}

function renderQuestion(){
  const t=currentTeam(); if(!t) return;
  const subj=document.getElementById('q-subject'); const txt=document.getElementById('q-text'); const ans=document.getElementById('q-answer');
  const walkBtn=document.getElementById('walk-here');
  const subjectDisplay = t.currentQ.subject.replace(/_/g, ' ');
  subj.textContent = `${t.currentQ.bonus?'$1,000,000 Question — ':''}${subjectDisplay} — Grade ${t.currentQ.grade}`;
  txt.textContent = t.currentQ.q;
  ans.textContent = 'Answer: ' + t.currentQ.a;

  // --- render multiple-choice options if present ---
  const mcWrap = document.getElementById('mc-choices');
  if (mcWrap) {
    const choices = Array.isArray(t.currentQ.choices) ? t.currentQ.choices : null;
    if (choices && choices.length) {
      mcWrap.style.display = 'block';
      mcWrap.innerHTML = choices.map((c, i) => {
        const letter = String.fromCharCode(65 + i);
        // NOTE: host still marks Correct/Incorrect; we do NOT auto-score here
        return `
          <label class="choice">
            <span class="letter">${letter}.</span>
            <input type="radio" name="mc-choice" value="${c}">
            <span class="text">${c}</span>
          </label>`;
      }).join('');
    } else {
      mcWrap.style.display = 'none';
      mcWrap.innerHTML = '';
    }
  }

  answerRevealed = !!t.currentQ.revealed;
  ans.style.display = answerRevealed ? 'block' : 'none';
  if(walkBtn){ walkBtn.disabled = answerRevealed; }

  // Cheats badges on question
  const badgeRow=document.getElementById('q-cheat-badges');
  if(badgeRow){
    badgeRow.innerHTML = ['copy','peek','save'].map(k=>`<span class="badge ${t.cheats[k]?'off':''}">${k}</span>`).join('');
  }
  ['copy','peek','save'].forEach(k=>{ const b=document.getElementById('qcheat-'+k); if(b){ b.disabled=!!t.cheats[k]; } });

  document.onkeydown=(e)=>{
    if(e.key==='r'||e.key==='R') revealAnswer();
    if(e.key==='y'||e.key==='Y') markAnswer(true);
    if(e.key==='n'||e.key==='N') markAnswer(false);
    if(e.key==='c'||e.key==='C') useCheatFromQ('copy');
    if(e.key==='p'||e.key==='P') useCheatFromQ('peek');
    if(e.key==='s'||e.key==='S') useCheatFromQ('save');
    if(e.key==='Escape') goTo('board.html');
    if((e.ctrlKey||e.metaKey)&&e.key==='z'){ e.preventDefault(); undo(); }
    if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))){ e.preventDefault(); redo(); }
  };
  updateTeamMoney();
}
function revealAnswer(){ const t=currentTeam(); if(!t) return; t.currentQ.revealed=true; answerRevealed=true; document.getElementById('q-answer').style.display='block'; playSound('reveal'); saveState(); }
function markAnswer(correct){
  const t=currentTeam(); if(!t) return;

  // Mark tile used (non-bonus)
  if(!t.currentQ.bonus && t.currentQ.tileIndex!=null){ t.tiles[t.currentQ.tileIndex].used=true; }

  // Play sound appropriate to correctness
  playSound(correct ? 'correct' : 'wrong');

  if(correct){
    if(t.currentQ.bonus){
      t.scoreIndex = MONEY.length-1; t.bonusDone = true; t.finished = true; t.won = true;
      saveState(); sessionStorage.setItem('endStatus','win'); return goTo('end.html');
    } else {
      t.scoreIndex = Math.min(t.scoreIndex+1, MONEY.length-2);
      t.questionIndex += 1;
      showToast(`${t.name} advanced to ${fmtMoney(t.scoreIndex)}`);
    }
  } else {
    // Wrong answer: drop to last safe rung and finish
    let safeIndex = 0; SAFE_INDEXES.forEach(si=>{ if(t.scoreIndex>=si) safeIndex=si; });
    t.scoreIndex = safeIndex; t.finished = true;
    saveState(); sessionStorage.setItem('endStatus','lose'); return goTo('end.html');
  }
  saveState(); goTo('board.html');
}
function walkAwayHere(){ if(answerRevealed) return; const t=currentTeam(); if(!t) return; t.finished=true; t.walked=true; playSound('walk'); saveState(); sessionStorage.setItem('endStatus','walk'); goTo('end.html'); }
function walkAwayBoard(){ const t=currentTeam(); if(!t) return; t.finished=true; t.walked=true; playSound('walk'); saveState(); sessionStorage.setItem('endStatus','walk'); goTo('end.html'); }


// ===== Cheats =====
function useCheat(type){
  const t=currentTeam(); if(!t||t.finished) return;
  if(t.cheats[type]){ showToast('Already used.'); return; }
  t.cheats[type]=true; saveState();
  if(type==='peek'){ showToast("Peek used (host reveals teammate's answer)."); }
  if(type==='copy'){ showToast("Copy used (host takes teammate's answer)."); }
  if(type==='save'){ showToast("Save by teammate)."); }
  playSound('cheat');
}
function useCheatFromQ(type){
  useCheat(type);
  const b=document.getElementById('qcheat-'+type); if(b){ b.disabled=true; }
  const badgeRow=document.getElementById('q-cheat-badges');
  if(badgeRow){ const t=currentTeam(); badgeRow.innerHTML=['copy','peek','save'].map(k=>`<span class="badge ${t.cheats[k]?'off':''}">${k}</span>`).join(''); }
}

// ===== Host controls visibility: show only when cursor is near bottom =====
document.addEventListener('mousemove', (e) => {
  const controls = document.querySelector('.host-controls');
  if(!controls) return;
  
  // Show controls if cursor is in bottom 80px of screen
  const distFromBottom = window.innerHeight - e.clientY;
  if(distFromBottom < 80){
    controls.style.opacity = '1';
    controls.style.pointerEvents = 'auto';
  } else {
    controls.style.opacity = '0';
    controls.style.pointerEvents = 'none';
  }
});

// Keep controls visible when hovering over them
document.addEventListener('mouseenter', (e) => {
  if(e.target.closest('.host-controls')){
    const controls = document.querySelector('.host-controls');
    if(controls){
      controls.style.opacity = '1';
      controls.style.pointerEvents = 'auto';
    }
  }
}, true);

// ===== Host controls (hover-based via CSS) =====
(function(){
  function pageName(){ const p=(location.pathname.split('/').pop()||'index.html').toLowerCase(); return p||'index.html'; }
  function markActive(){ const current=pageName(); document.querySelectorAll('.host-controls [data-page]').forEach(btn=>{ const target=(btn.getAttribute('data-page')||'').toLowerCase(); if(target===current){ btn.classList.add('btn-active'); } else { btn.classList.remove('btn-active'); } }); }
  markActive();
  window.addEventListener('DOMContentLoaded', markActive);
})();

// ===== Sounds & Toast =====
let ac; function tone(f=440,d=0.2,t='sine',v=0.2){ try{ ac=ac||new (window.AudioContext||window.webkitAudioContext)(); const o=ac.createOscillator(); const g=ac.createGain(); o.type=t; o.frequency.value=f; g.gain.value=v; o.connect(g); g.connect(ac.destination); o.start(); setTimeout(()=>o.stop(), d*1000);}catch(e){} }
function playSound(k){ if(k==='correct'){ tone(660,0.12,'sine',0.2); setTimeout(()=>tone(880,0.15,'sine',0.2),120); } if(k==='wrong'){ tone(220,0.25,'square',0.25); setTimeout(()=>tone(180,0.25,'square',0.25),250); } if(k==='reveal'){ tone(520,0.18,'triangle',0.2); } if(k==='cheat'){ tone(400,0.12,'sine',0.2); } if(k==='walk'){ tone(300,0.15,'sine',0.2); } }
function showToast(msg){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2200); }

// ===== Global keyboard shortcuts for Undo/Redo =====
(function(){
  function isEditable(el){ if(!el) return false; const tag=(el.tagName||'').toLowerCase(); if(tag==='input'||tag==='textarea') return true; if(el.isContentEditable) return true; return false; }
  document.addEventListener('keydown',(e)=>{
    if(isEditable(document.activeElement)) return;
    const ctrl=e.ctrlKey||e.metaKey; if(!ctrl) return;
    if(e.key.toLowerCase()==='z' && !e.shiftKey){ e.preventDefault(); try{ undo(); }catch(_){}};
    if(e.key.toLowerCase()==='y' || (e.key.toLowerCase()==='z' && e.shiftKey)){ e.preventDefault(); try{ redo(); }catch(_){}};
  }, {capture:true});
})();

// ===== Enter to add team on Home =====
window.addEventListener('DOMContentLoaded', ()=>{
  const inp=document.getElementById('teamName');
  if(inp){ inp.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTeam(inp.value); inp.value=''; } }); }
});

// ===== Subject Picker (choose subject after clicking a grade) =====
let _pendingTileIndex = null;
function openSubjectPicker(tileIndex){
  const t=currentTeam(); if(!t || t.finished) return;
  _pendingTileIndex = tileIndex;
  const tile = t.tiles[tileIndex];
  const subjects = Object.keys(questionBank).filter(s => (questionBank[s]||[]).some(q=>q.grade===tile.grade));
  
  // Update the grade/subject display at the bottom
  const displayDiv = document.getElementById('currentGradeSubject');
  if(displayDiv){
    if(isRandomSubjectsEnabled() && tile.subject){
      const subjectDisplay = tile.subject.replace(/_/g, ' ');
      displayDiv.textContent = `Grade: ${tile.grade} | Subject: ${subjectDisplay}`;
    } else {
      displayDiv.textContent = `Grade: ${tile.grade} | Subject: --`;
    }
  }
  
  // If random mode and subject is already assigned, use it directly
  if(isRandomSubjectsEnabled() && tile.subject && subjects.length){
    chooseSubject(tile.subject);
    return;
  }
  
  // Otherwise show the subject picker
  const wrap = document.getElementById('subjectButtons');
  if(wrap){
    wrap.innerHTML = subjects.map(s=>{
      const displayName = s.replace(/_/g, ' ');
      return `<button class="btn btn-primary" onclick="chooseSubject('${s.replace(/'/g,"\\'")}')">${displayName}</button>`;
    }).join('');
  }
  const modal = document.getElementById('subjectPicker');
  if(modal){ modal.style.display='flex'; }
}
function closeSubjectPicker(){
  const modal = document.getElementById('subjectPicker'); if(modal){ modal.style.display='none'; }
  _pendingTileIndex = null;
}
function chooseSubject(subject){
  const t=currentTeam(); if(!t || t.finished || _pendingTileIndex==null) return;
  const tile = t.tiles[_pendingTileIndex];
  // (optional) lock subject onto tile for record-keeping
  tile.subject = subject;
  const qa = pickQuestion(t, subject, tile.grade);
  t.currentQ = { tileIndex:_pendingTileIndex, subject, grade:tile.grade, q:qa.q, a:qa.a, revealed:false, bonus:false };
  if (qa.choices) t.currentQ.choices = qa.choices;
  saveState();
  closeSubjectPicker();
  goTo('question.html');
}
// ESC to close modal
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){
    const modal = document.getElementById('subjectPicker');
    if(modal && modal.style.display==='flex'){ e.preventDefault(); closeSubjectPicker(); }
  }
});

// ===== Custom Questions Upload & Management =====
const CUSTOM_QUESTIONS_KEY = "smarter5_custom_questions_v1";
const RANDOM_SUBJECTS_KEY = "smarter5_random_subjects_enabled";
let pendingQuestionsToAdd = []; // Buffer for questions before submit

function loadRandomSubjectsSetting(){
  const btn = document.getElementById('randomSubjectsBtn');
  if(btn){
    const enabled = isRandomSubjectsEnabled();
    btn.textContent = `🎲 Random Subjects: ${enabled ? 'ON' : 'OFF'}`;
    btn.classList.toggle('btn-active', enabled);
    btn.style.fontWeight = 'bold';
  }
}

function assignRandomSubjectToTile(tile){
  const allSubjects = Object.keys(questionBank);
  const subjectsWithGrade = allSubjects.filter(s => (questionBank[s]||[]).some(q=>q.grade===tile.grade));
  const availableSubjects = subjectsWithGrade.length > 0 ? subjectsWithGrade : allSubjects;
  if(availableSubjects.length){
    tile.subject = availableSubjects[Math.floor(Math.random()*availableSubjects.length)];
  }
}

function toggleRandomSubjects(){
  const currentState = isRandomSubjectsEnabled();
  const newState = !currentState;
  localStorage.setItem(RANDOM_SUBJECTS_KEY, newState ? 'true' : 'false');

  const btn = document.getElementById('randomSubjectsBtn');
  if(btn){
    btn.textContent = `🎲 Random Subjects: ${newState ? 'ON' : 'OFF'}`;
    btn.classList.toggle('btn-active', newState);
  }

  updateSettingsStatus();
  // Reload to regenerate tiles with or without subjects
  setTimeout(() => location.reload(), 300);
}

function isRandomSubjectsEnabled(){
  return localStorage.getItem(RANDOM_SUBJECTS_KEY) === 'true';
}

function updateSettingsStatus(){
  const statusDiv = document.getElementById('settingsStatus');
  if(!statusDiv) return;
  
  const randomEnabled = isRandomSubjectsEnabled();
  let customCount = 0;
  try {
    const customQ = JSON.parse(localStorage.getItem(CUSTOM_QUESTIONS_KEY) || '{}');
    Object.keys(customQ).forEach(subject => {
      customCount += (customQ[subject]||[]).length;
    });
  } catch(e){}
  
  const randomStatus = randomEnabled ? '✓ Random Subjects: ON' : '○ Random Subjects: OFF';
  const customStatus = customCount > 0 ? `✓ ${customCount} Custom Question${customCount !== 1 ? 's' : ''} Loaded` : '○ No Custom Questions';
  
  statusDiv.innerHTML = `<div style="display:flex; justify-content:center; gap:1.5rem; flex-wrap:wrap; font-size:0.95rem;">
    <div style="cursor:pointer; padding:0.4rem 0.8rem; border-radius:4px; transition:all 0.2s; ${randomEnabled ? 'background:rgba(255,255,255,0.1);' : ''}" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='${randomEnabled ? 'rgba(255,255,255,0.1)' : ''}'">${randomStatus} <span style="opacity:0.6; font-size:0.85rem;">(click to toggle)</span></div>
    <div>${customStatus}</div>
  </div>`;
}

function loadCustomQuestions(){
  try {
    const stored = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if(stored){
      const customQ = JSON.parse(stored);
      Object.keys(customQ).forEach(subject => {
        if(!questionBank[subject]){
          questionBank[subject] = [];
        }
        questionBank[subject] = questionBank[subject].concat(customQ[subject]);
      });
    }
  } catch(e){
    console.error('Error loading custom questions:', e);
  }
}

// New: Add one question to preview
function addOneQuestion(){
  const subject = document.getElementById('customSubject')?.value?.trim();
  const grade = document.getElementById('customGrade')?.value?.trim();
  const question = document.getElementById('customQuestion')?.value?.trim();
  const answer = document.getElementById('customAnswer')?.value?.trim();
  
  if(!subject || !grade || !question || !answer){
    showStatus(document.getElementById('customQuestionsStatus'), 'Please fill all fields.', 'error');
    return;
  }
  
  pendingQuestionsToAdd.push({ subject, grade: parseInt(grade), question, answer });
  updateQuestionsPreview();
  clearQuestionAnswerOnly();
  showStatus(document.getElementById('customQuestionsStatus'), `✓ ${pendingQuestionsToAdd.length} question${pendingQuestionsToAdd.length !== 1 ? 's' : ''} queued. Add more or click "Save All Questions"!`, 'success');
  setTimeout(() => {
    const status = document.getElementById('customQuestionsStatus');
    if(status) status.style.display = 'none';
  }, 3000);
}

function clearQuestionAnswerOnly(){
  document.getElementById('customQuestion').value = '';
  document.getElementById('customAnswer').value = '';
  document.getElementById('customQuestion').focus();
}

function updateQuestionsPreview(){
  const preview = document.getElementById('questionsPreview');
  const list = document.getElementById('questionsList');
  const count = document.getElementById('previewCount');
  
  if(!preview || !list) return;
  
  if(pendingQuestionsToAdd.length === 0){
    preview.style.display = 'none';
    return;
  }
  
  count.textContent = pendingQuestionsToAdd.length;
  list.innerHTML = pendingQuestionsToAdd.map((q, i) => `
    <div style="padding:0.6rem; background:white; border-radius:4px; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:start;">
      <div style="flex:1;">
        <div style="font-weight:bold; color:#0f8a50;">${q.subject} — Grade ${q.grade}</div>
        <div style="font-size:0.9rem; margin-top:0.3rem;"><strong>Q:</strong> ${q.question}</div>
        <div style="font-size:0.9rem; margin-top:0.2rem;"><strong>A:</strong> ${q.answer}</div>
      </div>
      <button class="btn btn-sm" onclick="removeQuestionFromPreview(${i})" style="padding:0.4rem 0.8rem; margin-left:0.8rem;">×</button>
    </div>
  `).join('');
  
  preview.style.display = 'block';
}

function removeQuestionFromPreview(idx){
  pendingQuestionsToAdd.splice(idx, 1);
  updateQuestionsPreview();
}

function clearQuestionForm(){
  document.getElementById('customSubject').value = '';
  document.getElementById('customGrade').value = '';
  document.getElementById('customQuestion').value = '';
  document.getElementById('customAnswer').value = '';
  document.getElementById('customSubject').focus();
}

function clearAllQuestions(){
  if(confirm('Clear all pending questions?')){
    pendingQuestionsToAdd = [];
    updateQuestionsPreview();
    document.getElementById('customSubject').focus();
  }
}

function submitAllQuestions(){
  if(pendingQuestionsToAdd.length === 0){
    showStatus(document.getElementById('customQuestionsStatus'), 'No questions to add.', 'error');
    return;
  }
  
  const customBank = {};
  pendingQuestionsToAdd.forEach(q => {
    if(!customBank[q.subject]){
      customBank[q.subject] = [];
    }
    customBank[q.subject].push({ grade: q.grade, q: q.question, a: q.answer });
  });
  
  try {
    const existing = JSON.parse(localStorage.getItem(CUSTOM_QUESTIONS_KEY) || '{}');
    Object.keys(customBank).forEach(subject => {
      if(!existing[subject]) existing[subject] = [];
      existing[subject] = existing[subject].concat(customBank[subject]);
    });
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(existing));
    const count = pendingQuestionsToAdd.length;
    pendingQuestionsToAdd = [];
    updateQuestionsPreview();
    updateSettingsStatus();
    showStatus(document.getElementById('customQuestionsStatus'), `✓ Added ${count} question${count !== 1 ? 's' : ''}!`, 'success');
    setTimeout(() => location.reload(), 1500);
  } catch(err){
    showStatus(document.getElementById('customQuestionsStatus'), 'Error saving: ' + err.message, 'error');
  }
}

function clearCustomQuestions(){
  if(confirm('Are you sure you want to delete all custom questions?')){
    localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
    updateSettingsStatus();
    const statusDiv = document.getElementById('customQuestionsStatus');
    if(statusDiv){
      showStatus(statusDiv, '✓ Custom questions cleared.', 'success');
    }
    setTimeout(() => location.reload(), 1500);
  }
}

function showStatus(statusDiv, message, type){
  if(!statusDiv) return;
  statusDiv.style.display = 'block';
  statusDiv.textContent = message;
  statusDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
  statusDiv.style.color = type === 'success' ? '#155724' : '#721c24';
  statusDiv.style.border = `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`;
}

// ===== Fullscreen API toggle =====
function toggleFullscreen(){
  if(!document.fullscreenElement){
    document.documentElement.requestFullscreen().catch(err => {
      console.log('Fullscreen request failed:', err);
    });
  } else {
    document.exitFullscreen().catch(err => {
      console.log('Exit fullscreen failed:', err);
    });
  }
}

// Load custom questions and settings on script init
loadCustomQuestions();

// Initialize random subjects button - runs immediately and on any page load
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', () => {
    loadRandomSubjectsSetting();
    updateSettingsStatus();
  });
} else {
  loadRandomSubjectsSetting();
  updateSettingsStatus();
}

// Also update after a short delay in case DOM wasn't ready
setTimeout(() => {
  loadRandomSubjectsSetting();
  updateSettingsStatus();
}, 100);
loadCustomQuestions();

// Initialize random subjects button - runs immediately and on any page load
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', () => {
    loadRandomSubjectsSetting();
    updateSettingsStatus();
    restoreFullscreen();
  });
} else {
  loadRandomSubjectsSetting();
  updateSettingsStatus();
  restoreFullscreen();
}

// Also update after a short delay in case DOM wasn't ready
setTimeout(() => {
  loadRandomSubjectsSetting();
  updateSettingsStatus();
  handleFullscreenRestore();
}, 100);

// Extra restore check with longer delay
setTimeout(() => {
  handleFullscreenRestore();
}, 400);
