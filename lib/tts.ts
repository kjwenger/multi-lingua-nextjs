// Text-to-Speech functionality using Web Speech API
export const playTextToSpeech = async (text: string, language: 'english' | 'german' | 'french' | 'italian' | 'spanish'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language codes
    const languageCodes = {
      english: 'en-US',
      german: 'de-DE',
      french: 'fr-FR',
      italian: 'it-IT',
      spanish: 'es-ES'
    };
    
    utterance.lang = languageCodes[language];
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    speechSynthesis.speak(utterance);
  });
};