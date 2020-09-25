const fs = require("fs");
const chalk = require("chalk");


const addNote = (title, body) => {
    const notes = loadNotes();
    const duplicateNote = notes.find( (note) => note.title === title);

    debugger

    if(!duplicateNote) {
        notes.push({
            title,
            body
        })
        saveNotes(notes);
        console.log(chalk.green.bold("New note added!"));
    } else {
        console.log(chalk.red.bold("Note title taken!"));
        console.log(chalk.red("Use 'list' command to see all notes"));
    }
}



const removeNote = (title) => {
    const notes = loadNotes();

    const beforeRemoveNote = notes.length;

    notes.forEach((note, index) => {
        if(note.title === title)
            notes.splice(index, 1);
    });

    if(notes.length !== beforeRemoveNote){
        console.log(chalk.green.bold("Note removed!"));
        saveNotes(notes);
    } else{
        let similar = findSimilar(title);
        console.log(chalk.red.bold("No such a note!")); 
        console.log(chalk.red("Use 'list' command to see all notes"));
        if(similar !== undefined)
            console.log(chalk`Did you mean {green.bold ${similar}} ?`);
    }
        
}


const listNotes = () => {
    const notes = loadNotes();

    console.log(chalk.blue.bold.underline("Your notes..."))

    notes.forEach(note =>{
        console.log(chalk`{magenta ${note.title}} - {magenta ${note.body}}`);
    })
}


const readNote = (title) => {
    const notes = loadNotes();
    const findSearchingNote = notes.find(note => note.title === title);

    if(findSearchingNote)
        console.log(chalk`{green.bold ${findSearchingNote.title}} - {green.bold ${findSearchingNote.body}}`);
    else{
        let similar = findSimilar(title);
        console.log(chalk.red.bold("Note not found!"));
        console.log(chalk.red("Use 'list' command to see all notes, to create file use 'add' command."));
        if(similar !== undefined)
            console.log(chalk`Did you mean {green.bold ${similar}} ?`);
    }
}

const saveNotes = (notesArray) => {
    const dataJSON = JSON.stringify(notesArray);
    fs.writeFileSync("notes.json", dataJSON);
}

const loadNotes = () => {
    try {
        const dataBuffer = fs.readFileSync("notes.json");
        const dataString = dataBuffer.toString();
        const allNotes = JSON.parse(dataString);
        return allNotes;
    } catch (e) {
        return [];
    }
}

const findSimilar = (title) => {
    const notes = loadNotes();
    let equivalency = 0;
    let userTitle = title;    // user's title
    let equivalencyMap = new Map();

    for(let i = 0; i < notes.length; i++) {
        let noteTitle = notes[i].title;     // json file's title

        let maxLength = (userTitle.length <= noteTitle.length) ? noteTitle.length : userTitle.length;
        let minLength = (userTitle.length >= noteTitle.length) ? noteTitle.length : userTitle.length;    
        for(let j = 0; j < minLength; j++) {
            if(userTitle[j] === noteTitle[j]) {
                equivalency++;
            }
        }
        let percent = equivalency / maxLength * 100;
        equivalencyMap.set(notes[i].title, percent);
        equivalency = 0;
    }


    equivalencyMap[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((one, two) => two[1] - one[1]);
    }
    try {
        if(Array.from(equivalencyMap)[0][1] !== 0)
            return Array.from(equivalencyMap)[0][0];
    } catch (e) {}
    

}

module.exports = {
    addNote,
    removeNote,
    listNotes,
    readNote
}
