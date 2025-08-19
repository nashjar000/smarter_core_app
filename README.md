# Are You Smarter Than a 5th Grader - Digital Game

This is a self-contained HTML/JS/CSS game board inspired by the TV show, adapted for multiple teams playing on one computer.

## Features
- **Multiple Teams**: Add and manage multiple team names. Each team has its own game state, money ladder, and cheats tracking.
- **Cheats**: Copy, Peek, and Save are available. Each can be used once per team. They disable after use and are only visual aids (no auto-correct).
- **Money Ladder**: Tracks winnings from $0 up to $1,000,000 with safe zones highlighted. Ladder is shown on the left of the board.
- **Grades & Subjects**: Each grade level (1st to 5th) has two subjects with randomized questions. Questions are unique per team and not shared across groups.
- **Answer Control**: Host can reveal the correct answer and then mark the team’s response as correct or incorrect.
- **Walk Away Option**: Teams can walk away with current earnings before revealing the answer.
- **Bonus Question**: Unlocks after a team reaches the top of the ladder.
- **Team Elimination**: If a team loses, a popup message declares: “Hi, we’re team [name], and we’re not smarter than a 5th grader.” Winners get the inverse message.
- **Undo/Redo**: Supports undo/redo of host actions via buttons or keyboard shortcuts (Ctrl/Cmd+Z for undo, Ctrl/Cmd+Y or Shift+Cmd+Z for redo).
- **Host Controls**: Floating bar at the bottom (appears on hover) with navigation between Splash, Home, Scoreboard, Board, Question, End, and **Next Team →** (highlighted in yellow).

## How to Use
1. **Open the Game**  
   Extract the ZIP and open `splash.html` in your browser. (Google Chrome or Edge recommended.)

2. **Splash Screen**  
   Replace `smarterLogo.png` with your own logo if desired. Start music will play after your first click.

3. **Add Teams**  
   On the Home screen, type team names and press **Enter** or click Add. Each team gets its own board.

4. **Playing**  
   - Choose a grade/subject to get a random question.  
   - Host reveals the answer, then marks it correct or incorrect.  
   - Cheats may be used once each per team.  
   - Teams can walk away before revealing the answer.  
   - Safe zones protect winnings.  
   - Bonus question appears if they reach the top.

5. **Winning / Losing**  
   Teams eliminated get the popup “not smarter” message. Winners get the “we are smarter” message.

6. **Scoreboard**  
   Tracks all teams’ money progression and cheat usage.

## Keyboard Shortcuts
- **Ctrl/Cmd+Z** → Undo  
- **Ctrl/Cmd+Y** or **Shift+Cmd+Z** → Redo  
- **R** → Mark answer Correct  
- **N** → Mark answer Incorrect  
- **C** → Use Copy  
- **P** → Use Peek  
- **S** → Use Save

## Customizing Questions
All questions are in `expanded_questions.js`.  
- Questions are hardcoded into categories by grade & subject.  
- You can edit or expand this file with your own set.

## Notes
- Designed for casting to a TV or projector (responsive layout).  
- Runs entirely offline in the browser.  
- Best used in Chrome/Edge fullscreen (F11) if desired.  

---
© 2025 - Game built for educational / entertainment use.
