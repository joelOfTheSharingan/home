let recognition;
let listening = false;

const micBtn = document.getElementById("micBtn");

// --- 1. CONTINUOUS AUTO-REFRESH MATRIX (Updates UI Data Array Every 1 Second) ---
async function fetchFarmStatus() {
    try {
        const response = await fetch("http://localhost:3000/status");
        const plants = await response.json();

        // Mapping Logic: 
        // Index 0 -> p2, Index 1 -> p1, Index 2 -> p0
        // Index 3 -> p5, Index 4 -> p4, Index 5 -> p3
        // Index 6 -> p8, Index 7 -> p7, Index 8 -> p6
        const mapping = [2, 1, 0, 5, 4, 3, 8, 7, 6];

        const colorMap = {
            "darkgreen": { bg: "rgba(0, 255, 150, 0.08)", border: "#00ff96", text: "HEALTHY", bar: "#00ff96" },
            "lightgreen": { bg: "rgba(255, 170, 0, 0.08)", border: "#ffaa00", text: "WARNING", bar: "#ffaa00" },
            "yellow": { bg: "rgba(255, 50, 50, 0.08)", border: "#ff3232", text: "CRITICAL", bar: "#ff3232" },
            "missing": { bg: "rgba(255, 255, 255, 0.02)", border: "rgba(255,255,255,0.15)", text: "OFFLINE", bar: "rgba(255,255,255,0.2)" }
        };

        plants.forEach((plant, index) => {
            // Apply the mapping to get the visual position
            const visualIndex = mapping[index];
            const cell = document.getElementById(`p${visualIndex}`);
            
            if (cell) {
                const status = colorMap[plant.health] || colorMap["missing"];
                
                cell.style.background = status.bg;
                cell.style.borderColor = status.border;
                cell.style.boxShadow = `inset 0 0 15px ${status.border}22`;
                
                cell.innerHTML = `
                    <div style="display:flex; justify-content:space-between; font-family:'Share Tech Mono'; font-size:12px; color:rgba(255,255,255,0.4);">
                        <span>SEC_0${visualIndex + 1}</span>
                        <span style="color:${status.border}; font-weight:bold;">${status.text}</span>
                    </div>
                    <div style="font-size:20px; font-weight:900; color:#e0f7f4; margin:10px 0; letter-spacing:1px;">
                        ${plant.health === 'missing' ? 'EMPTY' : plant.health.toUpperCase()}
                    </div>
                    <div style="height:4px; width:100%; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                        <div style="height:100%; width:${plant.health==='missing'?'15%':'100%'}; background:${status.bar}; box-shadow: 0 0 8px ${status.bar};"></div>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error("Dashboard out of sync with backend:", error);
    }
}

setInterval(fetchFarmStatus, 1000);
window.addEventListener("DOMContentLoaded", fetchFarmStatus);


// --- 2. AUDIO RECORDING + BASE64 STREAMING CAPTURE ENGINE ---
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = async (event) => {
        const text = event.results[0][0].transcript;
        console.log("USER:", text);

        try {
            const response = await fetch("http://localhost:3000/speech", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text })
            });

            const data = await response.json();
            console.log("AI TEXT RESPONSE:", data.reply);

            if (data.audio) {
                const audioUrl = `data:audio/mp3;base64,${data.audio}`;
                const audio = new Audio(audioUrl);
                audio.play();
            }

        } catch (err) {
            console.error("Audio pipeline processing failure:", err);
        }
    };

    recognition.onend = () => {
        listening = false;
        micBtn.classList.remove("listening");
        micBtn.innerText = "🎤 Talk to Core AI";
    };

    micBtn.addEventListener("click", () => {
        if (!listening) {
            listening = true;
            micBtn.classList.add("listening");
            micBtn.innerText = "🔴 Core Listening...";
            recognition.start();
        } else {
            recognition.stop();
        }
    });
} else {
    alert("Voice Framework requires Chrome or Edge.");
}