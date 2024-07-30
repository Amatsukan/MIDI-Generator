document.getElementById('midi-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Captura os valores do formulário
    const scaleInput = document.getElementById('scale').value;
    const octavesInput = document.getElementById('octaves').value;
    const bpm = parseInt(document.getElementById('bpm').value, 10);
    const noteQuantity = parseInt(document.getElementById('note_quantity').value, 10);
    const noteStyle = document.getElementById('note-style').value;

    // Converte a string de notas em um array
    const scale = scaleInput.split(',').map(note => note.trim());
    const octaves = octavesInput.split(',').map(note => note.trim());
    const notes_to_use = create_notes(scale,octaves)
    // Cria o MIDI
    const midi = createMidi(notes_to_use, bpm, noteStyle, noteQuantity);

    // Gera um Blob com o conteúdo MIDI
    const blob = new Blob([midi], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);

    // Cria um link temporário para o download e dispara o clique nele
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'melody.mid';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});
function create_notes(scale, octaves){
    let notes = []
    octaves.forEach(octave => {
        scale.forEach(note => {
            notes.push(note+octave)
        })
    })
    return notes
}
function createMidi(scale, bpm, style, noteQuantity) {
    const track = new MidiWriter.Track();
    track.setTempo(bpm);

    const note_size = {
        arp: ['16'],
        curtas: ['32', '16'],
        medias: ['8', '4'],
        longas: ['2', '1'],
        mistas: ['32', '16', '8', '4', '2', '1']
    };

    // Define note durations based on style
    let durations;
    if (Object.keys(note_size).includes(style)) {
        durations = note_size[style];
    } else {
        throw new Error('Estilo inválido. Use "arp", "curtas", "medias", "longas" ou "mistas".');
    }

    // Generate a melody using the scale
    const melody = [];
    for (let i = 0; i < noteQuantity; i++) {
        const note = scale[Math.floor(Math.random() * scale.length)];
        const duration = durations[Math.floor(Math.random() * durations.length)];
        melody.push({ note, duration });
    }

    // Add the notes to the track
    melody.forEach(item => {
        track.addEvent(new MidiWriter.NoteEvent({ pitch: [item.note], duration: item.duration }));
    });

    console.log(melody);  // Debug statement to check the generated notes and durations

    // Create a write instance and return the track data
    const writer = new MidiWriter.Writer(track);
    return writer.buildFile();  // Build and return the MIDI file
}