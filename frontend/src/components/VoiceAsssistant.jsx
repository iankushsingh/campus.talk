import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const BACKEND_RASA_URL = 'http://localhost:5005/webhooks/rest/webhook'; // if using rasa REST webhook
const BACKEND_WEBHOOK = 'http://localhost:4000/webhook/rasa'; // if sending to our express webhook

export default function VoiceAssistant() {
    const { transcript, listening, resetTranscript } = useSpeechRecognition();
    const [responseText, setResponseText] = useState('');

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return <div>Your browser does not support speech recognition.</div>;
    }

    async function sendToNLP(text) {
        // Option A: send to Rasa REST webhook
        try {
            // If you use Rasa REST input:
            // const res = await fetch(BACKEND_RASA_URL, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ sender: 'user1', message: text })
            // });
            // const data = await res.json(); // Rasa returns list
            // handle Rasa response...

            // Option B: send directly to our express webhook (simple)
            const res = await fetch(BACKEND_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ intent: text.includes('timetable') ? 'timetable' : text, user_id: 1 })
            });
            const json = await res.json();
            const txt = json.text || JSON.stringify(json);
            setResponseText(txt);
            speakText(txt);
        } catch (err) {
            console.error(err);
            setResponseText('Error fetching response');
        }
    }

    function speakText(text) {
        if (!window.speechSynthesis) return;
        const ut = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(ut);
    }

    return (
        <div style={{ padding: 20 }}>
            <h3>Voice Assistant</h3>
            <div>
                <button onClick={() => { resetTranscript(); SpeechRecognition.startListening({ continuous: true }); }}>
                    Start Listening
                </button>
                <button onClick={() => { SpeechRecognition.stopListening(); sendToNLP(transcript); }}>
                    Stop & Send
                </button>
                <button onClick={() => { resetTranscript(); setResponseText(''); }}>
                    Reset
                </button>
            </div>

            <div style={{ marginTop: 10 }}>
                <b>Listening:</b> {listening ? 'Yes' : 'No'} <br />
                <b>Transcript:</b> {transcript} <br />
                <b>Response:</b> {responseText}
            </div>
        </div>
    );
}
