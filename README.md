# Are You Smarter Than a 5th Grader - Digital Game

A fully customizable, interactive game show experience inspired by the TV classic. Play with teams, add your own questions, and use random subject mode for variety.

**Perfect for:** Game shows, parties, classrooms, study groups, trivia nights, or just for fun!

## Features

### Core Gameplay
- **Multiple Teams**: Add and manage unlimited team names. Each team has its own game state, money ladder, and cheats tracking.
- **Money Ladder**: Tracks winnings from $0 up to $1,000,000 with safe zones highlighted (at $25k and $175k by default).
- **Grades & Subjects**: Five grade levels (1-5) with multiple subjects. Each question is difficulty-tiered.
- **Answer Control**: Host controls reveal the correct answer, then marks the team's response as correct or incorrect.
- **Walk Away Option**: Teams can walk away with current earnings before revealing the answer.
- **Bonus Question**: Unlocks after a team reaches the top of the ladder ($1M question).
- **Team Elimination**: Losers and winners see custom end-game messages with images and confetti effects.
- **Undo/Redo**: Full history with keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Y).

### NEW: Custom Question System
- **Add Your Own Questions**: Create questions on the Home page for any subject and grade level.
- **Bulk Submit**: Add as many questions as you want in one session, see them in a preview, and save all at once.
- **Persistent Storage**: Questions are saved in your browser and automatically loaded every time you play.
- **Perfect for Study**: Build custom question banks for exams, language learning, history topics, etc.
- **Quick Workflow**: Subject/Grade stay filled so you can rapidly add multiple questions for the same category.

### NEW: Random Subjects Mode
- **Toggle On/Off**: Click the **🎲 Random Subjects** button in host controls or the settings display on Home.
- **Pre-Assigned Subjects**: When ON, each grade level tile shows a random subject (e.g., "Biology" or "Spanish").
- **Instant Questions**: Click a tile and the question appears immediately—no subject picker needed.
- **Dynamic**: Every refresh regenerates random subjects, keeping gameplay unpredictable.

### Navigation & Controls
- **Host Controls Bar**: Fixed at bottom of screen, appears on hover so it stays out of the way.
- **Settings Display**: Shows current Random Subjects state and how many custom questions are loaded.
- **Home Button Highlight**: Always highlights the active page so you know where you are.
- **Scoreboard**: Real-time tracking of all teams' progress, money, and cheats used.

### Cheats System
- **Copy**: Shows the correct answer (visual aid only).
- **Peek**: Previews the next question without using it.
- **Save**: Saves the current question for later use.
- Each can be used **once per team** and then disables.

---

## How to Use

### 1. Getting Started
- Open `index.html` (or `splash.html`) in your browser
- Replace `smarterLogo.png` with your own branding if desired
- Audio will auto-play after first interaction

### 2. Adding Teams
On the Home page:
- Type a team name
- Press **Enter** or click **"Add Team"**
- Add as many teams as you need

### 3. Adding Custom Questions (Optional)
On the Home page, scroll to **"📚 Add Custom Questions"**:

**Simple 4-step process:**
1. Enter a **Subject** (e.g., "Biology", "Spanish", "US History")
2. Pick a **Grade Level** (1-5)
3. Type the **Question**
4. Type the **Answer**
5. Click **"+ Add Question"** to queue it
6. **Repeat** for as many questions as you want
7. When done, click **"✓ Save All Questions"** to save all at once

**Pro tips:**
- Subject and Grade stay filled — just change Question/Answer for rapid entry
- See all pending questions in the preview section below
- Use **Ctrl+Enter** (or **Cmd+Enter** on Mac) to submit all at once
- Click the **×** button to remove any question before saving
- Questions are saved in your browser permanently until you delete them

### 4. Random Subjects Mode
On Home page or any game page:
- Look for **🎲 Random Subjects: OFF** in the host controls (bottom)
- Or click the **settings display** at the top of the Home page
- Toggle to **ON** to enable—page will refresh with random subjects assigned
- Each tile now shows both **Grade** (top) and **Subject** (bottom)

### 5. Playing the Game
- Click a grade/subject tile to get a question
- In Random Subjects mode, the question appears instantly
- In normal mode, pick a subject from the modal
- Host reveals the answer (click **"Reveal Answer"** or press **R**)
- Host marks it **Correct** (Y) or **Incorrect** (N)
- Team can use cheats (C, P, S) if available
- Team can **Walk Away** before the answer is revealed
- Move to the next team when done

### 6. Winning / Losing
- All teams finish their questions
- Last team shows end screen with their result ("smarter" or "not smarter")
- Return to Home via host controls to see the Scoreboard

---

## Keyboard Shortcuts

### Game Control
- **R** → Reveal Answer
- **Y** → Mark Correct
- **N** → Mark Incorrect
- **C** → Use Copy cheat
- **P** → Use Peek cheat
- **S** → Use Save cheat
- **Esc** → Back / Close modals

### Navigation & History
- **Ctrl/Cmd+Z** → Undo
- **Ctrl/Cmd+Y** or **Shift+Ctrl/Cmd+Z** → Redo

### Question Entry (Home page)
- **Ctrl/Cmd+Enter** → Submit all pending custom questions
- **Enter** (in team name field) → Add team

---

## Use Cases

| Use Case | How To Use |
|----------|-----------|
| **Classroom Test** | Add subject-specific questions → Turn ON Random Subjects for variety |
| **Study Group** | Build custom questions for upcoming exams → Study mode gameplay |
| **Language Learning** | Add vocabulary/grammar questions in your target language |
| **Trivia Night** | Mix default questions with custom ones for local/pop culture themes |
| **Party Game** | Add funny inside jokes, movie quotes, or local history facts |
| **Corporate Training** | Create industry-specific question banks by subject |

---

## Customization

### Easy: Use the Built-in Form
Use the **"📚 Add Custom Questions"** section on the Home page—no coding required!

### Advanced: Edit Source Questions
Edit `expanded_questions.js` to modify or add more built-in questions.  
Structure: `Subject → Grade → [{ q: "question", a: "answer" }]`

---

## Settings & Data

- All game progress, settings, and custom questions are saved in your **browser's localStorage**
- No cloud accounts or external servers required
- **Data persists** until you clear browser storage or use the **"Delete All Custom Questions"** button
- Each browser/device is independent

### Clearing Data
- **Custom Questions Only**: Click **"🗑️ Delete All Custom Questions"** on Home page
- **Everything**: Use your browser's "Clear Site Data" in DevTools, or click **"Restart"** button on Home page

---

## Browser Compatibility
- ✅ Google Chrome (recommended)
- ✅ Microsoft Edge
- ✅ Firefox
- ✅ Safari
- ⚠️ Mobile browsers (works but optimized for desktop/TV)

---

## Tips & Tricks

1. **Full Screen**: Press **F11** for fullscreen, great for projectors
2. **Multiple Monitors**: Cast to your TV for audience viewing
3. **Rapid Scoring**: Use keyboard shortcuts (R, Y, N) for speedier gameplay
4. **Study Prep**: Pre-load custom questions before your study group arrives
5. **Mix Modes**: Use default questions + custom questions together
6. **Backup**: Export your custom questions by copying from browser DevTools if needed

---

## Technical Details

- Pure HTML/CSS/JavaScript—no external dependencies
- 100% offline—runs entirely in your browser
- Responsive design—works on desktop and tablets
- localStorage API for persistence
- No tracking, no analytics, no data collection

---

## License & Credits

© 2025 - Built for educational and entertainment use.

**Inspired by:** "Are You Smarter than a 5th Grader?" (TV show)  
**Built for:** Battle Ground 1st Ward & friends (with love from the team)

---

## Troubleshooting

**Questions not saving?**  
→ Check browser storage limits or clear some space

**Random Subjects not working?**  
→ Toggle it off/on via the button, refresh page

**Keyboard shortcuts not working?**  
→ Make sure you're not typing in a text field

**Questions missing after refresh?**  
→ Check if browser localStorage is enabled; check Privacy/Incognito mode status

---

Enjoy the game! 🎮
