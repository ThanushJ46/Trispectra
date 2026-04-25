import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        vendors: "Vendors",
        scan: "Scan",
        impact: "Impact",
        board: "Ranks"
      },
      home: {
        good_morning: "Good morning",
        good_afternoon: "Good afternoon",
        good_evening: "Good evening",
        making_diff: "You are doing great today!",
        daily_progress: "Daily Progress",
        items_sorted: "{{count}} items sorted.",
        prevented_kg: "You stopped ~{{kg}} kg waste",
        total_points: "Total Points",
        impact_score: "Your score",
        recent_scans: "Recent Scans",
        total: "Total",
        trees_saved: "🌳 {{count}} trees saved",
        bottles_rescued: "♻️ {{count}} bottles",
        kg_diverted: "🗑️ {{count}} kg saved",
        start_sorting: "🌱 Start sorting to get points!",
        ready_to_sort: "Ready to sort waste?",
        scan_next_item: "Scan your waste item.",
        ask_wastewise: "Ask WasteWise"
      },
      vendors: {
        title: "Waste Collectors",
        vendors_nearby: "Collectors Nearby",
        call_now: "📞 Call",
        directions: "📍 Directions",
        loading: "Loading...",
        no_vendors: "No collectors found."
      },
      journey: {
        title: "Your Impact",
        subtitle: "See the difference you make.",
        eco_footprint: "Your Eco-Footprint",
        trees_saved: "Trees Saved",
        bottles_rescued: "Bottles Rescued",
        kg_diverted: "kg Diverted",
        impact_points: "Impact Points",
        progress: "Your Progress",
        progress_text: "You diverted {{kg}} kg of waste. Keep sorting!"
      },
      board: {
        your_rank: "YOUR RANK",
        in_city: "in city",
        total_impact: "TOTAL IMPACT",
        points: "Points",
        top_savers: "Top Savers",
        all_time: "All Time",
        no_rankings: "No rankings yet. Be the first! 🌱",
        pts: "pts",
        you: "You",
        loading: "Loading ranks..."
      },
      chat: {
        title: "Ask WasteWise 🤖",
        placeholder: "Type a message...",
        welcome: "Hi! I can help you with composting tips, waste disposal guidance, or anything about WasteWise. What would you like to know?",
        tips: ["Composting tips", "E-waste near me", "Reduce plastic"],
        reply_compost: "Great question! For effective composting, maintain a ratio of 3 parts brown material to 1 part green. Turn your pile every 3-7 days for faster decomposition. 🌱",
        reply_ewaste: "For e-waste, I recommend checking your local municipal collection drive. Items like phones and laptops contain valuable metals that can be recovered. ♻️",
        reply_plastic: "Great initiative! For plastic reduction, start with single-use items. Carry a reusable bag and bottle. WasteWise can help you find recycling points nearby. 💪",
        reply_default: "That's a great question! Proper waste disposal can reduce landfill waste by up to 60%. Keep tracking your progress — every item counts! 🌍"
      },
      login: {
        welcome: "Welcome",
        join_msg: "Join us today.",
        google_btn: "Login with Google",
        guest_btn: "Login as Guest",
        disabled_msg: "Google Login is off."
      },
      common: {
        loading: "Loading app..."
      }
    }
  },
  hi: {
    translation: {
      nav: {
        home: "होम",
        vendors: "कबाड़ीवाला",
        scan: "स्कैन",
        impact: "स्कोर",
        board: "रैंक"
      },
      home: {
        good_morning: "नमस्ते",
        good_afternoon: "नमस्ते",
        good_evening: "नमस्ते",
        making_diff: "आप बहुत अच्छा कर रहे हैं!",
        daily_progress: "आज का काम",
        items_sorted: "{{count}} आइटम सही किए।",
        prevented_kg: "आपने ~{{kg}} किलो कचरा बचाया",
        total_points: "कुल अंक",
        impact_score: "आपका स्कोर",
        recent_scans: "हाल के स्कैन",
        total: "कुल",
        trees_saved: "🌳 {{count}} पेड़ बचाए",
        bottles_rescued: "♻️ {{count}} बोतलें",
        kg_diverted: "🗑️ {{count}} किलो बचाया",
        start_sorting: "🌱 अंक के लिए काम शुरू करें!",
        ready_to_sort: "कचरा स्कैन करें?",
        scan_next_item: "अपना कचरा स्कैन करें।",
        ask_wastewise: "हमसे पूछें"
      },
      vendors: {
        title: "कचरा लेने वाले",
        vendors_nearby: "आसपास के लोग",
        call_now: "📞 कॉल करें",
        directions: "📍 रास्ता देखें",
        loading: "खुल रहा है...",
        no_vendors: "कोई नहीं मिला।"
      },
      journey: {
        title: "आपका प्रभाव",
        subtitle: "अपना बदलाव देखें।",
        eco_footprint: "आपके अच्छे काम",
        trees_saved: "पेड़ बचाए",
        bottles_rescued: "बोतलें बचाईं",
        kg_diverted: "किलो कचरा बचाया",
        impact_points: "आपके अंक",
        progress: "आपकी प्रगति",
        progress_text: "आपने {{kg}} किलो कचरा बचाया है। ऐसे ही करते रहें!"
      },
      board: {
        your_rank: "आपकी रैंक",
        in_city: "शहर में",
        total_impact: "कुल प्रभाव",
        points: "अंक",
        top_savers: "सबसे अच्छे लोग",
        all_time: "अब तक",
        no_rankings: "कोई रैंक नहीं है। पहले बनें! 🌱",
        pts: "अंक",
        you: "आप",
        loading: "खुल रहा है..."
      },
      chat: {
        title: "WasteWise से पूछें 🤖",
        placeholder: "संदेश टाइप करें...",
        welcome: "नमस्ते! मैं खाद बनाने के टिप्स, कचरा निपटान मार्गदर्शन में मदद कर सकता हूँ। आप क्या जानना चाहेंगे?",
        tips: ["खाद बनाने के टिप्स", "मेरे पास ई-कचरा", "प्लास्टिक कम करें"],
        reply_compost: "खाद बनाने के लिए, 3 भाग भूरी सामग्री और 1 भाग हरी सामग्री का अनुपात बनाए रखें। 🌱",
        reply_ewaste: "ई-कचरे के लिए, मैं आपके स्थानीय नगरपालिका संग्रह की जाँच करने की सलाह देता हूँ। ♻️",
        reply_plastic: "प्लास्टिक कम करने के लिए, सिंगल-यूज आइटम से शुरुआत करें। दोबारा इस्तेमाल होने वाला बैग ले जाएं। 💪",
        reply_default: "उचित कचरा निपटान लैंडफिल कचरे को 60% तक कम कर सकता है। हर आइटम मायने रखता है! 🌍"
      },
      login: {
        welcome: "आपका स्वागत है",
        join_msg: "हमारे साथ जुड़ें।",
        google_btn: "Google से लॉगिन करें",
        guest_btn: "गेस्ट के रूप में आएं",
        disabled_msg: "Google लॉगिन बंद है।"
      },
      common: {
        loading: "खुल रहा है..."
      }
    }
  },
  kn: {
    translation: {
      nav: {
        home: "ಮನೆ",
        vendors: "ಮಾರಾಟಗಾರರು",
        scan: "ಕ್ಯಾಮರಾ",
        impact: "ಸ್ಕೋರ್",
        board: "ರ‍್ಯಾಂಕ್"
      },
      home: {
        good_morning: "ನಮಸ್ಕಾರ",
        good_afternoon: "ನಮಸ್ಕಾರ",
        good_evening: "ನಮಸ್ಕಾರ",
        making_diff: "ನೀವು ಉತ್ತಮ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೀರಿ!",
        daily_progress: "ಇಂದಿನ ಕೆಲಸ",
        items_sorted: "{{count}} ವಸ್ತುಗಳು ಸರಿಯಾಗಿವೆ.",
        prevented_kg: "ನೀವು ~{{kg}} ಕೆಜಿ ಕಸ ತಡೆದಿದ್ದೀರಿ",
        total_points: "ಒಟ್ಟು ಅಂಕಗಳು",
        impact_score: "ನಿಮ್ಮ ಸ್ಕೋರ್",
        recent_scans: "ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್",
        total: "ಒಟ್ಟು",
        trees_saved: "🌳 {{count}} ಮರಗಳು",
        bottles_rescued: "♻️ {{count}} ಬಾಟಲಿಗಳು",
        kg_diverted: "🗑️ {{count}} ಕೆಜಿ ಕಸ",
        start_sorting: "🌱 ಅಂಕ ಪಡೆಯಲು ಶುರು ಮಾಡಿ!",
        ready_to_sort: "ಕಸ ಸ್ಕ್ಯಾನ್ ಮಾಡಬೇಕೆ?",
        scan_next_item: "ನಿಮ್ಮ ಕಸ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
        ask_wastewise: "ನಮ್ಮನ್ನು ಕೇಳಿ"
      },
      vendors: {
        title: "ಕಸ ಸಂಗ್ರಹಿಸುವವರು",
        vendors_nearby: "ಹತ್ತಿರದವರು",
        call_now: "📞 ಕರೆ ಮಾಡಿ",
        directions: "📍 ದಾರಿ",
        loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        no_vendors: "ಯಾರು ಸಿಗಲಿಲ್ಲ."
      },
      journey: {
        title: "ನಿಮ್ಮ ಸಾಧನೆ",
        subtitle: "ನಿಮ್ಮ ಬದಲಾವಣೆ ನೋಡಿ.",
        eco_footprint: "ನಿಮ್ಮ ಒಳ್ಳೆಯ ಕೆಲಸ",
        trees_saved: "ಮರಗಳು",
        bottles_rescued: "ಬಾಟಲಿಗಳು",
        kg_diverted: "ಕೆಜಿ ಕಸ",
        impact_points: "ನಿಮ್ಮ ಅಂಕಗಳು",
        progress: "ನಿಮ್ಮ ಪ್ರಗತಿ",
        progress_text: "ನೀವು {{kg}} ಕೆಜಿ ಕಸ ಉಳಿಸಿದ್ದೀರಿ. ಹೀಗೆಯೇ ಮುಂದುವರಿಸಿ!"
      },
      board: {
        your_rank: "ನಿಮ್ಮ ರ‍್ಯಾಂಕ್",
        in_city: "ಊರಿನಲ್ಲಿ",
        total_impact: "ಒಟ್ಟು ಸಾಧನೆ",
        points: "ಅಂಕಗಳು",
        top_savers: "ಉತ್ತಮ ಜನರು",
        all_time: "ಇಲ್ಲಿಯವರೆಗೆ",
        no_rankings: "ಯಾವುದೇ ರ‍್ಯಾಂಕ್ ಇಲ್ಲ. ಮೊದಲಿಗರಾಗಿ! 🌱",
        pts: "ಅಂಕ",
        you: "ನೀವು",
        loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..."
      },
      chat: {
        title: "WasteWise ಅನ್ನು ಕೇಳಿ 🤖",
        placeholder: "ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...",
        welcome: "ನಮಸ್ಕಾರ! ಗೊಬ್ಬರ ಮಾಡುವ ಸಲಹೆಗಳು, ತ್ಯಾಜ್ಯ ವಿಲೇವಾರಿ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ. ನೀವು ಏನನ್ನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?",
        tips: ["ಗೊಬ್ಬರ ಮಾಡುವ ಸಲಹೆಗಳು", "ಹತ್ತಿರದ ಇ-ತ್ಯಾಜ್ಯ", "ಪ್ಲಾಸ್ಟಿಕ್ ಕಡಿಮೆ ಮಾಡಿ"],
        reply_compost: "ಪರಿಣಾಮಕಾರಿ ಗೊಬ್ಬರಕ್ಕಾಗಿ, 3 ಭಾಗ ಕಂದು ವಸ್ತು ಮತ್ತು 1 ಭಾಗ ಹಸಿರು ವಸ್ತುಗಳ ಅನುಪಾತವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ. 🌱",
        reply_ewaste: "ಇ-ತ್ಯಾಜ್ಯಕ್ಕಾಗಿ, ನಿಮ್ಮ ಸ್ಥಳೀಯ ಪುರಸಭೆ ಸಂಗ್ರಹಣಾ ಡ್ರೈವ್ ಅನ್ನು ಪರಿಶೀಲಿಸಲು ನಾನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ. ♻️",
        reply_plastic: "ಪ್ಲಾಸ್ಟಿಕ್ ಕಡಿತಕ್ಕೆ, ಏಕ-ಬಳಕೆಯ ವಸ್ತುಗಳೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ. ಮರುಬಳಕೆ ಮಾಡಬಹುದಾದ ಚೀಲ ಒಯ್ಯಿರಿ. 💪",
        reply_default: "ಸರಿಯಾದ ತ್ಯಾಜ್ಯ ವಿಲೇವಾರಿ ಲ್ಯಾಂಡ್‌ಫಿಲ್ ತ್ಯಾಜ್ಯವನ್ನು ಶೇಕಡಾ 60 ರಷ್ಟು ಕಡಿಮೆ ಮಾಡಬಹುದು. 🌍"
      },
      login: {
        welcome: "ಸ್ವಾಗತ",
        join_msg: "ನಮ್ಮೊಂದಿಗೆ ಸೇರಿ.",
        google_btn: "Google ಲಾಗಿನ್",
        guest_btn: "ಗೆಸ್ಟ್ ಆಗಿ ಬನ್ನಿ",
        disabled_msg: "Google ಲಾಗಿನ್ ಇಲ್ಲ."
      },
      common: {
        loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;