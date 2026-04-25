import os

filepath = r"c:\trispectra\Trispectra\frontend\src\App.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if "import { useTranslation }" not in content:
    content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { useTranslation } from 'react-i18next';")

# 2. Update HomeScreen
content = content.replace(
    "function HomeScreen({ onNav, lang, setLang, user, userStats }) {",
    "function HomeScreen({ onNav, user, userStats }) {\n  const { t, i18n } = useTranslation();"
)
content = content.replace("const t = T[lang] || T.en;", "")
content = content.replace(
    "className={`px-3 py-1.5 transition-colors ${lang === k ? 'bg-[#2d6a4f] text-white' : 'text-[#404943]'}`}",
    "className={`px-3 py-1.5 transition-colors ${i18n.language === k ? 'bg-[#2d6a4f] text-white' : 'text-[#404943]'}`}"
)
content = content.replace("onClick={() => setLang(k)}", "onClick={() => i18n.changeLanguage(k)}")
content = content.replace("{greetingKey}, {displayName}.", "{t('home.good_morning', {defaultValue: greetingKey})}, {displayName}.")
content = content.replace("{t.t}", "{t('home.making_diff')}")
content = content.replace("{t.d}", "{t('home.daily_progress')}")
content = content.replace("{t.r}", "{t('home.ready_to_sort')}")
content = content.replace("{t.s}", "{t('home.scan_next_item')}")
content = content.replace("{itemsDisposed} items properly sorted.", "{t('home.items_sorted', {count: itemsDisposed})}")

# 3. Update VendorsScreen
content = content.replace(
    "function VendorsScreen() {",
    "function VendorsScreen() {\n  const { t } = useTranslation();"
)
content = content.replace(">Collection Points<", ">{t('vendors.title')}<")
content = content.replace("📍 3 Vendors Nearby", "📍 3 {t('vendors.vendors_nearby')}")
content = content.replace(">Loading...<", ">{t('vendors.loading')}<")
content = content.replace(">No vendors found for this category.<", ">{t('vendors.no_vendors')}<")
content = content.replace(">📞 Call Now<", ">{t('vendors.call_now')}<")
content = content.replace(">📍 Directions<", ">{t('vendors.directions')}<")

# 4. Update BottomNav
content = content.replace(
    "function BottomNav({active,onNav}){",
    "function BottomNav({active,onNav}){\n  const { t } = useTranslation();"
)
content = content.replace(
    "const items=[{id:'home',i:'home',l:'Home'},{id:'vendors',i:'store',l:'Vendors'},{id:'scanner',i:'center_focus_strong',l:'Scan'},{id:'journey',i:'bar_chart',l:'Impact'},{id:'leaderboard',i:'leaderboard',l:'Board'}];",
    "const items=[{id:'home',i:'home',l:t('nav.home')},{id:'vendors',i:'store',l:t('nav.vendors')},{id:'scanner',i:'center_focus_strong',l:t('nav.scan')},{id:'journey',i:'bar_chart',l:t('nav.impact')},{id:'leaderboard',i:'leaderboard',l:t('nav.board')}];"
)

# 5. Update App component to pass useTranslation down, or remove lang state.
content = content.replace("const [lang, setLang] = useState('en');", "")
content = content.replace(
    "{scr === 'home' && <HomeScreen onNav={nav} lang={lang} setLang={setLang} user={user} userStats={userStats} />}",
    "{scr === 'home' && <HomeScreen onNav={nav} user={user} userStats={userStats} />}"
)

# 6. Update Login Screen
content = content.replace(
    "function LoginScreen({ onLogin }) {",
    "function LoginScreen({ onLogin }) {\n  const { t } = useTranslation();"
)
content = content.replace(">Welcome to the Journey<", ">{t('login.welcome')}<")
content = content.replace(">Join thousands making an impact today.<", ">{t('login.join_msg')}<")
content = content.replace(">Continue with Google<", ">{t('login.google_btn')}<")
content = content.replace(">Start as Guest<", ">{t('login.guest_btn')}<")
content = content.replace(">Google Login is disabled. Use Guest mode.<", ">{t('login.disabled_msg')}<")

# 7. Update Loading
content = content.replace(">Loading WasteWise...<", ">{t('common.loading')}<")


with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
