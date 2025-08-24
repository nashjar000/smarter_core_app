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
}
function undo(){ if(!undoStack.length) return; redoStack.push(clone(state)); state=undoStack.pop(); persistStacks(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); location.reload(); }
function redo(){ if(!redoStack.length) return; undoStack.push(clone(state)); state=redoStack.pop(); persistStacks(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); location.reload(); }
loadState();

// ===== Money ladder & safe zones =====
const MONEY = [0,1000,2000,5000,10000,25000,50000,100000,175000,300000,500000,1000000];
const SAFE_INDEXES = [1,5];
const fmtMoney = idx => '$'+MONEY[idx].toLocaleString();

// ===== Expanded question bank (sample) =====
let questionBank = {
  Math: [
    // Grade 1
    {grade:1,q:"What is 7 + 5?",a:"12"},
    {grade:1,q:"If you have 3 apples and get 2 more, how many do you have?",a:"5"},
    {grade:1,q:"What number comes after 19?",a:"20"},
    {grade:1,q:"Which is bigger: 9 or 6?",a:"9"},
    {grade:1,q:"How many sides does a square have?",a:"4"},
    {grade:1,q:"True or False: Zero is an even number.",a:"True"},
    {grade:1,q:"What is 10 − 7?",a:"3"},
    {grade:1,q:"If you see this equation: 2 + __ = 8, what number goes in the blank?",a:"6"},
    {grade:1,q:"What shape has 3 corners and 3 sides?",a:"Triangle"},
    {grade:1,q:"One dime is worth how many cents?",a:"10"},

    // Grade 2
    {grade:2,q:"What is 25 ÷ 5?",a:"5"},
    {grade:2,q:"Which is greater: 43 or 34?",a:"43"},
    {grade:2,q:"How many inches are in a foot?",a:"12"},
    {grade:2,q:"If you buy 2 pencils for 15¢ each, how much do you spend?",a:"30¢"},
    {grade:2,q:"What is 8 × 6?",a:"48"},
    {grade:2,q:"Which is longer: one yard or one foot?",a:"One yard"},
    {grade:2,q:"You read 12 pages on Monday and 15 on Tuesday. How many pages total?",a:"27"},
    {grade:2,q:"True or False: 100 is an odd number.",a:"False"},
    {grade:2,q:"What is half of 50?",a:"25"},
    {grade:2,q:"Which is heavier: 1 pound of feathers or 1 pound of rocks?",a:"They weigh the same"},

    // Grade 3
    {grade:3,q:"What is 144 ÷ 12?",a:"12"},
    {grade:3,q:"Perimeter of a square with side length 8?",a:"32"},
    {grade:3,q:"If you cut a pizza into 8 slices and eat 3, what fraction is left?",a:"5/8"},
    {grade:3,q:"What is 3/6 simplified?",a:"1/2"},
    {grade:3,q:"A farmer has 24 cows. If he sells 6, how many remain?",a:"18"},
    {grade:3,q:"What is the value of the digit 7 in 472?",a:"70"},
    {grade:3,q:"True or False: 9 × 9 = 99.",a:"False"},
    {grade:3,q:"Solve: 15 + 27",a:"42"},
    {grade:3,q:"If a book costs $8 and you pay with a $10 bill, how much change?",a:"$2"},
    {grade:3,q:"What is 1/4 of 100?",a:"25"},

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
    {grade:5,q:"The average of 12, 18, and 24 is…?",a:"18"}
  ],
  Science: [
  // ===== Grade 1 =====
  {grade:1,type:"short",q:"What do plants need from the Sun to make food?",a:"Sunlight"},
  {grade:1,type:"mc",q:"Which sense do you use to smell a flower?",choices:["Taste","Smell","Hearing"],a:"Smell"},
  {grade:1,type:"tf",q:"True or False: The Sun is a star.",a:"True"},
  {grade:1,type:"short",q:"What falls from the sky on a rainy day?",a:"Rain"},
  {grade:1,type:"short",q:"What do we call baby cats?",a:"Kittens"},
  {grade:1,type:"mc",q:"Which one lives in water and has gills?",choices:["Frog","Fish","Dog"],a:"Fish"},
  {grade:1,type:"short",q:"What body part do you use to hear?",a:"Ears"},
  {grade:1,type:"tf",q:"True or False: A tree’s roots grow underground.",a:"True"},
  {grade:1,type:"mc",q:"Which is a season of the year?",choices:["Blue","Autumn","Circle"],a:"Autumn"},
  {grade:1,type:"short",q:"What do bees make?",a:"Honey"},

  // ===== Grade 2 =====
  {grade:2,type:"short",q:"Animals that eat only meat are called what?",a:"Carnivores"},
  {grade:2,type:"short",q:"Water turning into ice is called what?",a:"Freezing"},
  {grade:2,type:"mc",q:"Which gas do plants take in to make food?",choices:["Oxygen","Carbon dioxide","Helium"],a:"Carbon dioxide"},
  {grade:2,type:"tf",q:"True or False: All insects have six legs.",a:"True"},
  {grade:2,type:"short",q:"What do you call the change from caterpillar to butterfly?",a:"Metamorphosis"},
  {grade:2,type:"mc",q:"Which is a habitat?",choices:["Forest","Triangle","Quarter"],a:"Forest"},
  {grade:2,type:"short",q:"The process of a liquid turning to gas is called…",a:"Evaporation"},
  {grade:2,type:"tf",q:"True or False: The heart’s job is to pump blood.",a:"True"},
  {grade:2,type:"short",q:"Which body part helps you smell?",a:"Nose"},
  {grade:2,type:"mc",q:"Which is the main source of light for Earth?",choices:["The Moon","The Sun","Lightning"],a:"The Sun"},

  // ===== Grade 3 =====
  {grade:3,type:"short",q:"What is the largest planet in our solar system?",a:"Jupiter"},
  {grade:3,type:"short",q:"Water droplets forming on a cold cup is an example of what process?",a:"Condensation"},
  {grade:3,type:"tf",q:"True or False: The Moon is a planet.",a:"False"},
  {grade:3,type:"short",q:"Animals that eat only plants are called what?",a:"Herbivores"},
  {grade:3,type:"mc",q:"Which layer is at the center of Earth?",choices:["Crust","Mantle","Core"],a:"Core"},
  {grade:3,type:"short",q:"At what Fahrenheit temperature does water boil?",a:"212"},
  {grade:3,type:"short",q:"Birds have what covering on their bodies?",a:"Feathers"},
  {grade:3,type:"mc",q:"Which simple machine is a see-saw?",choices:["Lever","Wedge","Screw"],a:"Lever"},
  {grade:3,type:"tf",q:"True or False: A solid can change to a liquid when heated.",a:"True"},
  // Story problem
  {grade:3,type:"short",q:"A plant has a stem, roots, and leaves. Which part mostly absorbs water from the soil?",a:"Roots"},

  // ===== Grade 4 =====
  {grade:4,type:"short",q:"Plants release which gas during photosynthesis?",a:"Oxygen"},
  {grade:4,type:"short",q:"What is the hardest substance in the human body?",a:"Tooth enamel"},
  {grade:4,type:"mc",q:"Which part of the cell holds genetic material?",choices:["Nucleus","Ribosome","Cell wall"],a:"Nucleus"},
  {grade:4,type:"tf",q:"True or False: Sound travels faster than light.",a:"False"},
  {grade:4,type:"short",q:"Water vapor turning back into liquid is called…",a:"Condensation"},
  // Story problem
  {grade:4,type:"short",q:"A shadow grows longer when the Sun is lower in the sky. When are shadows usually longest?",a:"Morning or late afternoon"},
  {grade:4,type:"mc",q:"White blood cells mainly help your body by…",choices:["Carrying oxygen","Fighting infection","Digesting food"],a:"Fighting infection"},
  {grade:4,type:"short",q:"Energy from the Sun is called what kind of energy?",a:"Solar energy"},
  {grade:4,type:"tf",q:"True or False: A vertebrate has a backbone.",a:"True"},
  {grade:4,type:"short",q:"The basic unit of life is the…",a:"Cell"},

  // ===== Grade 5 =====
  {grade:5,type:"short",q:"H2O is the chemical formula for what?",a:"Water"},
  {grade:5,type:"short",q:"Cell structures that produce energy are called…",a:"Mitochondria"},
  {grade:5,type:"tf",q:"True or False: Water expands when it freezes.",a:"True"},
  {grade:5,type:"short",q:"Plants losing water through their leaves is called…",a:"Transpiration"},
  {grade:5,type:"mc",q:"Which resource is renewable?",choices:["Coal","Oil","Wind"],a:"Wind"},
  // Story problem
  {grade:5,type:"short",q:"A scientist dissolves salt in warm water faster than in cold water. What variable is helping the salt dissolve?",a:"Temperature (heat)"},
  {grade:5,type:"short",q:"What force pulls objects toward Earth’s center?",a:"Gravity"},
  {grade:5,type:"mc",q:"Which two planets are known as gas giants?",choices:["Mercury & Venus","Jupiter & Saturn","Earth & Mars"],a:"Jupiter & Saturn"},
  {grade:5,type:"short",q:"The path Earth takes around the Sun is called its…",a:"Orbit"},
  {grade:5,type:"tf",q:"True or False: In a food chain, producers make their own food.",a:"True"}
],
  History: [
  // ===== Grade 1 =====
  {grade:1,type:"short",q:"Who was the first President of the United States?",a:"George Washington"},
  {grade:1,type:"short",q:"What ship carried the Pilgrims to America in 1620?",a:"The Mayflower"},
  {grade:1,type:"mc",q:"Who is known as the 'Father of Our Country'?",choices:["Abraham Lincoln","George Washington","Thomas Jefferson"],a:"George Washington"},
  {grade:1,type:"tf",q:"True or False: The Statue of Liberty was a gift from France.",a:"True"},
  {grade:1,type:"short",q:"Who is on the penny?",a:"Abraham Lincoln"},
  {grade:1,type:"short",q:"In which month do Americans celebrate Independence Day?",a:"July"},
  {grade:1,type:"mc",q:"What do we call the first people who lived in America?",choices:["Pilgrims","Native Americans","Colonists"],a:"Native Americans"},
  {grade:1,type:"short",q:"Who was the first First Lady of the United States?",a:"Martha Washington"},
  {grade:1,type:"tf",q:"True or False: The American flag has 50 stars.",a:"True"},
  {grade:1,type:"short",q:"Who is known for riding at midnight to warn the colonists the British were coming?",a:"Paul Revere"},

  // ===== Grade 2 =====
  {grade:2,type:"short",q:"Who wrote the Declaration of Independence?",a:"Thomas Jefferson"},
  {grade:2,type:"short",q:"Who was the 16th President of the United States?",a:"Abraham Lincoln"},
  {grade:2,type:"mc",q:"The Pilgrims landed at which famous rock?",choices:["Plymouth Rock","Liberty Rock","Freedom Rock"],a:"Plymouth Rock"},
  {grade:2,type:"tf",q:"True or False: The Civil War was fought between the North and South.",a:"True"},
  {grade:2,type:"short",q:"What year did Christopher Columbus sail to the Americas?",a:"1492"},
  {grade:2,type:"short",q:"What document begins with 'We the People'?",a:"The U.S. Constitution"},
  {grade:2,type:"mc",q:"Who was the first President to live in the White House?",choices:["John Adams","George Washington","Thomas Jefferson"],a:"John Adams"},
  {grade:2,type:"short",q:"What Native American woman helped the Pilgrims survive?",a:"Squanto (or Pocahontas depending on context)"},
  {grade:2,type:"tf",q:"True or False: The Liberty Bell is located in New York City.",a:"False (Philadelphia)"},
  {grade:2,type:"short",q:"What holiday celebrates the end of slavery in the U.S.?",a:"Juneteenth"},

  // ===== Grade 3 =====
  {grade:3,type:"short",q:"What war was fought between the North and South regions of the United States?",a:"The Civil War"},
  {grade:3,type:"short",q:"Who discovered electricity with a kite and a key?",a:"Benjamin Franklin"},
  {grade:3,type:"mc",q:"Which U.S. President is on Mount Rushmore?",choices:["John F. Kennedy","George Washington","Barack Obama"],a:"George Washington"},
  {grade:3,type:"short",q:"Who was the first African American President of the U.S.?",a:"Barack Obama"},
  {grade:3,type:"tf",q:"True or False: The Revolutionary War was fought against Great Britain.",a:"True"},
  {grade:3,type:"short",q:"Who was the leader of the Civil Rights Movement famous for 'I Have a Dream'?",a:"Martin Luther King Jr."},
  {grade:3,type:"mc",q:"What year did the U.S. declare independence?",choices:["1776","1492","1865"],a:"1776"},
  {grade:3,type:"short",q:"Who was the first man to step on the Moon?",a:"Neil Armstrong"},
  {grade:3,type:"short",q:"Which U.S. President bought the Louisiana Territory?",a:"Thomas Jefferson"},
  {grade:3,type:"tf",q:"True or False: Abraham Lincoln delivered the Gettysburg Address.",a:"True"},

  // ===== Grade 4 =====
  {grade:4,type:"short",q:"Who invented the light bulb?",a:"Thomas Edison"},
  {grade:4,type:"short",q:"Who was President during the Great Depression and World War II?",a:"Franklin D. Roosevelt"},
  {grade:4,type:"mc",q:"The 'Boston Tea Party' was a protest against what?",choices:["Taxes","Slavery","School"],a:"Taxes"},
  {grade:4,type:"short",q:"Who was the first person to circumnavigate the globe?",a:"Ferdinand Magellan (his crew finished it)"},
  {grade:4,type:"short",q:"Who was the first woman to fly solo across the Atlantic Ocean?",a:"Amelia Earhart"},
  {grade:4,type:"tf",q:"True or False: World War I happened before World War II.",a:"True"},
  {grade:4,type:"short",q:"Which U.S. President signed the Emancipation Proclamation?",a:"Abraham Lincoln"},
  {grade:4,type:"mc",q:"What was the name of the ship that sank after hitting an iceberg in 1912?",choices:["Titanic","Mayflower","Santa Maria"],a:"Titanic"},
  {grade:4,type:"short",q:"What famous trail led pioneers westward in the 1800s?",a:"The Oregon Trail"},
  {grade:4,type:"tf",q:"True or False: The Cold War was fought with battles between the U.S. and Soviet Union.",a:"False (mostly political tension)"},

  // ===== Grade 5 =====
  {grade:5,type:"short",q:"In what year did the United States declare independence?",a:"1776"},
  {grade:5,type:"short",q:"Who was the primary author of the U.S. Constitution?",a:"James Madison"},
  {grade:5,type:"mc",q:"The War of 1812 was fought between the U.S. and which country?",choices:["Spain","Great Britain","France"],a:"Great Britain"},
  {grade:5,type:"short",q:"Who was the British king during the American Revolution?",a:"King George III"},
  {grade:5,type:"short",q:"What ancient civilization built the pyramids?",a:"The Egyptians"},
  {grade:5,type:"tf",q:"True or False: The Great Wall of China was built to keep out invaders.",a:"True"},
  {grade:5,type:"short",q:"Who was the first President to be impeached?",a:"Andrew Johnson"},
  {grade:5,type:"mc",q:"Which war ended with the Treaty of Versailles?",choices:["World War I","World War II","The Civil War"],a:"World War I"},
  {grade:5,type:"short",q:"Who was the famous queen of ancient Egypt?",a:"Cleopatra"},
  {grade:5,type:"short",q:"What year did World War II end?",a:"1945"}
],
 Music: [
  // ===== Grade 1 =====
  {grade:1,type:"short",q:"What is a musical note?",a:"A sound with a specific pitch"},
  {grade:1,type:"short",q:"What is rhythm?",a:"The pattern of beats or sounds"},
  {grade:1,type:"mc",q:"Which instrument has keys?",choices:["Guitar","Piano","Drum"],a:"Piano"},
  {grade:1,type:"short",q:"What do you call a song sung by one person?",a:"A solo"},
  {grade:1,type:"short",q:"What do you clap along to in music?",a:"The beat"},
  {grade:1,type:"short",q:"What family of instruments does the trumpet belong to?",a:"Brass"},
  {grade:1,type:"short",q:"What is the opposite of loud in music?",a:"Soft"},
  {grade:1,type:"short",q:"What are the first three letters of the musical alphabet?",a:"A, B, C"},
  {grade:1,type:"short",q:"What do you call the words of a song?",a:"Lyrics"},
  {grade:1,type:"mc",q:"Which is a string instrument?","choices":["Violin","Flute","Drum"],a:"Violin"},

  // ===== Grade 2 =====
  {grade:2,type:"short",q:"What is a melody?",a:"A sequence of notes that is musically satisfying"},
  {grade:2,type:"short",q:"What is an orchestra?",a:"A large group of musicians"},
  {grade:2,type:"short",q:"What family of instruments is the flute in?",a:"Woodwind"},
  {grade:2,type:"short",q:"What does tempo mean?",a:"The speed of the music"},
  {grade:2,type:"short",q:"What is the conductor’s job?",a:"To lead the orchestra"},
  {grade:2,type:"mc",q:"Which is a percussion instrument?",choices:["Drum","Violin","Flute"],a:"Drum"},
  {grade:2,type:"short",q:"What is harmony?",a:"Two or more notes played together"},
  {grade:2,type:"short",q:"What is a duet?",a:"A performance by two people"},
  {grade:2,type:"short",q:"What is the symbol that tells you how high or low to sing or play?",a:"A clef"},
  {grade:2,type:"short",q:"What do you call a short piece of music?",a:"A tune"},

  // ===== Grade 3 =====
  {grade:3,type:"short",q:"What is a symphony?",a:"A long musical work for orchestra"},
  {grade:3,type:"short",q:"Who composed 'The Four Seasons'?",a:"Antonio Vivaldi"},
  {grade:3,type:"short",q:"What does 'forte' mean in music?",a:"Loud"},
  {grade:3,type:"short",q:"What does 'piano' mean in music?",a:"Soft"},
  {grade:3,type:"short",q:"What do you call the horizontal lines that music is written on?",a:"The staff"},
  {grade:3,type:"short",q:"What are sharps and flats called together?",a:"Accidentals"},
  {grade:3,type:"short",q:"What is an opera?",a:"A play set to music and singing"},
  {grade:3,type:"short",q:"What is improvisation in music?",a:"Making up music as you go"},
  {grade:3,type:"mc",q:"Which of these is NOT a brass instrument?","choices":["Trombone","Trumpet","Violin"],a:"Violin"},
  {grade:3,type:"short",q:"What is a choir?",a:"A group of singers"},

  // ===== Grade 4 =====
  {grade:4,type:"short",q:"What is jazz?",a:"A style of music with improvisation"},
  {grade:4,type:"short",q:"Who was Ludwig van Beethoven?",a:"A famous composer"},
  {grade:4,type:"short",q:"What is the difference between major and minor chords?",a:"Major sounds happy, minor sounds sad"},
  {grade:4,type:"short",q:"What is syncopation?",a:"Accents on off-beats"},
  {grade:4,type:"short",q:"What is a scale in music?",a:"A sequence of notes in order"},
  {grade:4,type:"mc",q:"Which is a woodwind instrument?","choices":["Clarinet","Violin","Trumpet"],a:"Clarinet"},
  {grade:4,type:"short",q:"What is a concerto?",a:"A piece for solo instrument and orchestra"},
  {grade:4,type:"short",q:"Who wrote 'The Nutcracker Suite'?",a:"Tchaikovsky"},
  {grade:4,type:"short",q:"What is dynamics in music?",a:"The loudness or softness"},
  {grade:4,type:"short",q:"What is a refrain?",a:"A repeated section of a song"},

  // ===== Grade 5 =====
  {grade:5,type:"short",q:"What is an aria?",a:"A solo song in an opera"},
  {grade:5,type:"short",q:"Who composed 'Eine kleine Nachtmusik'?",a:"Wolfgang Amadeus Mozart"},
  {grade:5,type:"short",q:"What is a symphony orchestra’s largest section?",a:"Strings"},
  {grade:5,type:"short",q:"What is polyphony?",a:"Multiple melodies at the same time"},
  {grade:5,type:"short",q:"What is a time signature?",a:"Numbers that tell beats per measure"},
  {grade:5,type:"short",q:"What is a baton used for?",a:"Conducting"},
  {grade:5,type:"short",q:"What is a sonata?",a:"A composition for one or two instruments"},
  {grade:5,type:"short",q:"Who was Johann Sebastian Bach?",a:"A famous Baroque composer"},
  {grade:5,type:"short",q:"What does 'crescendo' mean?",a:"Gradually getting louder"},
  {grade:5,type:"short",q:"What is a motif in music?",a:"A short recurring musical idea"}
],

  Art: [
  // ===== Grade 1 =====
  {grade:1,type:"short",q:"What colors make purple?",a:"Red and blue"},
  {grade:1,type:"mc",q:"Which of these is a primary color?",choices:["Red","Green","Purple"],a:"Red"},
  {grade:1,type:"short",q:"What tool do you use to paint on paper?",a:"A paintbrush"},
  {grade:1,type:"short",q:"What do you call a picture of yourself?",a:"A self-portrait"},
  {grade:1,type:"short",q:"What shape is a stop sign?",a:"An octagon"},
  {grade:1,type:"short",q:"Mixing red and yellow makes what color?",a:"Orange"},
  {grade:1,type:"short",q:"What do you call the outline of a shape?",a:"A contour"},
  {grade:1,type:"short",q:"What is the opposite of light colors?",a:"Dark colors"},
  {grade:1,type:"short",q:"What is clay used for?",a:"Making sculptures"},
  {grade:1,type:"mc",q:"Which is used to color with wax?","choices":["Crayons","Markers","Paint"],a:"Crayons"},

  // ===== Grade 2 =====
  {grade:2,type:"short",q:"What is a canvas used for?",a:"Painting"},
  {grade:2,type:"short",q:"What are the three primary colors?",a:"Red, blue, yellow"},
  {grade:2,type:"mc",q:"What shape has 3 sides?",choices:["Square","Triangle","Circle"],a:"Triangle"},
  {grade:2,type:"short",q:"What do you call art made by cutting and pasting pieces?",a:"A collage"},
  {grade:2,type:"short",q:"What tool is used to mix paint?",a:"A palette"},
  {grade:2,type:"short",q:"What color do you get when you mix blue and yellow?",a:"Green"},
  {grade:2,type:"short",q:"What is chalk mostly used for in art?",a:"Drawing"},
  {grade:2,type:"short",q:"What do you call colors like pink, orange, and green?",a:"Secondary colors"},
  {grade:2,type:"short",q:"What is sculpture?",a:"Three-dimensional art"},
  {grade:2,type:"short",q:"What do you call a drawing with only pencil shades?",a:"A sketch"},

  // ===== Grade 3 =====
  {grade:3,type:"short",q:"Who painted the Mona Lisa?",a:"Leonardo da Vinci"},
  {grade:3,type:"short",q:"What is perspective in art?",a:"The illusion of depth"},
  {grade:3,type:"short",q:"What colors are opposite on the color wheel called?",a:"Complementary colors"},
  {grade:3,type:"short",q:"What do you call an artist who sculpts?",a:"A sculptor"},
  {grade:3,type:"short",q:"Which artist painted 'Starry Night'?",a:"Vincent van Gogh"},
  {grade:3,type:"short",q:"What is a mural?",a:"A large painting on a wall"},
  {grade:3,type:"short",q:"What does shading show in art?",a:"Light and shadow"},
  {grade:3,type:"short",q:"What do you call very small pieces of art put together to form a larger picture?",a:"Mosaic"},
  {grade:3,type:"mc",q:"Which of these is a warm color?",choices:["Blue","Red","Green"],a:"Red"},
  {grade:3,type:"short",q:"What do you call an artist’s signature on a painting?",a:"A signature"},

  // ===== Grade 4 =====
  {grade:4,type:"short",q:"What is abstract art?",a:"Art that doesn’t represent reality"},
  {grade:4,type:"short",q:"Who painted the ceiling of the Sistine Chapel?",a:"Michelangelo"},
  {grade:4,type:"short",q:"What art style uses tiny dots of color?",a:"Pointillism"},
  {grade:4,type:"short",q:"What is a portrait?",a:"A picture of a person"},
  {grade:4,type:"short",q:"What is a still life?",a:"A drawing or painting of objects"},
  {grade:4,type:"short",q:"What does 'medium' mean in art?",a:"The material used (like paint, clay)"},
  {grade:4,type:"mc",q:"Which is a cool color?","choices":["Orange","Blue","Red"],a:"Blue"},
  {grade:4,type:"short",q:"Which artist is known for cubism?",a:"Pablo Picasso"},
  {grade:4,type:"short",q:"What is balance in art?",a:"How elements are arranged for stability"},
  {grade:4,type:"short",q:"What is symmetry?",a:"When two halves match each other"},

  // ===== Grade 5 =====
  {grade:5,type:"short",q:"What is pop art?",a:"Art based on popular culture"},
  {grade:5,type:"short",q:"Who painted 'The Persistence of Memory'?",a:"Salvador Dalí"},
  {grade:5,type:"short",q:"What does 'impressionism' focus on?",a:"Capturing light and momentary impressions"},
  {grade:5,type:"short",q:"Who was Georgia O’Keeffe famous for painting?",a:"Flowers and nature scenes"},
  {grade:5,type:"short",q:"What is a palette knife used for?",a:"Spreading paint"},
  {grade:5,type:"mc",q:"Which is an element of art?","choices":["Rhythm","Harmony","Color"],a:"Color"},
  {grade:5,type:"short",q:"Who was Frida Kahlo?",a:"A Mexican painter known for self-portraits"},
  {grade:5,type:"short",q:"What is surrealism?",a:"Dreamlike art movement"},
  {grade:5,type:"short",q:"What is negative space in art?",a:"Empty space around objects"},
  {grade:5,type:"short",q:"What is a fresco?",a:"Painting on wet plaster"}
],

  English: [
  // ===== Grade 1 =====
  {grade:1,type:"short",q:"What is the plural of 'mouse'?",a:"Mice"},
  {grade:1,type:"short",q:"What letter comes after C?",a:"D"},
  {grade:1,type:"mc",q:"Which of these is a vowel?",choices:["B","A","S"],a:"A"},
  {grade:1,type:"tf",q:"True or False: A sentence always begins with a capital letter.",a:"True"},
  {grade:1,type:"short",q:"How many letters are in the English alphabet?",a:"26"},
  {grade:1,type:"short",q:"What punctuation mark ends a question?",a:"A question mark"},
  {grade:1,type:"mc",q:"Which of these words is spelled correctly?",choices:["kat","dog","hos"],a:"dog"},
  {grade:1,type:"short",q:"What is the opposite of 'up'?",a:"Down"},
  {grade:1,type:"short",q:"What sound does the 'ph' make in 'phone'?",a:"F"},
  {grade:1,type:"short",q:"What is the first word in this sentence: 'The cat ran fast'?",a:"The"},

  // ===== Grade 2 =====
  {grade:2,type:"short",q:"What is the opposite of 'hot'?",a:"Cold"},
  {grade:2,type:"short",q:"A noun is a…?",a:"A person, place, or thing"},
  {grade:2,type:"mc",q:"Which word needs to be capitalized? 'we went to london.'",choices:["we","london","went"],a:"london"},
  {grade:2,type:"tf",q:"True or False: An adjective describes a noun.",a:"True"},
  {grade:2,type:"short",q:"What is the past tense of 'jump'?",a:"Jumped"},
  {grade:2,type:"short",q:"Which word is misspelled: 'freind, school, dog'?",a:"freind (correct spelling: friend)"},
  {grade:2,type:"mc",q:"Which punctuation ends an exclamation?","choices":[".","?","!"],a:"!"},
  {grade:2,type:"short",q:"What is the base word of 'happily'?",a:"Happy"},
  {grade:2,type:"short",q:"Which word is a verb: 'run, red, cat'?",a:"run"},
  {grade:2,type:"short",q:"How many syllables are in the word 'banana'?",a:"3"},

  // ===== Grade 3 =====
  {grade:3,type:"short",q:"What is the past tense of 'run'?",a:"Ran"},
  {grade:3,type:"short",q:"What punctuation ends a question?",a:"Question mark"},
  {grade:3,type:"mc",q:"Which sentence is correct?",choices:["i went to the park.","I went to the park.","i Went To The Park."],a:"I went to the park."},
  {grade:3,type:"tf",q:"True or False: 'Because' is a conjunction.",a:"True"},
  {grade:3,type:"short",q:"What is the plural of 'child'?",a:"Children"},
  {grade:3,type:"short",q:"What is a synonym for 'happy'?",a:"Joyful"},
  {grade:3,type:"mc",q:"How many words in this sentence should be capitalized: 'my dog is named rover'?",choices:["1","2","3"],a:"2 (My, Rover)"},
  {grade:3,type:"short",q:"What type of word is 'quickly'?",a:"An adverb"},
  {grade:3,type:"short",q:"Which word is spelled correctly: 'definately, definitely, defanitely'?",a:"Definitely"},
  {grade:3,type:"short",q:"What is the root word of 'teacher'?",a:"Teach"},

  // ===== Grade 4 =====
  {grade:4,type:"short",q:"Give an antonym for 'big'.",a:"Small"},
  {grade:4,type:"short",q:"What is a homophone for 'pair'?",a:"Pear"},
  {grade:4,type:"mc",q:"Which sentence uses correct punctuation?","choices":["Its going to rain.","It's going to rain.","Its' going to rain."],a:"It's going to rain."},
  {grade:4,type:"tf",q:"True or False: A paragraph must have at least one sentence.",a:"True"},
  {grade:4,type:"short",q:"What is a simile?",a:"A comparison using 'like' or 'as'"},
  {grade:4,type:"short",q:"What is a metaphor?",a:"A comparison without using like or as"},
  {grade:4,type:"short",q:"What is the plural of 'goose'?",a:"Geese"},
  {grade:4,type:"mc",q:"Which of these is a complete sentence?","choices":["Because I was late.","When the bell rang.","I ate lunch."],a:"I ate lunch."},
  {grade:4,type:"short",q:"Correct the misspelled word: 'definately'.",a:"Definitely"},
  {grade:4,type:"short",q:"What punctuation is used in contractions?",a:"Apostrophe"},

  // ===== Grade 5 =====
  {grade:5,type:"short",q:"What is a haiku?",a:"A poem with 5-7-5 syllables"},
  {grade:5,type:"short",q:"Define metaphor.",a:"A comparison without using like or as"},
  {grade:5,type:"mc",q:"Which word needs to be capitalized: 'george washington was president.'?",choices:["george","washington","president"],a:"george, washington"},
  {grade:5,type:"short",q:"What is the subject of the sentence: 'The dog chased the ball'?",a:"The dog"},
  {grade:5,type:"tf",q:"True or False: A preposition shows the relationship between two words.",a:"True"},
  {grade:5,type:"short",q:"What is an idiom?",a:"A phrase with a meaning different from its literal words (e.g., 'It's raining cats and dogs')"},
  {grade:5,type:"short",q:"What type of sentence gives a command?",a:"Imperative sentence"},
  {grade:5,type:"mc",q:"Which of these is a proper noun?","choices":["city","dog","New York"],a:"New York"},
  {grade:5,type:"short",q:"How many words should be capitalized: 'the statue of liberty is in new york'?",a:"5 (The, Statue, Liberty, New York)"},
  {grade:5,type:"short",q:"What is the difference between a simile and a metaphor?",a:"Simile uses 'like' or 'as'; metaphor does not"}
],
Geography: [
  // ===== Grade 1 =====
  {grade:1,type:"short",q:"What country is directly north of the United States?",a:"Canada"},
  {grade:1,type:"short",q:"What ocean is on the East Coast of the United States?",a:"Atlantic Ocean"},
  {grade:1,type:"mc",q:"Which one is a continent?",choices:["Texas","Europe","California"],a:"Europe"},
  {grade:1,type:"tf",q:"True or False: The equator is an imaginary line around the Earth.",a:"True"},
  {grade:1,type:"short",q:"What is the capital city of the United States?",a:"Washington, D.C."},
  {grade:1,type:"short",q:"Which direction does the Sun rise from?",a:"East"},
  {grade:1,type:"mc",q:"Which of these is the largest?",choices:["City","Country","Continent"],a:"Continent"},
  {grade:1,type:"short",q:"Name one of the Great Lakes.",a:"Lake Superior"},
  {grade:1,type:"tf",q:"True or False: Africa is larger than Europe.",a:"True"},
  {grade:1,type:"short",q:"Which U.S. state is an island chain in the Pacific Ocean?",a:"Hawaii"},

  // ===== Grade 2 =====
  {grade:2,type:"short",q:"What U.S. state is home to the Grand Canyon?",a:"Arizona"},
  {grade:2,type:"short",q:"What is the capital of Texas?",a:"Austin"},
  {grade:2,type:"mc",q:"Which ocean is the largest?",choices:["Atlantic","Indian","Pacific"],a:"Pacific"},
  {grade:2,type:"short",q:"What mountain range runs along the eastern United States?",a:"Appalachian Mountains"},
  {grade:2,type:"tf",q:"True or False: Mount Everest is the tallest mountain on Earth.",a:"True"},
  {grade:2,type:"short",q:"What U.S. state is shaped like a mitten?",a:"Michigan"},
  {grade:2,type:"mc",q:"Which of these is NOT a U.S. state?",choices:["Alaska","Ontario","Florida"],a:"Ontario"},
  {grade:2,type:"short",q:"What continent is Mexico in?",a:"North America"},
  {grade:2,type:"tf",q:"True or False: The Sahara Desert is in South America.",a:"False"},
  {grade:2,type:"short",q:"What river flows through Egypt?",a:"The Nile"},

  // ===== Grade 3 =====
  {grade:3,type:"short",q:"What is the capital of California?",a:"Sacramento"},
  {grade:3,type:"mc",q:"Which two countries share the world’s longest border?",choices:["U.S. & Mexico","U.S. & Canada","Russia & China"],a:"U.S. & Canada"},
  {grade:3,type:"short",q:"What continent is Brazil located on?",a:"South America"},
  {grade:3,type:"tf",q:"True or False: Antarctica has no permanent residents.",a:"True"},
  {grade:3,type:"short",q:"Which U.S. state is the largest by area?",a:"Alaska"},
  {grade:3,type:"short",q:"What is the capital of France?",a:"Paris"},
  {grade:3,type:"mc",q:"Which line divides Earth into the Northern and Southern Hemispheres?",choices:["Prime Meridian","Equator","Tropic of Cancer"],a:"Equator"},
  {grade:3,type:"short",q:"What desert covers much of northern Africa?",a:"The Sahara Desert"},
  {grade:3,type:"tf",q:"True or False: The Amazon River is longer than the Mississippi River.",a:"True"},
  {grade:3,type:"short",q:"What is the smallest continent?",a:"Australia"},

  // ===== Grade 4 =====
  {grade:4,type:"short",q:"Which U.S. river is the longest?",a:"Missouri River"},
  {grade:4,type:"mc",q:"Which country has the most people?",choices:["India","United States","China"],a:"China"},
  {grade:4,type:"short",q:"Which U.S. state has the nickname 'The Sunshine State'?",a:"Florida"},
  {grade:4,type:"tf",q:"True or False: Russia is the largest country in the world by land area.",a:"True"},
  {grade:4,type:"short",q:"Which two continents are entirely in the Southern Hemisphere?",a:"Australia and Antarctica"},
  {grade:4,type:"mc",q:"Which U.S. city is known as the 'Windy City'?",choices:["Chicago","New York","Boston"],a:"Chicago"},
  {grade:4,type:"short",q:"The island of Madagascar belongs to which continent?",a:"Africa"},
  {grade:4,type:"short",q:"What is the capital of Japan?",a:"Tokyo"},
  {grade:4,type:"tf",q:"True or False: The Mississippi River flows into the Pacific Ocean.",a:"False"},
  {grade:4,type:"short",q:"Which continent is known as the 'frozen desert'?",a:"Antarctica"},

  // ===== Grade 5 =====
  {grade:5,type:"short",q:"What is the capital of Canada?",a:"Ottawa"},
  {grade:5,type:"mc",q:"Which African country has Cairo as its capital?",choices:["Egypt","Nigeria","Kenya"],a:"Egypt"},
  {grade:5,type:"short",q:"Which ocean is the Bermuda Triangle located in?",a:"Atlantic Ocean"},
  {grade:5,type:"short",q:"What is the capital of Australia?",a:"Canberra"},
  {grade:5,type:"tf",q:"True or False: Mount Kilimanjaro is in Kenya.",a:"False (it’s in Tanzania)"},
  {grade:5,type:"short",q:"What is the largest desert in the world?",a:"Antarctic Desert"},
  {grade:5,type:"mc",q:"Which country has both the Andes Mountains and the Amazon rainforest?",choices:["Brazil","Chile","Argentina"],a:"Brazil"},
  {grade:5,type:"short",q:"What is the longest river in the world?",a:"The Nile (some argue Amazon)"},
  {grade:5,type:"short",q:"Which line divides the Eastern and Western Hemispheres?",a:"Prime Meridian"},
  {grade:5,type:"tf",q:"True or False: Greenland is considered part of North America.",a:"True"}
],
};

// ===== Teams =====
function makeTeam(name){
  return { name, scoreIndex:0, questionIndex:0, cheats:{copy:false,peek:false,save:false},
    used:{}, tiles:generateTiles(), currentQ:null, finished:false, walked:false, bonusDone:false, won:false };
}
function addTeam(name){ if(!name?.trim()) return; if(!state.teams) state.teams=[]; state.teams.push(makeTeam(name.trim())); state.currentTeamIndex=state.teams.length-1; saveState(); renderTeams(); }
function editTeam(i){ const t=state.teams[i]; if(!t) return; const nv=prompt("Rename team:",t.name); if(nv?.trim()){ t.name=nv.trim(); saveState(); renderTeams(); } }
function clearTeam(i){ if(!confirm("Reset this team's progress?"))return; const t=state.teams[i]; if(!t)return; state.teams[i]=makeTeam(t.name); saveState(); renderTeams(); }
function deleteTeam(i){ if(!confirm("Delete this team?"))return; state.teams.splice(i,1); if(state.currentTeamIndex>=state.teams.length){ state.currentTeamIndex=state.teams.length-1; } saveState(); renderTeams(); }
function resetAll(){ if(!confirm("Restart the entire game? This will remove all teams and progress.")) return; state={teams:[],currentTeamIndex:null,globalUsed:{}}; undoStack=[]; redoStack=[]; persistStacks(); saveState(false); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); location.reload(); }

const gradeClass = g => g===1?'g1':g===2?'g2':g===3?'g3':g===4?'g4':'g5';
function currentTeam(){ return state.teams?.[state.currentTeamIndex] || null; }
function nextTeam(){ if(!state.teams?.length) return; let start = state.currentTeamIndex==null ? -1 : state.currentTeamIndex; for(let i=1;i<=state.teams.length;i++){ const idx=(start+i)%state.teams.length; const t=state.teams[idx]; if(!t.finished){ state.currentTeamIndex=idx; saveState(false); return goTo('board.html'); } } alert("All teams are finished."); }

// ===== Tiles (G5→G1 so grade 1 appears at bottom). Two tiles per grade, NO pre-assigned subject. =====
function generateTiles(){
  const tiles = [];
  for (let g = 5; g >= 1; g--) {
    tiles.push({ grade: g, used: false });
    tiles.push({ grade: g, used: false });
  }
  return tiles;
}

// ===== Unique picker (global & per-team) =====
function pickQuestion(team, subject, grade){
  const pool=(questionBank[subject]||[]).filter(q=>q.grade===grade);
  if(!pool.length) return {q:'(No question found)', a:'(n/a)'};
  const key=subject+'|'+grade;
  if(!team.used[key]) team.used[key]=[];
  if(!state.globalUsed[key]) state.globalUsed[key]=[];
  let idx=-1, guard=0;
  while(guard<200){
    const cand=Math.floor(Math.random()*pool.length);
    if(!team.used[key].includes(cand) && !state.globalUsed[key].includes(cand)){ idx=cand; break; }
    guard++;
  }
  if(idx===-1) idx=0;
  team.used[key].push(idx);
  state.globalUsed[key].push(idx);
  saveState(false);
  return pool[idx];
}

// ===== Navigation =====
function goTo(page, index){ if(typeof index==='number'){ state.currentTeamIndex=index; saveState(false); } window.location.href=page; }

// ===== Renderers =====
function renderTeams(){
  const list=document.getElementById('teams'); if(!list) return; list.innerHTML='';
  (state.teams||[]).forEach((t,i)=>{
    const row=document.createElement('div');
    row.className='team-row'+(t.won?' winner':'');
    const status = t.finished ? (t.walked?'(Walked)':'(Finished)') : '';
    row.innerHTML = `
      <div class="title">${t.name} ${t.won?'🏆':''} ${status}</div>
      <div class="meta">Bank: ${fmtMoney(t.scoreIndex)} &nbsp;|&nbsp; Cheats: 
        <span class="badge ${t.cheats.copy?'off':''}">copy</span>
        <span class="badge ${t.cheats.peek?'off':''}">peek</span>
        <span class="badge ${t.cheats.save?'off':''}">save</span>
      </div>
      <div style="margin-top:.4rem;">
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
  (state.teams||[]).forEach((t,i)=>{
    const cheats=['copy','peek','save'].map(k=>`<span class="badge ${t.cheats[k]?'off':''}">${k}</span>`).join('');
    const disabled=t.finished?'disabled':'';
    const moneyLis = MONEY.map((amt,idx)=>{
      const filled = (idx<=t.scoreIndex) ? 'filled' : '';
      const safe = SAFE_INDEXES.includes(idx) ? 'safe' : '';
      return `<li class="${filled} ${safe}"><span class="money-step"></span><span>$${amt.toLocaleString()}</span></li>`;
    }).join('');
    const card=document.createElement('div');
    card.style.background='#0f8a50'; card.style.margin='12px auto'; card.style.padding='12px'; card.style.borderRadius='12px'; card.style.maxWidth='1000px';
    if(t.won) card.classList.add('winner');
    card.innerHTML = `
      <div class="team-title">${t.name} ${t.won?'<span class="trophy">🏆</span>':''} ${t.finished ? (t.walked?'(Walked)':'(Finished)') : ''}</div>
      <div class="money-vert"><ul>${moneyLis}</ul></div>
      <div style="margin-top:.4rem;">${cheats}</div>
      <div style="margin-top:8px;">
        <button class="btn btn-primary" onclick="goTo('board.html', ${i})" ${disabled}>Play / Resume</button>
      </div>`;
    wrap.appendChild(card);
  });
}

function renderBoard(){
  const t=currentTeam(); if(!t) return;
  document.getElementById('teamNameHeader').innerText = t.name + (t.finished ? (t.walked?' (Walked)':' (Finished)') : '');
  const grid=document.getElementById('grid'); grid.innerHTML='';
  t.tiles.forEach((tile,idx)=>{
    const el=document.createElement('div');
    el.className='tile '+gradeClass(tile.grade)+(tile.used?' used':'');
    el.innerHTML = `Grade ${tile.grade}`; // show ONLY the grade
    if(!tile.used && !t.finished){ el.onclick=()=>openSubjectPicker(idx); }
    grid.appendChild(el);
  });
  const moneyEl=document.getElementById('ladder'); moneyEl.innerHTML='';
  MONEY.forEach((amt,idx)=>{
    const li=document.createElement('li');
    li.className = (idx<=t.scoreIndex?'filled ':'') + (SAFE_INDEXES.includes(idx)?'safe':'');
    li.innerHTML = `<span class="money-step"></span><span>$${amt.toLocaleString()}</span>`;
    moneyEl.appendChild(li);
  });
  ['copy','peek','save'].forEach(k=>{
    const btn=document.getElementById('cheat-'+k);
    if(btn){ btn.disabled=!!t.cheats[k] || t.finished; btn.classList.toggle('btn-secondary', !!t.cheats[k] || t.finished); }
  });
  const bonusBtn=document.getElementById('btn-bonus');
  if(bonusBtn){
    const allUsed = t.tiles.every(x=>x.used);
    bonusBtn.disabled = !(allUsed && !t.bonusDone && !t.finished);
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
  saveState(); goTo('question.html');
}
function renderQuestion(){
  const t=currentTeam(); if(!t) return;
  const subj=document.getElementById('q-subject'); const txt=document.getElementById('q-text'); const ans=document.getElementById('q-answer');
  const walkBtn=document.getElementById('walk-here');
  subj.textContent = `${t.currentQ.bonus?'BONUS — ':''}${t.currentQ.subject} — Grade ${t.currentQ.grade}`;
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

// ===== Host controls (hover reveal handled in CSS); active-page highlight =====
document.addEventListener('mousemove', e=>{
  if(window.innerHeight-e.clientY<50){ document.body.classList.add('show-controls'); }
  else { document.body.classList.remove('show-controls'); }
});
(function(){
  function pageName(){ const p=(location.pathname.split('/').pop()||'index.html').toLowerCase(); return p||'index.html'; }
  function markActive(){ const current=pageName(); document.querySelectorAll('.host-controls [data-page]').forEach(btn=>{ const target=(btn.getAttribute('data-page')||'').toLowerCase(); if(target===current){ btn.classList.add('btn-active'); } else { btn.classList.remove('btn-active'); } }); }
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
  // List all subjects that have questions for this grade
  const subjects = Object.keys(questionBank).filter(s => (questionBank[s]||[]).some(q=>q.grade===tile.grade));
  const wrap = document.getElementById('subjectButtons');
  if(wrap){
    wrap.innerHTML = subjects.map(s=>`<button class="btn btn-primary" onclick="chooseSubject('${s.replace(/'/g,"\\'")}')">${s}</button>`).join('');
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
