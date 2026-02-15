/**
 * Global audio state manager for 30s previews
 */
const playerStore = {
    currentTrack: null,
    audio: new Audio(),
    isPlaying: false,

    // Listeners for UI updates
    listeners: [],

    subscribe(callback) {
        this.listeners.push(callback);
    },

    notify() {
        this.listeners.forEach(cb => cb({
            currentTrack: this.currentTrack,
            isPlaying: this.isPlaying,
            progress: this.audio.currentTime,
            duration: this.audio.duration || 30
        }));
    },

    playPreview(track) {
        console.log("Intentando reproducir:", track.title || track.name);

        // If it's the same track, just toggle
        if (this.currentTrack && this.currentTrack.id === track.id) {
            this.toggle();
            return;
        }

        // New track
        if (this.audio) {
            this.audio.pause();
        }

        if (!track.preview_url) {
            console.error("No hay preview_url disponible para este track", track);
            alert("Preview no disponible para esta canción");
            return;
        }

        this.currentTrack = track;
        this.audio.src = track.preview_url;

        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Reproducción iniciada con éxito");
                this.isPlaying = true;
                this.notify();
            }).catch(error => {
                console.error("Error al intentar reproducir audio:", error);
                this.isPlaying = false;
                this.notify();
                // If blocked by browser policies
                if (error.name === 'NotAllowedError') {
                    alert("El navegador bloqueó la reproducción automática. Por favor, haz clic fuera de este mensaje e intenta de nuevo.");
                }
            });
        }

        // Update progress
        this.audio.ontimeupdate = () => this.notify();
        this.audio.onended = () => {
            console.log("Audio finalizado");
            this.isPlaying = false;
            this.notify();
        };
    },

    toggle() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                }).catch(e => console.error("Error toggle play:", e));
            }
        }
        this.notify();
    },

    setVolume(value) {
        this.audio.volume = value;
    }
};
